export type PaidServiceSlug =
  | "business-website"
  | "brand-identity-package"
  | "logo-design"
  | "business-email-setup"
  | "domain-hosting"
  | "compliance-ops-setup";

export interface PaidService {
  slug: PaidServiceSlug;
  title: string;
  description: string;
  tag: string;
  startingPrice: number;
  features: string[];
  primaryCtaLabel: string;
  secondaryCtaLabel?: string;
}

export const PAID_SERVICES: PaidService[] = [
  {
    slug: "business-website",
    title: "Business Website",
    description:
      "A professional, mobile-ready website built for your new LLC and designed to convert visitors into customers.",
    tag: "Web Development",
    startingPrice: 500,
    features: [
      "Custom responsive design",
      "Mobile-first build",
      "SEO-ready structure",
      "Contact forms and lead capture",
      "Hosting setup included",
    ],
    primaryCtaLabel: "Start Checkout Intake",
    secondaryCtaLabel: "Talk to an Operator",
  },
  {
    slug: "brand-identity-package",
    title: "Brand Identity Package",
    description:
      "Complete visual identity including color palette, typography, and brand guidelines for a cohesive look.",
    tag: "Branding",
    startingPrice: 300,
    features: [
      "Color palette and typography system",
      "Brand guidelines document",
      "Business card design",
      "Social media templates",
      "Brand asset library",
    ],
    primaryCtaLabel: "Request Brand Package",
    secondaryCtaLabel: "Ask Questions",
  },
  {
    slug: "logo-design",
    title: "Logo Design",
    description:
      "A custom logo that represents your business and makes a strong first impression across all materials.",
    tag: "Design",
    startingPrice: 150,
    features: [
      "Custom logo concepts",
      "Multiple revision rounds",
      "All file formats (SVG, PNG, PDF)",
      "Light and dark variations",
      "Brand mark + wordmark",
    ],
    primaryCtaLabel: "Book Logo Design",
    secondaryCtaLabel: "Speak With Hutchrok",
  },
  {
    slug: "business-email-setup",
    title: "Business Email Setup",
    description:
      "Professional email (you@yourbusiness.com) configured and ready to use from day one.",
    tag: "Email",
    startingPrice: 100,
    features: [
      "Custom domain email",
      "Google Workspace or Microsoft 365",
      "Email signature design",
      "SPF/DKIM/DMARC configuration",
      "Migration assistance",
    ],
    primaryCtaLabel: "Request Email Setup",
    secondaryCtaLabel: "Contact Sales",
  },
  {
    slug: "domain-hosting",
    title: "Domain + Hosting",
    description:
      "Domain registration and reliable hosting setup so your business is live and accessible online.",
    tag: "Infrastructure",
    startingPrice: 125,
    features: [
      "Domain name registration",
      "SSL certificate setup",
      "Reliable cloud hosting",
      "DNS configuration",
      "Performance monitoring",
    ],
    primaryCtaLabel: "Start Hosting Setup",
    secondaryCtaLabel: "Get Help Choosing",
  },
  {
    slug: "compliance-ops-setup",
    title: "Compliance & Ops Setup",
    description:
      "EIN coordination, operating agreements, registered agent support, and compliance calendar setup.",
    tag: "Operations",
    startingPrice: 225,
    features: [
      "EIN application coordination",
      "Operating agreement drafting assistance",
      "Registered agent service",
      "Compliance calendar",
      "Annual report tracking",
    ],
    primaryCtaLabel: "Book Compliance Setup",
    secondaryCtaLabel: "See How It Works",
  },
];

export const PAID_SERVICE_BY_SLUG: Record<PaidServiceSlug, PaidService> =
  PAID_SERVICES.reduce(
    (acc, service) => {
      acc[service.slug] = service;
      return acc;
    },
    {} as Record<PaidServiceSlug, PaidService>
  );

export function formatStartingPrice(amount: number): string {
  return `Starting at $${amount.toLocaleString("en-US")}`;
}
