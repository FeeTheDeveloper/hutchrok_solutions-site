/**
 * lib/dot/export.ts
 * ----------------------------------------------------------------------------
 * Selection report export — CSV and PDF — formatted for handing to a DOT
 * auditor or C/TPA. Includes the seed, pool snapshot hash, algorithm version,
 * operator signature line, and the full selected + alternate lists.
 * ----------------------------------------------------------------------------
 */
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { AuditRecord } from "./types";
import { ALGORITHM_VERSION } from "@/lib/selection";

const NAVY = rgb(0.039, 0.102, 0.247); // #0A1A3F
const GOLD = rgb(0.831, 0.686, 0.216); // #D4AF37
const GREY = rgb(0.35, 0.4, 0.5);

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

/** Build a single-record CSV selection report (auditor-facing). */
export function recordToCsv(record: AuditRecord): string {
  const r = record.result;
  const lines: string[] = [];
  const meta: [string, string][] = [
    ["report_generated", record.createdAt],
    ["company", r.company],
    ["test_type", r.testType],
    ["cycle", `${r.cycle} ${record.year}`],
    ["draw_timestamp", r.timestamp],
    ["operator", r.operator],
    ["annual_rate", `${(r.rate * 100).toFixed(0)}%`],
    ["pool_size", String(r.poolSize)],
    ["required_count", String(r.requiredCount)],
    ["algorithm_version", r.algorithmVersion],
    ["seed", r.seed],
    ["pool_snapshot_sha256", r.poolHash],
  ];
  meta.forEach(([k, v]) => lines.push(`${csvEscape(k)},${csvEscape(v)}`));
  lines.push("");
  lines.push("selection,driver_id,name,cdl_number,company,status");
  r.selected.forEach((d, i) =>
    lines.push(
      [
        `PRIMARY-${i + 1}`,
        d.driverId,
        d.name,
        d.cdlNumber,
        d.company,
        d.status,
      ]
        .map(csvEscape)
        .join(","),
    ),
  );
  r.alternates.forEach((d, i) =>
    lines.push(
      [
        `ALTERNATE-${i + 1}`,
        d.driverId,
        d.name,
        d.cdlNumber,
        d.company,
        d.status,
      ]
        .map(csvEscape)
        .join(","),
    ),
  );
  return lines.join("\r\n");
}

/** Build a multi-record CSV export of the full audit trail. */
export function recordsToCsv(records: AuditRecord[]): string {
  const header = [
    "record_id",
    "report_generated",
    "company",
    "test_type",
    "cycle",
    "year",
    "draw_timestamp",
    "operator",
    "annual_rate",
    "pool_size",
    "required_count",
    "selected_count",
    "alternate_count",
    "algorithm_version",
    "seed",
    "pool_snapshot_sha256",
    "selected_driver_ids",
    "alternate_driver_ids",
  ].join(",");
  const rows = records.map((record) => {
    const r = record.result;
    return [
      record.id,
      record.createdAt,
      r.company,
      r.testType,
      r.cycle,
      String(record.year),
      r.timestamp,
      r.operator,
      `${(r.rate * 100).toFixed(0)}%`,
      String(r.poolSize),
      String(r.requiredCount),
      String(r.selected.length),
      String(r.alternates.length),
      r.algorithmVersion,
      r.seed,
      r.poolHash,
      r.selected.map((d) => d.driverId).join(" "),
      r.alternates.map((d) => d.driverId).join(" "),
    ]
      .map(csvEscape)
      .join(",");
  });
  return [header, ...rows].join("\r\n");
}

/**
 * Render a single selection record as a PDF (Uint8Array of bytes). Uses only
 * standard fonts so it is fully self-contained.
 */
export async function recordToPdf(record: AuditRecord): Promise<Uint8Array> {
  const r = record.result;
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const pageW = 612;
  const pageH = 792;
  const margin = 48;
  let page = doc.addPage([pageW, pageH]);
  let y = pageH - margin;

  const text = (
    s: string,
    x: number,
    size: number,
    opts: { bold?: boolean; color?: ReturnType<typeof rgb> } = {},
  ) => {
    page.drawText(s, {
      x,
      y,
      size,
      font: opts.bold ? bold : font,
      color: opts.color ?? rgb(0.1, 0.12, 0.16),
    });
  };

  const ensureSpace = (needed: number) => {
    if (y - needed < margin) {
      page = doc.addPage([pageW, pageH]);
      y = pageH - margin;
    }
  };

  // Header band.
  page.drawRectangle({
    x: 0,
    y: pageH - 84,
    width: pageW,
    height: 84,
    color: NAVY,
  });
  page.drawText("KNOW BEFORE U GO", {
    x: margin,
    y: pageH - 44,
    size: 18,
    font: bold,
    color: GOLD,
  });
  page.drawText("DOT Random Selection Report - 49 CFR Part 382", {
    x: margin,
    y: pageH - 66,
    size: 10,
    font,
    color: rgb(0.79, 0.82, 0.89),
  });
  // Gold checkmark motif.
  page.drawText("✓", {
    x: pageW - margin - 22,
    y: pageH - 54,
    size: 26,
    font: bold,
    color: GOLD,
  });
  y = pageH - 110;

  const field = (label: string, value: string) => {
    ensureSpace(18);
    text(label, margin, 10, { bold: true, color: GREY });
    text(value, margin + 160, 10);
    y -= 16;
  };

  text("Selection Summary", margin, 13, { bold: true, color: NAVY });
  y -= 20;
  field("Company", r.company);
  field("Test Type", r.testType.toUpperCase());
  field("Cycle", `${r.cycle} ${record.year}`);
  field("Annual Minimum Rate", `${(r.rate * 100).toFixed(0)}%`);
  field("Pool Size (eligible)", String(r.poolSize));
  field("Required This Draw", String(r.requiredCount));
  field("Operator", r.operator);
  field("Draw Timestamp (ISO-8601)", r.timestamp);
  field("Report Generated", record.createdAt);
  y -= 6;
  text("Audit / Reproducibility", margin, 13, { bold: true, color: NAVY });
  y -= 20;
  field("Algorithm Version", r.algorithmVersion || ALGORITHM_VERSION);
  field("Random Seed", r.seed);
  // Hash may be long; wrap.
  ensureSpace(18);
  text("Pool Snapshot (SHA-256)", margin, 10, { bold: true, color: GREY });
  y -= 14;
  const hash = r.poolHash;
  for (let i = 0; i < hash.length; i += 64) {
    ensureSpace(12);
    text(hash.slice(i, i + 64), margin + 12, 8, { color: GREY });
    y -= 11;
  }
  y -= 10;

  const table = (title: string, drivers: typeof r.selected, label: string) => {
    ensureSpace(30);
    text(title, margin, 12, { bold: true, color: NAVY });
    y -= 16;
    ensureSpace(16);
    text("#", margin, 9, { bold: true, color: GREY });
    text("Driver ID", margin + 28, 9, { bold: true, color: GREY });
    text("Name", margin + 130, 9, { bold: true, color: GREY });
    text("CDL #", margin + 300, 9, { bold: true, color: GREY });
    text("Company", margin + 420, 9, { bold: true, color: GREY });
    y -= 13;
    drivers.forEach((d, i) => {
      ensureSpace(13);
      text(`${label}${i + 1}`, margin, 9);
      text(d.driverId, margin + 28, 9);
      text(d.name.slice(0, 28), margin + 130, 9);
      text(d.cdlNumber, margin + 300, 9);
      text(d.company.slice(0, 18), margin + 420, 9);
      y -= 12;
    });
    y -= 8;
  };

  table("Selected Drivers (Primary)", r.selected, "P");
  if (r.alternates.length > 0) {
    table("Alternate Drivers", r.alternates, "A");
  }

  // Signature line.
  ensureSpace(60);
  y -= 10;
  page.drawLine({
    start: { x: margin, y },
    end: { x: margin + 260, y },
    thickness: 1,
    color: GREY,
  });
  y -= 12;
  text("Operator / DER Signature", margin, 9, { color: GREY });
  text("Date: ____________________", margin + 300, 9, { color: GREY });
  y -= 26;
  ensureSpace(30);
  text(
    "This tool assists random selection under 49 CFR Part 382. It does not",
    margin,
    8,
    { color: GREY },
  );
  y -= 10;
  text(
    "replace a certified C/TPA or MRO. Retain this record per DOT requirements.",
    margin,
    8,
    { color: GREY },
  );

  return doc.save();
}

/** Trigger a browser download for the given bytes/string. */
export function downloadBlob(
  data: Uint8Array | string,
  filename: string,
  mime: string,
): void {
  if (typeof window === "undefined") return;
  const blob =
    typeof data === "string"
      ? new Blob([data], { type: mime })
      : new Blob([data as unknown as BlobPart], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
