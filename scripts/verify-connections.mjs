#!/usr/bin/env node
/**
 * Connection check for every external service this site talks to.
 *
 *   node scripts/verify-connections.mjs      (or: npm run verify:connections)
 *
 * Reads .env.local, confirms the required variables are present, then makes one
 * read-only API call per provider. Nothing is written anywhere. Secrets are
 * never printed — only the identifiers each provider echoes back.
 *
 * Exit code 1 if any required variable is missing or any live check fails.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { lookup } from "node:dns/promises";

// ── .env.local loader (keeps this script dependency-free) ──

function loadEnvFile(file) {
  if (!existsSync(file)) return;
  for (const raw of readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    const quoted =
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"));
    if (quoted) value = value.slice(1, -1);
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile(resolve(process.cwd(), ".env.local"));

// Must stay in sync with ENV_VARS.required in lib/config.ts.
const REQUIRED = [
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SECRET_KEY",
  "ADMIN_TOKEN",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
];

// ── output helpers ──

const results = [];

function record(service, ok, detail) {
  results.push({ service, ok, detail });
  console.log(`${ok ? "  OK  " : " FAIL "} ${service.padEnd(16)} ${detail}`);
}

async function json(url, init) {
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(15_000) });
  let body = null;
  try {
    body = await res.json();
  } catch {
    // non-JSON response
  }
  return { status: res.status, ok: res.ok, body };
}

// ── checks ──

async function checkSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    record("supabase", false, "SUPABASE_URL / SUPABASE_ANON_KEY not set");
    return;
  }

  const health = await json(`${url}/auth/v1/health`, { headers: { apikey: key } });
  if (!health.ok) {
    record("supabase", false, `auth health HTTP ${health.status}`);
    return;
  }

  const ref = new URL(url).hostname.split(".")[0];
  const secret = process.env.SUPABASE_SECRET_KEY
    ? "secret key set"
    : "SUPABASE_SECRET_KEY MISSING";
  record("supabase", Boolean(process.env.SUPABASE_SECRET_KEY), `project ${ref} · GoTrue ${health.body?.version ?? "?"} · ${secret}`);
}

async function checkStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    record("stripe", false, "STRIPE_SECRET_KEY not set");
    return;
  }

  const headers = { Authorization: `Bearer ${key}` };
  const account = await json("https://api.stripe.com/v1/account", { headers });
  if (!account.ok) {
    record("stripe", false, `account HTTP ${account.status}: ${account.body?.error?.message ?? ""}`);
    return;
  }

  const mode = key.startsWith("sk_live_") ? "live" : "test";
  const hooks = await json("https://api.stripe.com/v1/webhook_endpoints?limit=100", { headers });
  const matching = (hooks.body?.data ?? []).filter((e) =>
    e.url === "https://www.hutchrok.com/api/stripe/webhook" && e.status === "enabled",
  );
  if (account.body.id !== "acct_1UP8e4K9EdgEUYPN") {
    record("stripe", false, "Stripe account does not match Hutchrok");
    return;
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    record(
      "stripe",
      false,
      `${account.body.id} (${mode}) reachable · STRIPE_WEBHOOK_SECRET MISSING · ` +
        `${matching.length} endpoint(s) on /api/stripe/webhook`,
    );
    return;
  }
  if (matching.length === 0) {
    record(
      "stripe",
      false,
      `${account.body.id} (${mode}) reachable · no webhook endpoint points at /api/stripe/webhook`,
    );
    return;
  }
  record("stripe", true, `${account.body.id} (${mode}) · webhook ${matching[0].url} [${matching[0].status}]`);
}

async function checkClerk() {
  const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const sk = process.env.CLERK_SECRET_KEY;
  if (!pk || !sk) {
    record("clerk", false, "publishable or secret key not set");
    return;
  }

  const instance = await json("https://api.clerk.com/v1/instance", {
    headers: { Authorization: `Bearer ${sk}` },
  });
  if (!instance.ok) {
    record("clerk", false, `instance HTTP ${instance.status}`);
    return;
  }

  // The publishable key encodes the Frontend API host the browser loads
  // Clerk.js from. If that host has no DNS, sign-in cannot work anywhere.
  let host = "";
  try {
    host = Buffer.from(pk.replace(/^pk_(test|live)_/, ""), "base64")
      .toString("utf8")
      .replace(/\$$/, "");
  } catch {
    // leave host empty
  }

  let dns = "host not decodable from publishable key";
  let dnsOk = false;
  if (host) {
    try {
      const { address } = await lookup(host);
      dns = `frontend API ${host} → ${address}`;
      dnsOk = true;
    } catch {
      dns = `frontend API ${host} does NOT resolve`;
    }
  }

  record("clerk", dnsOk, `${instance.body.id} (${instance.body.environment_type}) · ${dns}`);
}

async function checkCloudflare() {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const account = process.env.CLOUDFLARE_ACCOUNT_ID;
  if (!token || !account) {
    record("cloudflare", false, "CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID not set");
    return;
  }
  const headers = { Authorization: `Bearer ${token}` };

  const acct = await json(`https://api.cloudflare.com/client/v4/accounts/${account}`, { headers });
  if (!acct.ok) {
    record(
      "cloudflare",
      false,
      `account HTTP ${acct.status}: ${acct.body?.errors?.[0]?.message ?? ""}`,
    );
    return;
  }

  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  let zoneNote = "CLOUDFLARE_ZONE_ID not set";
  if (zoneId) {
    const zone = await json(`https://api.cloudflare.com/client/v4/zones/${zoneId}`, { headers });
    zoneNote = zone.ok
      ? `zone ${zone.body.result.name} ${zone.body.result.status}`
      : `zone HTTP ${zone.status}`;
  }
  record("cloudflare", true, `account ${account.slice(0, 8)}… · ${zoneNote}`);

  // Case documents use Supabase Storage. An unused R2 product is not a site outage.
  if (!process.env.R2_BUCKET) return;

  // R2 is reported separately: the credentials can be present while the
  // product itself is still switched off on the account.
  const r2 = await json(`https://api.cloudflare.com/client/v4/accounts/${account}/r2/buckets`, {
    headers,
  });
  if (r2.ok) {
    const names = (r2.body.result?.buckets ?? []).map((b) => b.name);
    record("cloudflare r2", true, names.length ? `buckets: ${names.join(", ")}` : "no buckets yet");
  } else {
    record(
      "cloudflare r2",
      false,
      `HTTP ${r2.status}: ${r2.body?.errors?.[0]?.message ?? "unavailable"}`,
    );
  }
}

// ── run ──

console.log("\nRequired environment variables");
const missing = REQUIRED.filter((name) => !process.env[name]);
for (const name of REQUIRED) {
  console.log(`${process.env[name] ? "  OK  " : " MISS "} ${name}`);
}

console.log("\nLive connection checks");
await checkSupabase();
await checkStripe();
await checkClerk();
await checkCloudflare();

const failed = results.filter((r) => !r.ok);
console.log(
  `\n${results.length - failed.length}/${results.length} live checks passed` +
    (missing.length ? ` · ${missing.length} required var(s) missing` : ""),
);
if (failed.length || missing.length) {
  console.log(`Needs attention: ${[...missing, ...failed.map((f) => f.service)].join(", ")}`);
  process.exit(1);
}
