/**
 * Launch Path offers — the revenue architecture of the homepage.
 *
 * Three tiers:
 *  1. Free Filing        — $0 acquisition front door (loss leader)
 *  2. Launch Package     — bundled one-time launch offer (primary revenue)
 *  3. Registered Agent   — annual recurring service (LTV engine)
 */

export type LaunchOfferSlug = "free-filing" | "launch-package" | "registered-agent";

export interface LaunchOffer {
  slug: LaunchOfferSlug;
  /** Mono field-label shown above the card title, e.g. "$0 — THE FILING" */
  fieldLabel: string;
  title: string;
  price: string;
  priceNote: string;
  description: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  featured?: boolean;
}

export const LAUNCH_OFFERS: LaunchOffer[] = [
  {
    slug: "free-filing",
    fieldLabel: "THE FILING",
    title: "Free Texas LLC Filing",
    price: "$0",
    priceNote: "for qualified veterans",
    description:
      "Your Certificate of Formation, prepared and filed with the Texas SOS. TVC verification guidance included. No filing fees, no service fees, no obligations.",
    features: [
      "Eligibility check and TVC verification guidance",
      "Certificate of Formation (Form 205) prepared for you",
      "Human review on every filing — never auto-submitted",
      "Filed with the Texas Secretary of State",
      "$300 SOS fee waived through the veteran program",
    ],
    ctaLabel: "Start My Free Filing",
    ctaHref: "/free-filing",
  },
  {
    slug: "launch-package",
    fieldLabel: "THE LAUNCH",
    title: "Veteran Launch Package",
    price: "$750",
    priceNote: "one-time · $875 value",
    description:
      "Everything your new LLC needs to look open for business on day one — bundled, built by the same team that filed your formation.",
    features: [
      "Professional logo set (web, social, print)",
      "One-page business website, mobile-first and SEO-ready",
      "Business email with proper security records",
      "Domain and hosting, set up clean",
      "Launch-day checklist reviewed with you 1-on-1",
    ],
    ctaLabel: "Reserve My Launch Package",
    ctaHref: "/service-request?service=launch-package",
    featured: true,
  },
  {
    slug: "registered-agent",
    fieldLabel: "THE GUARD",
    title: "Registered Agent Service",
    price: "$119/yr",
    priceNote: "cancel anytime",
    description:
      "Every Texas LLC is required to maintain a registered agent. Let Hutchrok stand post — we receive your legal and state mail and alert you same-day.",
    features: [
      "Texas street address for your LLC's registered office",
      "Same-day scan and alert on legal documents",
      "Annual franchise tax and report reminders",
      "Keeps your home address off public record",
      "Compliance calendar for your first year",
    ],
    ctaLabel: "Add Registered Agent",
    ctaHref: "/service-request?service=registered-agent",
  },
];
