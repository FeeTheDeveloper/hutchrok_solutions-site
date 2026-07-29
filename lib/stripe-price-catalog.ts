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
    priceId: "price_1TyP0mHPynHEHcqh27IOySvp",
    mode: "payment",
    checkoutEnabled: true,
  },
  "brand-identity-package": {
    priceId: "price_1TyP1jHPynHEHcqhWOjlyMNx",
    mode: "payment",
    checkoutEnabled: true,
  },
  "logo-design": {
    priceId: "price_1TyP1qHPynHEHcqhl16vLuPQ",
    mode: "payment",
    checkoutEnabled: true,
  },
  "business-email-setup": {
    priceId: "price_1TyP1uHPynHEHcqhjFiBtv1A",
    mode: "payment",
    checkoutEnabled: true,
  },
  "domain-hosting": {
    priceId: "price_1TyP24HPynHEHcqhAFXqbu15",
    mode: "payment",
    checkoutEnabled: true,
  },
  "compliance-ops-setup": {
    priceId: "price_1TyP2HHPynHEHcqhdNVir2eI",
    mode: "payment",
    checkoutEnabled: true,
  },
  "launch-package": {
    priceId: "price_1TyP2MHPynHEHcqhrMIvMNj0",
    mode: "payment",
    checkoutEnabled: true,
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
