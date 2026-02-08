import { NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { CASE_STATUSES } from "@/lib/types";
import { apiError, apiSuccess, ErrorCode } from "@/lib/api-response";

function isAuthorized(request: NextRequest): boolean {
  const token =
    request.nextUrl.searchParams.get("token") ||
    request.headers.get("authorization")?.replace("Bearer ", "");
  return !!token && token === process.env.ADMIN_TOKEN;
}

/**
 * GET /api/admin/cases/[id]?token=...
 * Returns a single case with intake data.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(request)) {
    return apiError(ErrorCode.UNAUTHORIZED, "Invalid or missing token.", 401);
  }

  const { id } = await params;
  const supabase = getSupabaseServer();

  const { data, error } = await supabase
    .from("filing_cases")
    .select(
      `*, intake_submissions ( name, email, phone, business_stage, service_needed, message )`
    )
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
  if (!isAuthorized(request)) {
    return apiError(ErrorCode.UNAUTHORIZED, "Invalid or missing token.", 401);
  }

  const { id } = await params;
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

  if (Object.keys(updates).length === 0) {
    return apiError(ErrorCode.BAD_REQUEST, "No valid fields to update.", 400);
  }

  const supabase = getSupabaseServer();

  const { data, error } = await supabase
    .from("filing_cases")
    .update(updates)
    .eq("id", id)
    .select(
      `*, intake_submissions ( name, email, phone, business_stage, service_needed, message )`
    )
    .single();

  if (error) {
    console.error("[api/admin/cases] Update error:", error.code, error.message);
    return apiError(ErrorCode.INTERNAL_ERROR, "Failed to update case.", 500);
  }

  return apiSuccess({ case: data });
}
