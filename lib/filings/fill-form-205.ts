/**
 * Form 205 auto-fill — Texas Certificate of Formation (LLC)
 *
 * Populates the official, fillable Texas SOS Form 205 AcroForm with data
 * from a case's intake. Produces an editable PDF (not flattened) so an
 * operator can verify, set the Article-3 management checkbox, confirm the
 * registered-agent address, and sign before filing.
 *
 * Fields that cannot be reliably derived from intake data — the management
 * checkbox and Hutchrok's registered-agent street address — are intentionally
 * left for operator review and flagged in the Supplemental Provisions box.
 */

import { PDFDocument } from "pdf-lib";
import type { Form205Payload } from "@/lib/documents";

/**
 * Path of the fillable template as a public static asset. Served identically
 * on Vercel, Cloudflare Workers, and local dev — no filesystem access, so this
 * is host-agnostic. The caller fetches the bytes and passes them in.
 */
export const FORM_205_ASSET_PATH = "/filings/205_boc.pdf";

/** Exact AcroForm field names in the official Form 205 (order/spacing matters). */
const F = {
  entityName: "The name of the entity is:",
  raOrgName: "Initial registered agent is an organization by the name of:",
  raStreet: "Street address of registered agent:",
  raCity: "City of registered agent:",
  raZip: "Zip code of registered agent:",
  // Governing persons (members / managers) 1–3
  gp1First: "First Name of Governing Person:",
  gp1Mi: "Middle Initial  of Governing Person:",
  gp1Last: "Last Name of Governing Person:",
  gp2First: "First Name of Governing Person 2:",
  gp2Mi: "Middle Initial of Governing Person 2:",
  gp2Last: "Last Name of Governing Person 2:",
  gp3First: "First Name of Governing Person 3:",
  gp3Mi: "Middle Initial of Governing Person 3:",
  gp3Last: "Last Name of Governing Person 3:",
  // Initial mailing address of the company
  mailStreet: "Initial Mailing Address",
  mailCity: "City of Initial Mailing Address",
  mailState: "State of Initial Mailing Address",
  mailCountry: "Country of Initial Mailing Address",
  mailZip: "Zip Code of Initial Mailing Address",
  // Supplemental / organizer
  supplemental: "Supplemental Provisions/Information:",
  orgName: "The name and address of the organizer:",
  orgStreet: "Street or Mailing Address of the organizer:",
  orgCity: "City of the organizer:",
  orgState: "State of the organizer:",
  orgZip: "Zip Code of the organizer:",
  orgPrintedName: "Printed or typed name of organizer:",
} as const;

interface ParsedAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
}

/** Best-effort parse of a free-text US address into components. */
export function parseAddress(input: string | null | undefined): ParsedAddress {
  const result: ParsedAddress = { street: "", city: "", state: "", zip: "" };
  if (!input) return result;
  let rest = input.trim();

  // Pull a trailing ZIP (5 or 5-4)
  const zipMatch = rest.match(/\b(\d{5}(?:-\d{4})?)\b\s*$/);
  if (zipMatch) {
    result.zip = zipMatch[1];
    rest = rest.slice(0, zipMatch.index).trim().replace(/,\s*$/, "");
  }

  // Pull a trailing 2-letter state abbreviation
  const stateMatch = rest.match(/[,\s]([A-Za-z]{2})\s*$/);
  if (stateMatch) {
    result.state = stateMatch[1].toUpperCase();
    rest = rest.slice(0, stateMatch.index).trim().replace(/,\s*$/, "");
  }

  // Remaining: "street, city" (city = last comma segment)
  const parts = rest.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length >= 2) {
    result.city = parts[parts.length - 1];
    result.street = parts.slice(0, -1).join(", ");
  } else {
    result.street = parts[0] ?? "";
  }
  return result;
}

interface SplitName {
  first: string;
  mi: string;
  last: string;
}

/** Split a full name into first / middle-initial / last. */
export function splitName(full: string): SplitName {
  const tokens = full.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return { first: "", mi: "", last: "" };
  if (tokens.length === 1) return { first: tokens[0], mi: "", last: "" };
  const first = tokens[0];
  const last = tokens[tokens.length - 1];
  const middle = tokens.slice(1, -1).join(" ");
  return { first, mi: middle ? middle[0].toUpperCase() : "", last };
}

/**
 * Fill the official Form 205 with payload data.
 * `templateBytes` are the raw bytes of the fillable Form 205 template
 * (fetched by the caller from FORM_205_ASSET_PATH). Returns the saved PDF
 * bytes (editable, not flattened).
 */
export async function fillForm205(
  payload: Form205Payload,
  templateBytes: Uint8Array,
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(templateBytes);
  const form = doc.getForm();

  /** Set a text field by exact name; ignore if missing/read-only. */
  const set = (name: string, value: string | null | undefined) => {
    if (!value) return;
    try {
      form.getTextField(name).setText(value);
    } catch {
      /* field absent or not a text field — skip */
    }
  };

  // ── Entity name ──
  set(F.entityName, payload.entityName);

  // ── Registered agent (Hutchrok serves as RA — organization) ──
  set(F.raOrgName, payload.registeredAgent.name || "Hutchrok Solutions Group LLC");
  // RA street address is Hutchrok's own and not stored on the case — left for operator.

  // ── Governing persons (members) ──
  const owners = payload.owners ?? [];
  const gp = [
    { first: F.gp1First, mi: F.gp1Mi, last: F.gp1Last },
    { first: F.gp2First, mi: F.gp2Mi, last: F.gp2Last },
    { first: F.gp3First, mi: F.gp3Mi, last: F.gp3Last },
  ];
  owners.slice(0, 3).forEach((owner, i) => {
    const { first, mi, last } = splitName(owner.name);
    set(gp[i].first, first);
    set(gp[i].mi, mi);
    set(gp[i].last, last);
  });

  // ── Initial mailing address of the company ──
  const mailing = parseAddress(payload.mailingAddress || payload.principalAddress);
  set(F.mailStreet, mailing.street);
  set(F.mailCity, mailing.city);
  set(F.mailState, mailing.state || "TX");
  set(F.mailZip, mailing.zip);
  set(F.mailCountry, "USA");

  // ── Organizer ──
  set(F.orgName, payload.organizer.name);
  set(F.orgPrintedName, payload.organizer.name);
  const orgAddr = parseAddress(payload.principalAddress);
  set(F.orgStreet, orgAddr.street);
  set(F.orgCity, orgAddr.city);
  set(F.orgState, orgAddr.state || "TX");
  set(F.orgZip, orgAddr.zip);

  // ── Supplemental provisions + operator review note ──
  const ownersExtra =
    owners.length > 3
      ? `\nAdditional members (overflow): ${owners
          .slice(3)
          .map((o) => `${o.name} (${o.role})`)
          .join("; ")}.`
      : "";
  const supplemental = [
    `Purpose: ${payload.purpose}`,
    `Management: ${payload.managementType}.`,
    payload.veteranFeeWaiver
      ? "Veteran-owned business — TVC fee waiver applies (Form 05-904 to accompany filing)."
      : "",
    `Auto-prepared by Hutchrok for case ${payload.meta.caseNumber}. OPERATOR REVIEW: select the Article 3 management option and confirm the registered agent's street address before filing.`,
    ownersExtra,
  ]
    .filter(Boolean)
    .join(" ");
  set(F.supplemental, supplemental);

  // Keep fields editable so the operator can finish + sign.
  form.updateFieldAppearances();
  return doc.save();
}
