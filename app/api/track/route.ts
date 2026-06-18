import { NextRequest } from "next/server";
import { z } from "zod";
import { getSupabaseServer } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { apiError, apiSuccess, ErrorCode } from "@/lib/api-response";
import { getCaseStatusMeta } from "@/lib/case-status";

/**
 * POST /api/track
 *
 * Self-service filing status lookup. A client provides their case number and
 * the email used on intake; we return the current filing status and a
 * client-safe view of their case. The email acts as a lightweight ownership
 * check so case numbers alone cannot be enumerated.
 *
 * Public + rate limited. No admin token required.
 */

const trackSchema = z.object({
  caseNumber: z
    .string()
    .trim()
    .min(1, "Case number is required.")
    .max(60, "That doesn't look like a valid case number."),
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Please enter a valid email address."),
});

interface TrackCaseRow {
  id: string;
  case_number: string;
  status: string;
  created_at: string;
  updated_at: string;
  intake_submissions: {
    name: string | null;
    email: string | null;
    business_name: string | null;
    entity_type: string | null;
  } | null;
  case_documents: { filename: string; uploaded_at: string }[] | null;
}

const TRACK_SELECT = `
  id, case_number, status, created_at, updated_at,
  intake_submissions ( name, email, business_name, entity_type ),
  case_documents ( filename, uploaded_at )
`
  .replace(/\s+/g, " ")
  .trim();

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/** Generic "not found" — identical for missing case AND email mismatch to prevent enumeration. */
function notFound() {
  return apiError(
    ErrorCode.NOT_FOUND,
    "We couldn't find a filing matching that case number and email. Double-check both and try again.",
    404
  );
}

export async function POST(request: NextRequest) {
  // ── Rate limit (10 lookups / 60s per IP) ──
  const ip = getClientIp(request);
  const rl = rateLimit(`track:${ip}`, { limit: 10, windowMs: 60_000 });
  if (!rl.allowed) {
    return apiError(
      ErrorCode.RATE_LIMITED,
      "Too many lookups. Please wait a moment and try again.",
      429
    );
  }

  // ── Parse & validate ──
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError(ErrorCode.BAD_REQUEST, "Invalid JSON body.", 400);
  }

  const parsed = trackSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "");
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return apiError(
      ErrorCode.VALIDATION_ERROR,
      "Please fix the highlighted fields.",
      400,
      fieldErrors
    );
  }

  const caseNumber = parsed.data.caseNumber.toUpperCase();
  const email = parsed.data.email.toLowerCase();

  // ── Look up case ──
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("filing_cases")
    .select(TRACK_SELECT)
    .eq("case_number", caseNumber)
    .maybeSingle();

  if (error) {
    console.error("[api/track] lookup error:", error.code, error.message);
    return apiError(
      ErrorCode.INTERNAL_ERROR,
      "Something went wrong looking up your filing. Please try again.",
      500
    );
  }

  if (!data) return notFound();

  const row = data as unknown as TrackCaseRow;
  const intakeEmail = row.intake_submissions?.email?.trim().toLowerCase();

  // ── Ownership check ──
  if (!intakeEmail || intakeEmail !== email) {
    return notFound();
  }

  const meta = getCaseStatusMeta(row.status);
  const documents = (row.case_documents ?? [])
    .slice()
    .sort((a, b) => b.uploaded_at.localeCompare(a.uploaded_at))
    .map((d) => ({ filename: d.filename, uploadedAt: d.uploaded_at }));

  return apiSuccess({
    case: {
      caseNumber: row.case_number,
      status: row.status,
      statusLabel: meta.label,
      milestone: meta.milestone,
      happening: meta.happening,
      next: meta.next,
      businessName: row.intake_submissions?.business_name ?? null,
      entityType: row.intake_submissions?.entity_type ?? null,
      clientName: row.intake_submissions?.name ?? null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      documents,
    },
  });
}
