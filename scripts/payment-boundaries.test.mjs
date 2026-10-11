import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { createRequire } from 'node:module';
const nodeRequire = createRequire(import.meta.url);

function webhook({ type = 'checkout.session.completed', status = 'paid', dbError = null, delivered = true, enabled = true } = {}) {
  const writes = [], signals = [];
  const event = { id: 'evt_verified', type, created: 1791735000, data: { object: {
    id: 'cs_verified', payment_status: status, mode: 'payment', customer: 'cus_verified',
    metadata: { clerk_user_id: 'user_owner', service_slug: 'business-website' },
    customer_details: { email: 'fixture@example.invalid' },
  } } };
  class Stripe { webhooks = { constructEvent: () => event }; }
  const modules = {
    stripe: Stripe,
    '@/lib/api-response': {
      ErrorCode: { INTERNAL_ERROR: 'INTERNAL_ERROR', BAD_REQUEST: 'BAD_REQUEST' },
      apiSuccess: (body, status = 200) => Response.json(body, { status }),
      apiError: (code, message, status) => Response.json({ code, message }, { status }),
    },
    '@/lib/supabase/server': { getSupabaseServer: () => ({ from: () => ({ upsert: async (row) => { writes.push(row); return { error: dbError }; } }) }) },
    '@/lib/os/bridge': { isOsBridgeEnabled: () => enabled, emitSiteSignal: async signal => { signals.push(signal); return delivered; } },
  };
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync('app/api/stripe/webhook/route.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  vm.runInNewContext(source, { exports, require: name => { if (!(name in modules)) throw Error(name); return modules[name]; }, process: { env: { STRIPE_SECRET_KEY: 'fixture', STRIPE_WEBHOOK_SECRET: 'fixture' } }, console: { log() {}, error() {} }, Date });
  return { run: () => exports.POST(new Request('https://www.hutchrok.com/api/stripe/webhook', { method: 'POST', headers: { 'stripe-signature': 'fixture' }, body: '{}' })), writes, signals };
}

test('unpaid completion does not announce payment or write a customer profile', async () => {
  const h = webhook({ status: 'unpaid' }); assert.equal((await h.run()).status, 200);
  assert.equal(h.writes.length, 0); assert.equal(h.signals.length, 0);
});
test('asynchronous success persists the customer and emits the paid signal', async () => {
  const h = webhook({ type: 'checkout.session.async_payment_succeeded' }); assert.equal((await h.run()).status, 200);
  assert.equal(h.writes.length, 1); assert.equal(h.signals[0]?.type, 'payment.completed');
});
test('profile persistence failure asks Stripe to retry', async () => {
  const h = webhook({ dbError: { message: 'unavailable' } }); assert.equal((await h.run()).status, 503); assert.equal(h.signals.length, 0);
});
test('configured OS delivery failure is not acknowledged as success', async () => {
  const h = webhook({ delivered: false }); assert.equal((await h.run()).status, 503);
});
test('unconfigured OS does not prevent the durable profile write', async () => {
  const h = webhook({ enabled: false, delivered: false }); assert.equal((await h.run()).status, 200); assert.equal(h.writes.length, 1);
});
test('completion and asynchronous success share the same paid-effect identity', async () => {
  const a = webhook(), b = webhook({ type: 'checkout.session.async_payment_succeeded' }); await a.run(); await b.run();
  assert.equal(a.signals[0]?.signalId, 'stripe:checkout:cs_verified:paid'); assert.equal(a.signals[0]?.signalId, b.signals[0]?.signalId);
});

function loadTs(file, modules, env = {}) {
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  const require = name => {
    if (name in modules) return modules[name];
    if (name.startsWith('@/')) return loadTs(name.slice(2) + '.ts', modules, env);
    return nodeRequire(name);
  };
  vm.runInNewContext(source, { exports, require, process: { env }, console: { log() {}, error() {} }, URL, Date, Response });
  return exports;
}

function checkout({ userId = 'user_owner', accountId = 'acct_1UP8e4K9EdgEUYPN', amount = 30000 } = {}) {
  const sessions = [];
  class Stripe {
    accounts = { retrieve: async () => ({ id: accountId }) };
    prices = { retrieve: async () => ({ active: true, livemode: true, product: { active: true }, unit_amount: amount, currency: 'usd', recurring: null }) };
    checkout = { sessions: { create: async (params, options) => { sessions.push({ params, options }); return { id: 'cs_fixture', url: 'https://checkout.stripe.com/c/pay/fixture' }; } } };
  }
  const { POST } = loadTs('app/api/stripe/checkout/route.ts', {
    stripe: Stripe,
    '@/lib/supabase/server': {},
    '@/lib/api-response': {
      ErrorCode: {},
      apiSuccess: (body, status = 200) => Response.json(body, { status }),
      apiError: (code, message, status) => Response.json({ code, message }, { status }),
    },
    '@clerk/nextjs/server': { auth: async () => ({ userId }), currentUser: async () => ({ primaryEmailAddress: { emailAddress: 'fixture@example.invalid', verification: { status: 'verified' } } }) },
  }, { STRIPE_SECRET_KEY: 'fixture', NEXT_PUBLIC_SITE_URL: 'https://www.hutchrok.com' });
  return { sessions, run: (serviceSlug = 'business-website', requestId = '12345678-1234-4234-8234-123456789abc', origin = 'https://www.hutchrok.com') => POST(new Request('https://spoofed.invalid/api/stripe/checkout', { method: 'POST', headers: { origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ serviceSlug, requestId, amount: 1, priceId: 'price_attacker' }) })) };
}

test('checkout requires authentication before contacting Stripe', async () => {
  const h = checkout({ userId: null }); assert.equal((await h.run()).status, 401); assert.equal(h.sessions.length, 0);
});
test('checkout refuses a different Stripe account or mismatched amount', async () => {
  for (const input of [{ accountId: 'acct_other' }, { amount: 1 }]) { const h = checkout(input); assert.equal((await h.run()).status, 500); assert.equal(h.sessions.length, 0); }
});
test('checkout rejects foreign origins, unknown services, waitlisted services and malformed attempt IDs', async () => {
  const h = checkout();
  assert.equal((await h.run('business-website', undefined, 'https://attacker.invalid')).status, 403);
  assert.equal((await h.run('__proto__')).status, 400);
  assert.equal((await h.run('registered-agent')).status, 400);
  assert.equal((await h.run('business-website', 'invalid')).status, 400);
  assert.equal(h.sessions.length, 0);
});
test('checkout ignores client amounts, uses the canonical origin and repeats a user-scoped idempotency key', async () => {
  const a = checkout(), b = checkout({ userId: 'user_other' });
  assert.equal((await a.run()).status, 200); await a.run(); await b.run();
  assert.equal(a.sessions[0].params.line_items[0].price, 'price_1UPPc9K9EdgEUYPNEjVHNIeR');
  assert.equal(a.sessions[0].params.success_url, 'https://www.hutchrok.com/dashboard?checkout=success');
  assert.equal(a.sessions[0].options.idempotencyKey, a.sessions[1].options.idempotencyKey);
  assert.notEqual(a.sessions[0].options.idempotencyKey, b.sessions[0].options.idempotencyKey);
});

test('server Supabase operations fail closed when the server secret is absent', () => {
  const { getSupabaseServer } = loadTs('lib/supabase/server.ts', { 'server-only': {}, '@/lib/config': { getConfig: () => ({ supabaseSecretKey: '' }) } });
  assert.throws(getSupabaseServer, /SUPABASE_SECRET_KEY/);
});

test('the actual Supabase SDK sends the server secret rather than the public key', async () => {
  const originalFetch = globalThis.fetch;
  let usedKey;
  globalThis.fetch = async (_url, options) => { usedKey = new Headers(options.headers).get('apikey'); return Response.json([]); };
  try {
    const { getSupabaseServer } = loadTs('lib/supabase/server.ts', { 'server-only': {}, '@/lib/config': { getConfig: () => ({ supabaseUrl: 'https://fixture.supabase.co', supabaseSecretKey: 'sb_secret_fixture', supabasePublishableKey: 'sb_publishable_fixture' }) } });
    await getSupabaseServer().from('client_profiles').select('id');
    assert.equal(usedKey, 'sb_secret_fixture');
  } finally { globalThis.fetch = originalFetch; }
});
