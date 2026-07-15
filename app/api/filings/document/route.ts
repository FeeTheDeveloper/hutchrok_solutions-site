import { NextRequest } from "next/server";
import { z } from "zod";
import { getSupabaseServer } from "@/lib/supabase/server";
import { requireAdmin, isValidUUID } from "@/lib/auth";
import { apiError, ErrorCode } from "@/lib/api-response";
import { form205Builder } from "@/lib/documents";
import { fillForm205 } from "@/lib/filings/fill-form-205";
import { fillForm05904 } from "@/lib/filings/fill-form-05-904";
import type { FilingCase, IntakeSubmissionJoin, OwnerDetail } from "@/lib/types";

// pdf-lib + fs require the Node.js runtime.
export const runtime = "nodejs";

const schema = z.object({
  caseId: z.string().min(1, "Case ID is required."),
  documentType: z.enum(["form_205", "form_05_904"]).default("form_205"),
});

const SELECT = `
  id, case_number, status, assigned_to, notes, updated_at, created_at, intake_id,
  intake_submissions (
    name, email, phone, business_name, entity_type, business_purpose,
    principal_address, mailing_address, owner_details, organizer_name,
    organizer_title, veteran_status, vvl_status, fully_veteran_owned
  )
`
  .replace(/\s+/g, " ")
  .trim();

/**
 * POST /api/filings/document  (admin)
 *
 * Generates a filled Texas Form 205 (Certificate of Formation — LLC) from a
 * case's intake data and returns it as a downloadable PDF for operator review.
 */
export async function POST(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError(ErrorCode.BAD_REQUEST, "Invalid JSON body.", 400);
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return apiError(ErrorCode.VALIDATION_ERROR, "Case ID is required.", 400);
  }
  const { caseId, documentType } = parsed.data;
  if (!isValidUUID(caseId)) {
    return apiError(ErrorCode.BAD_REQUEST, "Invalid case ID format.", 400);
  }

  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("filing_cases")
    .select(SELECT)
    .eq("id", caseId)
    .single();

  if (error || !data) {
    return apiError(ErrorCode.NOT_FOUND, "Case not found.", 404);
  }

  const row = data as unknown as FilingCase & {
    intake_submissions: IntakeSubmissionJoin | null;
  };
  const intake = row.intake_submissions;

  if (!intake) {
    return apiError(ErrorCode.BAD_REQUEST, "No intake data linked to this case.", 400);
  }

  let pdfBytes: Uint8Array;
  let formLabel: string;

  try {
    if (documentType === "form_05_904") {
      // Veteran certification — valid for any entity type, but requires
      // veteran ownership context from intake.
      if (intake.veteran_status !== true) {
        return apiError(
          ErrorCode.BAD_REQUEST,
          "Form 05-904 requires a veteran-owned case.",
          400,
        );
      }
      const owners = (intake.owner_details ?? []) as OwnerDetail[];
      pdfBytes = await fillForm05904({
        entityName: intake.business_name ?? "",
        owners: owners.length > 0 ? owners : [{ name: intake.name, role: "Member" }],
      });
      formLabel = "Form-05-904";
    } else {
      const entityType = intake.entity_type ?? "llc";
      if (entityType !== "llc") {
        return apiError(
          ErrorCode.BAD_REQUEST,
          `Auto-fill currently supports Texas LLC formations (Form 205). This case is "${entityType}".`,
          400,
        );
      }
      const payload = form205Builder.buildPayload(
        row as unknown as FilingCase,
        intake,
      );
      pdfBytes = await fillForm205(payload);
      formLabel = "Form-205";
    }
  } catch (e) {
    console.error("[api/filings/document] fill error:", e);
    return apiError(
      ErrorCode.INTERNAL_ERROR,
      "Failed to generate the filing document.",
      500,
    );
  }

  const filename = `${formLabel}-${row.case_number}.pdf`;
  return new Response(pdfBytes as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
