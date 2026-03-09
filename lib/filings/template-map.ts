/** Metadata for a single filing template. */
export interface FilingTemplate {
  path: string;
  label: string;
}

/** Result returned by `getFilingTemplatesForCase`. */
export interface FilingTemplateResult {
  /** Primary formation template for the entity type. */
  primary: FilingTemplate;
  /** Optional supplemental templates (e.g. veteran certification). */
  supplements: FilingTemplate[];
  /** All templates combined (primary + supplements) for convenience. */
  all: FilingTemplate[];
  /** Whether the veteran supplement (Form 05-904) is included. */
  veteranSupplementIncluded: boolean;
}

/** Input for template resolution — no DB types, just plain values. */
export interface FilingTemplateInput {
  entityType: string;
  veteranStatus?: boolean;
  fullyVeteranOwned?: boolean;
}

// ── Entity type → SOS form template mapping ──

export const ENTITY_TEMPLATE_MAP: Record<string, FilingTemplate> = {
  llc:                       { path: "docs/filings/205_boc.pdf", label: "Form 205 — Certificate of Formation (LLC)" },
  corp:                      { path: "docs/filings/201_boc.pdf", label: "Form 201 — Certificate of Formation (For-Profit Corp)" },
  nonprofit:                 { path: "docs/filings/202_boc.pdf", label: "Form 202 — Certificate of Formation (Nonprofit Corp)" },
  professional_corp:         { path: "docs/filings/203_boc.pdf", label: "Form 203 — Certificate of Formation (Professional Corp)" },
  professional_association:  { path: "docs/filings/204_boc.pdf", label: "Form 204 — Certificate of Formation (Professional Assoc)" },
  professional_llc:          { path: "docs/filings/206_boc.pdf", label: "Form 206 — Certificate of Formation (Professional LLC)" },
  limited_partnership:       { path: "docs/filings/207_boc.pdf", label: "Form 207 — Certificate of Formation (LP)" },
};

export const VETERAN_SUPPLEMENT: FilingTemplate = {
  path: "docs/filings/05-904.pdf",
  label: "Form 05-904 — Veteran-Owned Business Certification",
};

/**
 * Resolve the filing template(s) for a case based on entity type and
 * veteran eligibility. Pure function — no side effects or DB calls.
 *
 * Returns `null` if the entity type has no known template mapping.
 */
export function getFilingTemplatesForCase(
  input: FilingTemplateInput,
): FilingTemplateResult | null {
  const primary = ENTITY_TEMPLATE_MAP[input.entityType];
  if (!primary) return null;

  const supplements: FilingTemplate[] = [];

  const isVeteranEligible =
    input.veteranStatus === true && input.fullyVeteranOwned === true;

  if (isVeteranEligible) {
    supplements.push(VETERAN_SUPPLEMENT);
  }

  return {
    primary,
    supplements,
    all: [primary, ...supplements],
    veteranSupplementIncluded: isVeteranEligible,
  };
}
