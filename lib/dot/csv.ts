/**
 * lib/dot/csv.ts
 * ----------------------------------------------------------------------------
 * Client-side roster CSV parsing, validation and de-duplication. No PII leaves
 * the browser: parsing happens entirely on the client. Handles quoted fields,
 * embedded commas/newlines, and BOM.
 * ----------------------------------------------------------------------------
 */
import { CSV_COLUMNS, driverSchema, type DriverInput } from "./types";

export interface CsvRowError {
  row: number; // 1-based data row (excludes header)
  message: string;
}

export interface CsvParseResult {
  drivers: DriverInput[];
  errors: CsvRowError[];
  duplicatesRemoved: number;
  totalRows: number;
  missingColumns: string[];
}

/** Tokenize a single CSV line respecting RFC-4180 quoting. */
function parseCsvText(text: string): string[][] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;

  // Strip a leading UTF-8 BOM if present.
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      // Handle CRLF: skip the \n after \r.
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  // Flush trailing field/row (file may not end with newline).
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  // Drop fully-empty rows.
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/\s+/g, "_");
}

/**
 * Parse, validate, and de-duplicate a roster CSV.
 * Required columns: driver_id, name, cdl_number, company, status.
 * De-dup key is driver_id (case-insensitive); the first occurrence wins.
 */
export function parseRosterCsv(text: string): CsvParseResult {
  const rows = parseCsvText(text);
  if (rows.length === 0) {
    return {
      drivers: [],
      errors: [{ row: 0, message: "The file is empty." }],
      duplicatesRemoved: 0,
      totalRows: 0,
      missingColumns: [...CSV_COLUMNS],
    };
  }

  const header = rows[0].map(normalizeHeader);
  const colIndex: Record<string, number> = {};
  header.forEach((h, i) => {
    if (!(h in colIndex)) colIndex[h] = i;
  });

  const missingColumns = CSV_COLUMNS.filter((c) => !(c in colIndex));
  const dataRows = rows.slice(1);

  if (missingColumns.length > 0) {
    return {
      drivers: [],
      errors: [
        {
          row: 0,
          message: `Missing required column(s): ${missingColumns.join(", ")}.`,
        },
      ],
      duplicatesRemoved: 0,
      totalRows: dataRows.length,
      missingColumns,
    };
  }

  const drivers: DriverInput[] = [];
  const errors: CsvRowError[] = [];
  const seen = new Set<string>();
  let duplicatesRemoved = 0;

  dataRows.forEach((cols, idx) => {
    const rowNum = idx + 1;
    const raw = {
      driverId: cols[colIndex["driver_id"]] ?? "",
      name: cols[colIndex["name"]] ?? "",
      cdlNumber: cols[colIndex["cdl_number"]] ?? "",
      company: cols[colIndex["company"]] ?? "",
      status: cols[colIndex["status"]] ?? "",
    };
    const parsed = driverSchema.safeParse(raw);
    if (!parsed.success) {
      const msg = parsed.error.issues.map((i) => i.message).join("; ");
      errors.push({ row: rowNum, message: msg });
      return;
    }
    const key = parsed.data.driverId.toLowerCase();
    if (seen.has(key)) {
      duplicatesRemoved++;
      return;
    }
    seen.add(key);
    drivers.push(parsed.data);
  });

  return {
    drivers,
    errors,
    duplicatesRemoved,
    totalRows: dataRows.length,
    missingColumns: [],
  };
}

/** Only ACTIVE drivers are eligible for random selection. */
export function eligibleDrivers(drivers: DriverInput[]): DriverInput[] {
  return drivers.filter((d) => d.status === "active");
}
