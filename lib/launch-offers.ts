/**
 * Launch Path offers — membership-first revenue architecture.
 *
 * Filings are a subscriber benefit. Government filing fees remain separate
 * unless waived by an applicable government program.
 */

export type LaunchOfferSlug = "membership" | "launch-package" | "registered-agent";

export interface LaunchOffer {
  slug: LaunchOfferSlug;
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
    slug: "membership",
    fieldLabel: "THE ACCESS",
    title: "Hutchrok Membership",
    price: "$59+",
    priceNote: "per month",
    description:
      "Membership unlocks Hutchrok filing services, member tracking, compliance support, veteran intelligence, and subscriber pricing. Filing limits and internal preparation priority scale with your tier.",
    features: [
      "Active subscription required for Hutchrok filing services",
      "Included filing preparation/submission benefits by tier",
      "Tier-based internal preparation priority",
      "Veteran business, benefits, funding and opportunity updates",
      "Compliance reminders and member dashboard access",
    ],
    ctaLabel: "Compare Memberships",
    ctaHref: "/membership",
    featured: true,
  },
  {
    slug: "launch-package",
    fieldLabel: "THE LAUNCH",
    title: "Business Launch Services",
    price: "Member Pricing",
    priceNote: "subscriber discounts apply",
    description:
      "Move beyond formation with the infrastructure required to look, operate and sell like a real company — digital presence, business systems, branding, credit readiness and compliance support.",
    features: [
      "Websites, domains and business email infrastructure",
      "Brand identity, logos and launch assets",
      "Business-credit readiness and vendor-stack guidance",
      "Federal contracting and certification preparation",
      "Automation, workflow and operational consulting",
    ],
    ctaLabel: "Explore Services",
    ctaHref: "/services",
  },
  {
    slug: "registered-agent",
    fieldLabel: "THE GUARD",
    title: "Registered Agent & Compliance",
    price: "Available",
    priceNote: "subject to service availability",
    description:
      "Registered-agent and compliance support fit inside the broader member operating system. Availability, eligibility and pricing are confirmed before activation.",
    features: [
      "Registered-agent service where operationally available",
      "Legal/state mail routing and alerts",
      "Compliance calendars and recurring reminders",
      "Entity maintenance support",
      "Member service discounts by tier",
    ],
    ctaLabel: "Request Service",
    ctaHref: "/service-request?service=registered-agent",
  },
];
