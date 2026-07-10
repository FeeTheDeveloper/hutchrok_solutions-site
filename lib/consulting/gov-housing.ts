/**
 * Gov-Housing Consulting — domain model, options, and routing logic.
 *
 * Backs the /gov-housing-consulting intake. Answers are stored as JSON in
 * the `intake_detail` column of `intake_submissions`; the existing pipeline
 * auto-creates the filing case.
 */

// ── Option sets (value + human label) ──

export const TITLE_HOLDING = [
  { value: "personal", label: "Held personally" },
  { value: "llc_trust", label: "Held in an LLC or trust" },
] as const;

export const PROPERTY_TYPES = [
  { value: "sfr", label: "Single-family (SFR)" },
  { value: "duplex", label: "Duplex" },
  { value: "multifamily", label: "Multifamily (3+ units)" },
  { value: "land", label: "Land" },
] as const;

export const PROPERTY_CONDITIONS = [
  { value: "turn_key", label: "Turn-key" },
  { value: "minor_repairs", label: "Minor repairs" },
  { value: "major_rehab", label: "Major rehab" },
] as const;

export const OCCUPANCY = [
  { value: "vacant", label: "Vacant" },
  { value: "occupied", label: "Occupied" },
] as const;

export const PHA_REGISTRATION = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "unsure", label: "Unsure" },
] as const;

export const PLACEMENT_TIMELINES = [
  { value: "30", label: "Within 30 days" },
  { value: "60", label: "Within 60 days" },
  { value: "90plus", label: "90+ days" },
] as const;

export const INTEREST_SCOPES = [
  { value: "single_placement", label: "Single placement" },
  { value: "portfolio_conversion", label: "Portfolio conversion" },
  { value: "project_based_vouchers", label: "Project-based vouchers" },
  { value: "federal_development", label: "Federal development / contracting" },
] as const;

export const SAM_STATUSES = [
  { value: "active", label: "Active" },
  { value: "expired", label: "Expired" },
  { value: "none", label: "None" },
] as const;

export const CONTACT_CHANNELS = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone call" },
  { value: "text", label: "Text message" },
] as const;

export type InterestScope = (typeof INTEREST_SCOPES)[number]["value"];

/** The structured answer payload persisted to intake_detail. */
export interface GovHousingDetail {
  // A. Contact & Entity
  titleHolding: string;
  veteranStatus: boolean;
  // B. Property Profile
  propertyAddress: string;
  propertyCity: string;
  propertyZip: string;
  propertyType: string;
  unitsAvailable: number | null;
  bedrooms: string;
  bathrooms: string;
  yearBuilt: number | null;
  condition: string;
  occupancy: string;
  targetRent: number | null;
  // C. Program Readiness
  section8Before: boolean;
  registeredWithPHA: string;
  knowsPHA: boolean;
  phaName: string;
  placementTimeline: string;
  interestScope: string[];
  // D. Federal Contracting (conditional)
  samStatus: string;
  uei: string;
  govContractExperience: string;
  // E. Engagement Fit
  successOutcome: string;
  budgetAuthorityConfirmed: boolean;
  preferredChannel: string;
}

// ── Routing / scoring ──

export type GovHousingPathway = "fast_track" | "standard" | "escalate";

export interface GovHousingRouting {
  pathway: GovHousingPathway;
  tier: string;
  label: string;
  nextStep: string;
}

const ESCALATE_SCOPES: InterestScope[] = [
  "portfolio_conversion",
  "project_based_vouchers",
  "federal_development",
];

/** Whether the conditional Federal Contracting section (D) applies. */
export function showsFederalSection(interestScope: string[]): boolean {
  return interestScope.includes("federal_development");
}

/**
 * Route an intake to a pathway per the spec's scoring logic.
 * Escalation (portfolio/development interest) takes precedence, then the
 * turn-key fast-track, otherwise standard.
 */
export function routeGovHousingIntake(
  d: Pick<
    GovHousingDetail,
    "occupancy" | "condition" | "knowsPHA" | "interestScope"
  >,
): GovHousingRouting {
  const wantsEscalation = d.interestScope.some((s) =>
    ESCALATE_SCOPES.includes(s as InterestScope),
  );

  if (wantsEscalation) {
    return {
      pathway: "escalate",
      tier: "Concierge",
      label: "Escalate — Pathway B/D",
      nextStep:
        "Schedule a strategy session; Concierge tier scoping for portfolio conversion / federal development.",
    };
  }

  if (d.occupancy === "vacant" && d.condition === "turn_key" && d.knowsPHA) {
    return {
      pathway: "fast_track",
      tier: "Readiness",
      label: "Fast-track — Pathway A",
      nextStep:
        "Vacant, turn-key, PHA known — move directly to a Readiness tier proposal.",
    };
  }

  return {
    pathway: "standard",
    tier: "Insight",
    label: "Standard",
    nextStep:
      "Occupied or repairs needed — Insight tier first; a readiness-gap report is the first paid deliverable.",
  };
}
