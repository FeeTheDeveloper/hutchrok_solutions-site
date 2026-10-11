/** Hutchrok-only reconciliation. Read-only unless --apply is explicitly supplied. */
import Stripe from "stripe";
import { mkdirSync, writeFileSync } from "node:fs";

const accountId = "acct_1UP8e4K9EdgEUYPN";
const offers = [
  ["business-website", "Business Website", 30000],
  ["brand-identity-package", "Brand Identity Package", 18000],
  ["logo-design", "Logo Design", 9000],
  ["business-email-setup", "Business Email Setup", 6000],
  ["domain-hosting", "Domain + Hosting", 7500],
  ["compliance-ops-setup", "Compliance & Ops Setup", 13500],
  ["launch-package", "Veteran Launch Package", 45000],
  ["operator", "Hutchrok Operator Membership", 5900, "month"],
  ["growth", "Hutchrok Growth Membership", 12900, "month"],
  ["command", "Hutchrok Command Membership", 24900, "month"],
];

if (!process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_")) {
  throw new Error("This reconciliation requires the verified Hutchrok live key.");
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const account = await stripe.accounts.retrieve();
if (account.id !== accountId) throw new Error("Refusing to modify a different Stripe account.");
const apply = process.argv.includes("--apply");
const mapped = {};
for (const [slug, name, amount, interval] of offers) {
  const lookupKey = `hutchrok_${slug.replaceAll("-", "_")}_usd_${amount}_${interval ?? "once"}`;
  const existing = await stripe.prices.list({ lookup_keys: [lookupKey], limit: 2 });
  if (existing.data.length > 1) throw new Error(`Ambiguous lookup key: ${slug}`);
  let price = existing.data[0];
  if (!price && apply) {
    price = await stripe.prices.create({
      currency: "usd", unit_amount: amount, lookup_key: lookupKey,
      product_data: { name, metadata: { service_slug: slug, tenant: "hutchrok" } },
      metadata: { service_slug: slug, tenant: "hutchrok" },
      ...(interval ? { recurring: { interval } } : {}),
    }, { idempotencyKey: `hutchrok-catalog-v1:${lookupKey}` });
  }
  if (price && (!price.active || !price.livemode || price.currency !== "usd" ||
    price.unit_amount !== amount || (price.recurring?.interval ?? null) !== (interval ?? null))) {
    throw new Error(`Existing price does not match the published offer: ${slug}`);
  }
  mapped[slug] = price ? { priceId: price.id, amount, interval: interval ?? null } : null;
  console.log(JSON.stringify({ slug, amount, interval: interval ?? null, priceId: price?.id ?? null, status: price ? "verified" : "missing" }));
}
if (apply) {
  mkdirSync(".vercel/production-repair", { recursive: true });
  writeFileSync(".vercel/production-repair/stripe-catalog.json", JSON.stringify({ accountId, mapped }, null, 2));
}
