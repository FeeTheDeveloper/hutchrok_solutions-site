import type { ServiceRequestSlug } from "@/lib/paid-services";

/**
 * Server-side Stripe price catalog.
 *
 * The browser only ever submits a `serviceSlug` — the Stripe Price ID and
 * Checkout mode are always resolved here, server-side. Never accept a price
 * or amount from the client.
 */

export type StripeCheckoutMode = "payment" | "subscription";

export interface StripePriceCatalogEntry {
  /** Live Stripe Price ID for this service. */
  priceId: string;
  /** Stripe Checkout mode — "payment" for one-time services, "subscription" for recurring. */
  mode: StripeCheckoutMode;
  /**
   * Whether this service can currently be purchased through Stripe Checkout.
   * Registered Agent stays wired up in Stripe but disabled here until the
   * operational requirements (staffed TX registered-office address, Form
   * 401-A consent process) are complete — it remains waitlist-only.
   */
  checkoutEnabled: boolean;
}

export const STRIPE_PRICE_CATALOG: Record<ServiceRequestSlug, StripePriceCatalogEntry> = {
  "business-website": {
    priceId: "price_1U2JhgDFTET1QGPEZWbAggCD",
    mode: "payment",
    checkoutEnabled: true,
  },
  "brand-identity-package": {
    priceId: "price_1U2JifDFTET1QGPEypMb0H5N",
    mode: "payment",
    checkoutEnabled: true,
  },
  "logo-design": {
    priceId: "price_1U2JjYDFTET1QGPEimITUhto",
    mode: "payment",
    checkoutEnabled: true,
  },
  "business-email-setup": {
    priceId: "price_1U2JkpDFTET1QGPErYE56q6c",
    mode: "payment",
    checkoutEnabled: true,
  },
  "domain-hosting": {
    priceId: "price_1U2Jm0DFTET1QGPEwa5ca4qX",
    mode: "payment",
    checkoutEnabled: true,
  },
  "compliance-ops-setup": {
    priceId: "price_1U2JnCDFTET1QGPEU8maLAuC",
    mode: "payment",
    checkoutEnabled: true,
  },
  // A live Launch Package price has not been created in the connected
  // Hutchrok Stripe account yet. Keep the legacy mapping disabled so the
  // site cannot create a Checkout Session against a price from another account.
  "launch-package": {
    priceId: "price_1TyP2MHPynHEHcqhrMIvMNj0",
    mode: "payment",
    checkoutEnabled: false,
  },
  "registered-agent": {
    priceId: "price_1TyP2RHPynHEHcqhiGtyptxE",
    mode: "subscription",
    checkoutEnabled: false,
  },
};

export function getStripePriceCatalogEntry(
  serviceSlug: string,
): StripePriceCatalogEntry | null {
  return STRIPE_PRICE_CATALOG[serviceSlug as ServiceRequestSlug] ?? null;
}
