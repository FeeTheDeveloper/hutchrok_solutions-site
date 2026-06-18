import { PAID_SERVICES, type PaidService, type PaidServiceSlug } from "@/lib/paid-services";

/**
 * Sign-up promotion: new leads who sign up get 10% off marketing services.
 */
export const SIGNUP_DISCOUNT_RATE = 0.1; // 10%
export const SIGNUP_DISCOUNT_CODE = "WELCOME10";
export const SIGNUP_DISCOUNT_LABEL = "10% off";

/**
 * Which paid services count as "marketing services" eligible for the
 * sign-up discount. Compliance/ops setup is excluded — it's operational,
 * not marketing.
 */
export const MARKETING_SERVICE_SLUGS: PaidServiceSlug[] = [
  "business-website",
  "brand-identity-package",
  "logo-design",
  "business-email-setup",
  "domain-hosting",
];

export const MARKETING_SERVICES: PaidService[] = PAID_SERVICES.filter((s) =>
  MARKETING_SERVICE_SLUGS.includes(s.slug),
);

export function isMarketingService(slug: string): boolean {
  return MARKETING_SERVICE_SLUGS.includes(slug as PaidServiceSlug);
}

/** Apply the sign-up discount to an amount, rounded to the nearest dollar. */
export function applySignupDiscount(amount: number): number {
  return Math.round(amount * (1 - SIGNUP_DISCOUNT_RATE));
}

export function formatPrice(amount: number): string {
  return `$${amount.toLocaleString("en-US")}`;
}
