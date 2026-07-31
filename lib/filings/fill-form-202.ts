/**
 * Form 202 auto-fill — Texas Certificate of Formation (Nonprofit Corporation)
 *
 * Populates the official, fillable Texas SOS Form 202 AcroForm with data
 * from a case's intake. Produces an editable PDF (not flattened) so an
 * operator can verify, set the members/no-members checkbox, confirm the
 * registered-agent address, and sign before filing.
 *
 * Fields that cannot be reliably derived from intake data — the
 * members/directors-managed checkbox and Hutchrok's registered-agent street
 * address — are intentionally left for operator review and flagged in the
 * supplemental provisions box.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { PDFDocument } from "pdf-lib";
import type { Form202Payload } from "@/lib/documents";
import { parseAddress, splitName } from "./fill-form-205";

const TEMPLATE_PATH = path.join(process.cwd(), "docs", "filings", "202_boc.pdf");

/** Exact AcroForm field names in the official Form 202 (order/spacing matters). */
const F = {
  entityName:
    "The filing entity being formed is a nonprofit corporation.  The name of the entity is:",
  raOrgName: "The initial registered agent is an organization by the name of:",
  raStreet: "Street address of the registered agent and registered office is:",
  raCity: "City of the registered agent and registered office is:",
  raZip: "Zip code of the registered agent and registered office is:",
  // Directors 1–3
  dir1First: "First name of Director:",
  dir1Mi: "Middle initial of Director:",
  dir1Last: "Last name of Director:",
  dir2First: "First name of Director 2:",
  dir2Mi: "Middle initial of Director 2:",
  dir2Last: "Last name of Director 2:",
  dir3First: "First name of Director 3:",
  dir3Mi: "Middle initial of Director 3:",
  dir3Last: "Last name of Director 3:",
  // Purpose lines
  purpose1: "The nonprofit corporation is organized for the following purpose or purposes [1]:",
  purpose2: "The nonprofit corporation is organized for the following purpose or purposes [2]:",
  purpose3: "The nonprofit corporation is organized for the following purpose or purposes [3]:",
  taxExemptSupplemental: "Include any additional language or provisions that may be needed to obtain tax-exempt status",
  // Initial mailing address of the company
  mailStreet: "Initial Mailing Address",
  mailCity: "City of Initial Mailing Address",
  mailState: "State of Initial Mailing Address",
  mailCountry: "Country of Initial Mailing Address",
  mailZip: "Zip Code of Initial Mailing Address",
  // Organizer
  orgName: "The name of the organizer:",
  orgStreet: "Street or mailing address of organizer:",
  orgCity: "City of organizer:",
  orgState: "State of organizer:",
  orgZip: "Zip code of organizer:",
  orgPrintedName: "Printed or typed name of organizer",
} as const;

/**
 * Fill the official Form 202 with payload data.
 * Returns the saved PDF bytes (editable, not flattened).
 */
export async function fillForm202(
  payload: Form202Payload,
): Promise<Uint8Array> {
  const templateBytes = await fs.readFile(TEMPLATE_PATH);
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

  // ── Directors ──
  const directors = payload.directors ?? [];
  const slots = [
    { first: F.dir1First, mi: F.dir1Mi, last: F.dir1Last },
    { first: F.dir2First, mi: F.dir2Mi, last: F.dir2Last },
    { first: F.dir3First, mi: F.dir3Mi, last: F.dir3Last },
  ];
  directors.slice(0, 3).forEach((director, i) => {
    const { first, mi, last } = splitName(director.name);
    set(slots[i].first, first);
    set(slots[i].mi, mi);
    set(slots[i].last, last);
  });

  // ── Purpose ──
  set(F.purpose1, payload.purpose);

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

  // ── Tax-exempt supplemental + operator review note ──
  const directorsExtra =
    directors.length > 3
      ? `Additional directors (overflow): ${directors
          .slice(3)
          .map((d) => `${d.name} (${d.role})`)
          .join("; ")}. `
      : "";
  set(
    F.taxExemptSupplemental,
    `${directorsExtra}Auto-prepared by Hutchrok for case ${payload.meta.caseNumber}. ` +
      "OPERATOR REVIEW: select the members/no-members governance checkbox and confirm " +
      "the registered agent's street address before filing.",
  );

  // Keep fields editable so the operator can finish + sign.
  form.updateFieldAppearances();
  return doc.save();
}
