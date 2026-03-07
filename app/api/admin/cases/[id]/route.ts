import { NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { CASE_STATUSES } from "@/lib/types";
import { apiError, apiSuccess, ErrorCode } from "@/lib/api-response";
import { requireAdmin, isValidUUID } from "@/lib/auth";
import { emitStatusChangeEvents } from "@/lib/notifications";
import { recordCaseUpdate, AUDIT_ACTIONS } from "@/lib/audit";
import { recordAudit } from "@/lib/audit/logger";

const INTAKE_JOIN = `*, intake_submissions ( name, email, phone, business_stage, service_needed, message, veteran_status, vvl_status, business_name, entity_type, business_purpose, principal_address, mailing_address, texas_confirmed, launch_timeline, all_owners_veterans, fully_veteran_owned, owner_details, organizer_name, organizer_title, registered_agent_preference, operator_review_confirmed, eligibility_answers )`;

/**
 * GET /api/admin/cases/[id]?token=...
 * Returns a single case with intake data.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const { id } = await params;
  if (!isValidUUID(id)) {
    return apiError(ErrorCode.BAD_REQUEST, "Invalid case ID format.", 400);
  }
  const supabase = getSupabaseServer();

  const { data, error } = await supabase
    .from("filing_cases")
    .select(INTAKE_JOIN)
    .eq("id", id)
    .single();

  if (error || !data) {
    return apiError(ErrorCode.NOT_FOUND, "Case not found.", 404);
  }

  return apiSuccess({ case: data });
}

/**
 * PATCH /api/admin/cases/[id]?token=...
 * Update case fields: status, assigned_to, due_date, notes.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const { id } = await params;
  if (!isValidUUID(id)) {
    return apiError(ErrorCode.BAD_REQUEST, "Invalid case ID format.", 400);
  }
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return apiError(ErrorCode.BAD_REQUEST, "Invalid JSON body.", 400);
  }

  // Whitelist updatable fields
  const updates: Record<string, unknown> = {};
  if (body.status && CASE_STATUSES.includes(body.status as typeof CASE_STATUSES[number])) {
    updates.status = body.status;
  }
  if (body.assigned_to !== undefined) {
    updates.assigned_to = body.assigned_to || null;
  }
  if (body.due_date !== undefined) {
    updates.due_date = body.due_date || null;
  }
  if (body.notes !== undefined) {
    updates.notes = body.notes || null;
  }
  if (body.handoff_data !== undefined) {
    updates.handoff_data = body.handoff_data || null;
  }

  if (Object.keys(updates).length === 0) {
    return apiError(ErrorCode.BAD_REQUEST, "No valid fields to update.", 400);
  }

  const supabase = getSupabaseServer();

  const { data, error } = await supabase
    .from("filing_cases")
    .update(updates)
    .eq("id", id)
    .select(INTAKE_JOIN)
    .single();

  if (error) {
    console.error("[api/admin/cases] Update error:", error.code, error.message);
    return apiError(ErrorCode.INTERNAL_ERROR, "Failed to update case.", 500);
  }

  // Emit lifecycle events when status changes
  if (updates.status) {
    emitStatusChangeEvents(
      id,
      data.case_number,
      (body._old_status as string) ?? "",
      updates.status as string,
    );
  }

  // Record audit trail (fire-and-forget)
  recordCaseUpdate(id, "operator", {
    status: body._old_status ?? data.status,
    assigned_to: body._old_assigned_to ?? null,
    due_date: body._old_due_date ?? null,
    notes: body._old_notes ?? null,
  }, updates);

  return apiSuccess({ case: data });
}
