export type MembershipTierSlug = "operator" | "growth" | "command";

export interface MembershipTier {
  slug: MembershipTierSlug;
  name: string;
  monthlyPrice: number;
  priceLabel: string;
  tagline: string;
  filingAllowance: string;
  internalPrepTarget: string;
  serviceDiscount: string;
  featured?: boolean;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
}

/**
 * Hutchrok membership entitlements.
 *
 * IMPORTANT:
 * - Filing allowances describe Hutchrok preparation/submission service benefits.
 * - Government filing fees are separate unless waived by an applicable agency program.
 * - Internal preparation targets begin only after Hutchrok has received complete,
 *   accurate intake information and all required supporting documents.
 * - Government processing/approval times are controlled by the applicable agency.
 */
export const MEMBERSHIP_TIERS: MembershipTier[] = [
  {
    slug: "operator",
    name: "Operator",
    monthlyPrice: 59,
    priceLabel: "$59/mo",
    tagline: "For veterans building their first operating company.",
    filingAllowance: "1 included Hutchrok filing service every 12 months",
    internalPrepTarget: "Standard queue · target 7–10 business days",
    serviceDiscount: "10% subscriber discount on eligible add-on services",
    features: [
      "Included filing preparation/submission service up to tier allowance",
      "Veteran filing eligibility and document-readiness review",
      "Member dashboard and filing status tracking",
      "Compliance calendar and annual deadline reminders",
      "Veteran Intelligence: business, benefits, funding and opportunity updates",
      "Subscriber pricing on eligible Hutchrok services",
    ],
    ctaLabel: "Join Operator",
    ctaHref: "/sign-up?plan=operator",
  },
  {
    slug: "growth",
    name: "Growth",
    monthlyPrice: 129,
    priceLabel: "$129/mo",
    tagline: "For owners actively launching, structuring and scaling.",
    filingAllowance: "2 included Hutchrok filing services every 12 months",
    internalPrepTarget: "Priority queue · target 3–5 business days",
    serviceDiscount: "15% subscriber discount on eligible add-on services",
    featured: true,
    features: [
      "Everything in Operator",
      "Two included filing preparation/submission services per membership year",
      "Priority internal document preparation queue",
      "Quarterly business structure and compliance review",
      "Business-credit readiness roadmap and vendor-stack guidance",
      "Federal contracting readiness and certification guidance",
      "Quarterly strategy session",
    ],
    ctaLabel: "Join Growth",
    ctaHref: "/sign-up?plan=growth",
  },
  {
    slug: "command",
    name: "Command",
    monthlyPrice: 249,
    priceLabel: "$249/mo",
    tagline: "For multi-entity operators who want Hutchrok in the command seat.",
    filingAllowance: "4 included Hutchrok filing services every 12 months",
    internalPrepTarget: "Front-of-queue · target 1–2 business days",
    serviceDiscount: "20% subscriber discount on eligible add-on services",
    features: [
      "Everything in Growth",
      "Four included filing preparation/submission services per membership year",
      "Front-of-queue internal preparation after complete intake",
      "Monthly strategy and execution session",
      "Multi-entity compliance and operating-structure review",
      "Federal opportunity, certification and bid-readiness support",
      "Business credit, digital infrastructure and automation advisory",
      "Priority support routing",
    ],
    ctaLabel: "Join Command",
    ctaHref: "/sign-up?plan=command",
  },
];

export const MEMBERSHIP_DISCLAIMER =
  "Included filing benefits cover Hutchrok preparation and submission services up to the active tier allowance. Government filing fees are separate unless waived by an applicable government program. Hutchrok preparation targets begin after complete intake and required documents are received; government processing and approval times are controlled by the relevant agency.";
