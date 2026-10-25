/**
 * Hutchrok guide cast — named characters from the Flow roster
 * ("Hutchrok Solutions Group" project), each tied to a service line.
 * These are illustrative characters, not staff photos; the UI says so.
 * Name-to-render pairing must match the Flow Characters grid.
 */
export type Guide = {
  id: string;
  name: string;
  role: string;
  focus: string;
  image: string;
  href: string;
};

export const GUIDES: Guide[] = [
  {
    id: "marcus-reed",
    name: "Marcus Reed",
    role: "Veteran Business Guide",
    focus: "Walks veterans from DD-214 to a verified, filed Texas LLC.",
    image: "/images/guides/marcus-reed.webp",
    href: "/verification-help",
  },
  {
    id: "maya-brooks",
    name: "Maya Brooks",
    role: "Business Architect",
    focus: "Structures the entity and agreements so they hold up later.",
    image: "/images/guides/maya-brooks.webp",
    href: "/formation-filings",
  },
  {
    id: "simone-hayes",
    name: "Simone Hayes",
    role: "Contracting Strategist",
    focus: "Gets the company SAM.gov-ready and positioned to bid.",
    image: "/images/guides/simone-hayes.webp",
    href: "/services/federal-contract-prep",
  },
  {
    id: "darius-cole",
    name: "Darius Cole",
    role: "Business Readiness Coach",
    focus: "Builds the credit, compliance and launch basics in order.",
    image: "/images/guides/darius-cole.webp",
    href: "/launch-services",
  },
];

/** Front-of-house character for the concierge section. */
export const CLIENT_SERVICES_GUIDE: Guide = {
  id: "angela-mercer",
  name: "Angela Mercer",
  role: "Client Services Lead",
  focus: "Points you to the right first step.",
  image: "/images/guides/angela-mercer.webp",
  href: "/contact",
};
