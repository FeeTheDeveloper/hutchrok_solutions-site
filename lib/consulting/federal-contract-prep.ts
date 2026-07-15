/**
 * Federal Contract Prep — domain model, option sets, and tier metadata.
 *
 * Backs the /services/federal-contract-prep landing page and intake form.
 * Consulting that gets small businesses federal-ready: entity/document
 * readiness, SAM.gov registration prep, and certification navigation.
 *
 * Copy guardrails (do not change without operator sign-off):
 * - Never collect SSN, EIN numbers, bank info, or login credentials.
 * - No SDVOSB/VOSB certification claims — Hutchrok is veteran-owned;
 *   SAM.gov registration is stated only as its actual current status.
 * - No award guarantees or influence language anywhere.
 */

// ── Option sets (value + human label) ──

export const FEDERAL_ENTITY_TYPES = [
  { value: "llc", label: "LLC" },
  { value: "corp", label: "Corporation" },
  { value: "sole_prop", label: "Sole proprietorship" },
  { value: "partnership", label: "Partnership" },
  { value: "nonprofit", label: "Nonprofit" },
  { value: "not_formed", label: "Not formed yet" },
] as const;

export const EIN_STATUSES = [
  { value: "have", label: "We have an EIN" },
  { value: "dont_have", label: "We don't have an EIN yet" },
] as const;

export const EMPLOYEE_COUNTS = [
  { value: "0", label: "Just me (0 employees)" },
  { value: "1_5", label: "1–5" },
  { value: "6_20", label: "6–20" },
  { value: "21_50", label: "21–50" },
  { value: "50_plus", label: "More than 50" },
] as const;

export const ANNUAL_RECEIPTS_RANGES = [
  { value: "under_100k", label: "Under $100K" },
  { value: "100k_500k", label: "$100K – $500K" },
  { value: "500k_1m", label: "$500K – $1M" },
  { value: "1m_5m", label: "$1M – $5M" },
  { value: "5m_plus", label: "Over $5M" },
  { value: "not_documented", label: "Not formally documented yet" },
] as const;

export const SAM_ATTEMPT_STATUSES = [
  { value: "never", label: "Never attempted" },
  { value: "in_progress", label: "In progress now" },
  { value: "active", label: "Registered and active" },
  { value: "stalled", label: "Started but stalled / expired" },
] as const;

/** Structured answer payload persisted with the intake. */
export interface FederalIntakeDetail {
  legalEntityName: string;
  stateOfFormation: string;
  entityType: string;
  einStatus: string;
  revenueLines: string;
  employeeCount: string;
  annualReceiptsRange: string;
  veteranStatus: boolean;
  samAttemptStatus: string;
  samAttemptNotes: string;
}

// ── Service tiers ──

export interface FederalTier {
  key: string;
  name: string;
  /** Env var holding the display fee; placeholder shown when unset. */
  feeEnvVar: string;
  fee: string;
  tagline: string;
  includes: string[];
}

/** Read a display fee from the environment, keeping the placeholder visible when unset. */
function envFee(envVar: string, placeholder: string): string {
  return process.env[envVar]?.trim() || placeholder;
}

export function getFederalTiers(): FederalTier[] {
  return [
    {
      key: "strategic_roadmap",
      name: "Strategic Roadmap",
      feeEnvVar: "FEDERAL_FEE_ROADMAP",
      fee: envFee("FEDERAL_FEE_ROADMAP", "$[FEE_1]"),
      tagline: "Flat-fee strategy session — know exactly where you stand.",
      includes: [
        "90-minute working session with an operator",
        "Federal-readiness gap review (entity, EIN, documentation)",
        "NAICS code shortlist for your revenue lines",
        "Written next-step roadmap you keep",
      ],
    },
    {
      key: "operational_blueprint",
      name: "Operational Blueprint",
      feeEnvVar: "FEDERAL_FEE_BLUEPRINT",
      fee: envFee("FEDERAL_FEE_BLUEPRINT", "$[FEE_2]"),
      tagline: "Document and SAM.gov readiness, done with you.",
      includes: [
        "Everything in Strategic Roadmap",
        "Entity + document package preparation",
        "SAM.gov registration preparation and walkthrough",
        "Capability statement draft",
        "30-day follow-up review",
      ],
    },
    {
      key: "concierge",
      name: "Concierge",
      feeEnvVar: "FEDERAL_FEE_CONCIERGE",
      fee: envFee("FEDERAL_FEE_CONCIERGE", "$[FEE_3]"),
      tagline: "Certifications, monitoring, and renewals — managed.",
      includes: [
        "Everything in Operational Blueprint",
        "Certification application navigation (SBA programs you qualify for)",
        "Opportunity monitoring cadence",
        "Registration renewal management",
        "Quarterly readiness reviews",
      ],
    },
  ];
}
