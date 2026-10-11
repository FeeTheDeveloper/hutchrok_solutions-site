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
   * Registered Agent stays disabled here until the
   * operational requirements (staffed TX registered-office address, Form
   * 401-A consent process) are complete — it remains waitlist-only.
   */
  checkoutEnabled: boolean;
}

export const STRIPE_PRICE_CATALOG: Record<ServiceRequestSlug, StripePriceCatalogEntry> = {
  "business-website": {
    priceId: "price_1UPPc9K9EdgEUYPNEjVHNIeR",
    mode: "payment",
    checkoutEnabled: true,
  },
  "brand-identity-package": {
    priceId: "price_1UPPc9K9EdgEUYPNGEVJtY8o",
    mode: "payment",
    checkoutEnabled: true,
  },
  "logo-design": {
    priceId: "price_1UPPcAK9EdgEUYPNuDpN8YIu",
    mode: "payment",
    checkoutEnabled: true,
  },
  "business-email-setup": {
    priceId: "price_1UPPcAK9EdgEUYPNOQf3mB1Q",
    mode: "payment",
    checkoutEnabled: true,
  },
  "domain-hosting": {
    priceId: "price_1UPPcBK9EdgEUYPNFVAXu2SE",
    mode: "payment",
    checkoutEnabled: true,
  },
  "compliance-ops-setup": {
    priceId: "price_1UPPcBK9EdgEUYPNbprh1lMs",
    mode: "payment",
    checkoutEnabled: true,
  },
  // Reconciled against Hutchrok account acct_1UP8e4K9EdgEUYPN.
  "launch-package": {
    priceId: "price_1UPPcBK9EdgEUYPN2omVNY24",
    mode: "payment",
    checkoutEnabled: true,
  },
  "registered-agent": {
    priceId: "",
    mode: "subscription",
    checkoutEnabled: false,
  },
};

export function getStripePriceCatalogEntry(
  serviceSlug: string,
): StripePriceCatalogEntry | null {
  return Object.hasOwn(STRIPE_PRICE_CATALOG, serviceSlug)
    ? STRIPE_PRICE_CATALOG[serviceSlug as ServiceRequestSlug]
    : null;
}
