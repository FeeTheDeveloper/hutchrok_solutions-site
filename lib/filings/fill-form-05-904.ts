/**
 * Form 05-904 auto-fill — Certification of New Veteran-Owned Business
 * (Texas Comptroller form filed alongside the Certificate of Formation to
 * claim the veteran filing-fee waiver and franchise-tax exemption).
 *
 * Populates the official fillable AcroForm with the entity name and the
 * owner table (up to 7 owners). The identification-number column is left
 * blank — it holds sensitive personal identifiers that we do not collect
 * or store; the veteran completes that column and signs before filing.
 * The PDF is returned editable (not flattened) for operator review.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { PDFDocument } from "pdf-lib";
import type { OwnerDetail } from "@/lib/types";

const TEMPLATE_PATH = path.join(process.cwd(), "docs", "filings", "05-904.pdf");

/**
 * Exact AcroForm field names in the official Form 05-904. The form's own
 * field names contain typos ("Percentag3", "Percentag5") — keep verbatim.
 */
const F = {
  entityName: "Entity name",
  owners: [
    { name: "Owner1", pct: "Percentage1" },
    { name: "Owner2", pct: "Percentage2" },
    { name: "Owner3", pct: "Percentag3" },
    { name: "Owner4", pct: "Percentage4" },
    { name: "Owner5", pct: "Percentag5" },
    { name: "Owner6", pct: "Percentage6" },
    { name: "Owner7", pct: "Percentage7" },
  ],
  totalPct: "TTLppg",
} as const;

export const FORM_05_904_MAX_OWNERS = F.owners.length;

export interface Form05904Payload {
  entityName: string;
  /** Veteran owners; percentages are split evenly when not provided. */
  owners: OwnerDetail[];
  /** Explicit ownership percentages by owner index (optional). */
  ownershipPercentages?: number[];
}

/** Format a percentage for the form: "50" or "33.33" — no trailing zeros. */
function formatPct(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

/**
 * Even split across `count` owners that always totals exactly 100
 * (remainder goes to the first owner, e.g. 3 owners → 33.34/33.33/33.33).
 */
export function evenOwnershipSplit(count: number): number[] {
  if (count <= 0) return [];
  const base = Math.floor((100 / count) * 100) / 100;
  const first = Math.round((100 - base * (count - 1)) * 100) / 100;
  return [first, ...Array.from({ length: count - 1 }, () => base)];
}

/**
 * Fill the official Form 05-904 with payload data.
 * Returns the saved PDF bytes (editable, not flattened).
 */
export async function fillForm05904(
  payload: Form05904Payload,
): Promise<Uint8Array> {
  const templateBytes = await fs.readFile(TEMPLATE_PATH);
  const doc = await PDFDocument.load(templateBytes);
  const form = doc.getForm();

  const set = (name: string, value: string | null | undefined) => {
    if (!value) return;
    try {
      form.getTextField(name).setText(value);
    } catch {
      /* field absent or not a text field — skip */
    }
  };

  set(F.entityName, payload.entityName);

  const owners = payload.owners.slice(0, FORM_05_904_MAX_OWNERS);
  const percentages =
    payload.ownershipPercentages && payload.ownershipPercentages.length >= owners.length
      ? payload.ownershipPercentages
      : evenOwnershipSplit(owners.length);

  owners.forEach((owner, i) => {
    set(F.owners[i].name, owner.name);
    set(F.owners[i].pct, formatPct(percentages[i]));
  });

  const total = percentages
    .slice(0, owners.length)
    .reduce((sum, p) => sum + p, 0);
  if (owners.length > 0) {
    set(F.totalPct, formatPct(Math.round(total * 100) / 100));
  }

  form.updateFieldAppearances();
  return doc.save();
}
