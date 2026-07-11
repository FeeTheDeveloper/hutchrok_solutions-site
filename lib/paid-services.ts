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
  secondaryCtaHref?: string;
}

export const PAID_SERVICES: PaidService[] = [
  {
    slug: "business-website",
    title: "Business Website",
    description:
      "Launch with a conversion-ready website that makes your new business look established from day one.",
    tag: "Web Development",
    startingPrice: 500,
    features: [
      "Custom responsive design",
      "Mobile-first build",
      "SEO-ready structure",
      "Contact forms and lead capture",
      "Hosting setup included",
    ],
    primaryCtaLabel: "Start Website Intake",
    secondaryCtaLabel: "Ask a Question",
    secondaryCtaHref: "mailto:contact@hutchrok.com?subject=Business%20Website%20Question",
  },
  {
    slug: "brand-identity-package",
    title: "Brand Identity Package",
    description:
      "Build a complete brand system so your LLC looks polished, credible, and consistent everywhere customers find you.",
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
    secondaryCtaLabel: "Talk to Hutchrok",
    secondaryCtaHref: "mailto:contact@hutchrok.com?subject=Brand%20Identity%20Package%20Question",
  },
  {
    slug: "logo-design",
    title: "Logo Design",
    description:
      "Get a professional logo set built for websites, social, print, and every launch asset you need.",
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
    secondaryCtaLabel: "Email the Team",
    secondaryCtaHref: "mailto:contact@hutchrok.com?subject=Logo%20Design%20Question",
  },
  {
    slug: "business-email-setup",
    title: "Business Email Setup",
    description:
      "Set up professional email with the right security records so you can communicate like a real company immediately.",
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
    secondaryCtaLabel: "Ask Setup Questions",
    secondaryCtaHref: "mailto:contact@hutchrok.com?subject=Business%20Email%20Setup%20Question",
  },
  {
    slug: "domain-hosting",
    title: "Domain + Hosting",
    description:
      "Secure your domain and hosting stack with a clean setup that keeps your business online and reliable.",
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
    secondaryCtaLabel: "Get Advice",
    secondaryCtaHref: "mailto:contact@hutchrok.com?subject=Domain%20and%20Hosting%20Question",
  },
  {
    slug: "compliance-ops-setup",
    title: "Compliance & Ops Setup",
    description:
      "Put legal and operational guardrails in place early so you can grow without cleanup later.",
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
    secondaryCtaLabel: "Speak to Operations",
    secondaryCtaHref: "mailto:contact@hutchrok.com?subject=Compliance%20and%20Ops%20Setup%20Question",
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

export const PAID_SERVICE_ICON = {
  "business-website": "Globe",
  "brand-identity-package": "Palette",
  "logo-design": "PenTool",
  "business-email-setup": "Mail",
  "domain-hosting": "Server",
  "compliance-ops-setup": "FileText",
} as const;

export function formatStartingPrice(amount: number): string {
  return `Starting at $${amount.toLocaleString("en-US")}`;
}

// ── Service-request-only offers (bundles / recurring) ──
// Selectable in the service-request form, but intentionally kept OUT of
// PAID_SERVICES so they don't appear in the à-la-carte / services / launch
// grids (which map PAID_SERVICES and index 6-key icon maps by slug).

export type ServiceRequestSlug =
  | PaidServiceSlug
  | "launch-package"
  | "registered-agent";

export interface ServiceRequestOption {
  slug: ServiceRequestSlug;
  title: string;
  tag: string;
  startingPrice: number;
  description: string;
  features: string[];
}

/** The bundle + recurring offers surfaced by the homepage Launch Path. */
export const EXTRA_SERVICE_OPTIONS: ServiceRequestOption[] = [
  {
    slug: "launch-package",
    title: "Veteran Launch Package",
    tag: "Bundle",
    startingPrice: 750,
    description:
      "Everything your new LLC needs to look open for business on day one — bundled, built by the same team that filed your formation.",
    features: [
      "Professional logo set (web, social, print)",
      "One-page business website, mobile-first and SEO-ready",
      "Business email with proper security records",
      "Domain and hosting, set up clean",
      "Launch-day checklist reviewed with you 1-on-1",
    ],
  },
  {
    slug: "registered-agent",
    title: "Registered Agent Service",
    tag: "Compliance",
    startingPrice: 119,
    description:
      "Every Texas LLC is required to maintain a registered agent. Let Hutchrok stand post — we receive your legal and state mail and alert you same-day.",
    features: [
      "Texas street address for your LLC's registered office",
      "Same-day scan and alert on legal documents",
      "Annual franchise tax and report reminders",
      "Keeps your home address off public record",
      "Compliance calendar for your first year",
    ],
  },
];

/** Everything selectable in the service-request form (individual + bundles). */
export const SERVICE_REQUEST_OPTIONS: ServiceRequestOption[] = [
  ...PAID_SERVICES.map((s) => ({
    slug: s.slug,
    title: s.title,
    tag: s.tag,
    startingPrice: s.startingPrice,
    description: s.description,
    features: s.features,
  })),
  ...EXTRA_SERVICE_OPTIONS,
];

export const SERVICE_REQUEST_BY_SLUG: Record<string, ServiceRequestOption> =
  SERVICE_REQUEST_OPTIONS.reduce(
    (acc, option) => {
      acc[option.slug] = option;
      return acc;
    },
    {} as Record<string, ServiceRequestOption>
  );
