import { NextRequest } from "next/server";
import { z } from "zod";
import { getSupabaseServer } from "@/lib/supabase/server";
import { requireAdmin, isValidUUID } from "@/lib/auth";
import { apiError, apiSuccess, ErrorCode } from "@/lib/api-response";
import {
  getFilingTemplatesForCase,
  VETERAN_SUPPLEMENT,
  ENTITY_TEMPLATE_MAP,
} from "@/lib/filings/template-map";

// ── Input validation ──

const generateSchema = z.object({
  caseId: z.string().min(1, "Case ID is required."),
  documentTypes: z.array(z.string()).optional(),
});

// ── Intake join for fetching case + intake data ──

interface FilingCaseRow {
  id: string;
  case_number: string;
  status: string;
  intake_id: string;
  intake_submissions: {
    entity_type: string | null;
    veteran_status: boolean | null;
    business_name: string | null;
    all_owners_veterans: boolean | null;
    fully_veteran_owned: boolean | null;
    dba_name: string | null;
    nonprofit_purpose: string | null;
  } | null;
}

const INTAKE_JOIN = `
  id, case_number, status, intake_id,
  intake_submissions (
    entity_type, veteran_status, business_name,
    all_owners_veterans, fully_veteran_owned,
    dba_name, nonprofit_purpose
  )
`.replace(/\s+/g, " ").trim();

/**
 * POST /api/filings/generate
 *
 * Resolves the filing template(s) for a case based on entity type and
 * veteran status. Returns a structured manifest of forms to generate.
 *
 * Requires admin authentication.
 */
export async function POST(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  // ── Parse & validate body ──
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError(ErrorCode.BAD_REQUEST, "Invalid JSON body.", 400);
  }

  const parsed = generateSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return apiError(ErrorCode.VALIDATION_ERROR, "Invalid input.", 400, fieldErrors);
  }

  const { caseId, documentTypes } = parsed.data;

  if (!isValidUUID(caseId)) {
    return apiError(ErrorCode.BAD_REQUEST, "Invalid case ID format.", 400);
  }

  // ── Fetch case with intake data ──
  const supabase = getSupabaseServer();

  const { data, error } = await supabase
    .from("filing_cases")
    .select(INTAKE_JOIN)
    .eq("id", caseId)
    .single();

  if (error || !data) {
    return apiError(ErrorCode.NOT_FOUND, "Case not found.", 404);
  }

  const filing = data as unknown as FilingCaseRow;
  const intake = filing.intake_submissions;

  if (!intake) {
    return apiError(ErrorCode.BAD_REQUEST, "No intake data linked to this case.", 400);
  }

  const entityType = intake.entity_type ?? "llc";

  // ── Resolve templates ──
  const resolved = getFilingTemplatesForCase({
    entityType,
    veteranStatus: intake.veteran_status ?? undefined,
    fullyVeteranOwned: intake.fully_veteran_owned ?? undefined,
  });

  if (!resolved) {
    return apiError(
      ErrorCode.BAD_REQUEST,
      `Unsupported entity type: "${entityType}". No template mapping exists.`,
      400,
    );
  }

  // ── Apply optional documentTypes filter ──
  let templatesSelected = resolved.all;

  if (documentTypes && documentTypes.length > 0) {
    templatesSelected = [];
    if (documentTypes.includes(resolved.primary.path) || documentTypes.includes("primary")) {
      templatesSelected.push(resolved.primary);
    }
    if (documentTypes.includes(VETERAN_SUPPLEMENT.path) || documentTypes.includes("veteran")) {
      templatesSelected.push(VETERAN_SUPPLEMENT);
    }
    if (templatesSelected.length === 0) {
      return apiError(
        ErrorCode.BAD_REQUEST,
        "None of the requested document types matched available templates.",
        400,
      );
    }
  }

  const veteranSupplementIncluded = templatesSelected.some(
    (t) => t.path === VETERAN_SUPPLEMENT.path,
  );

  return apiSuccess(
    {
      caseId: filing.id,
      caseNumber: filing.case_number,
      entityType,
      businessName: intake.business_name ?? null,
      templatesSelected: templatesSelected.map((t) => ({
        path: t.path,
        label: t.label,
      })),
      veteranSupplementIncluded,
    },
    200,
  );
}
