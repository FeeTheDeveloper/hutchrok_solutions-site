import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { CASE_STATUSES } from "@/lib/types";

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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    return NextResponse.json({ error: "Case not found." }, { status: 404 });
  }

  return NextResponse.json({ case: data });
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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  // Whitelist updatable fields
  const updates: Record<string, unknown> = {};
  if (body.status && CASE_STATUSES.includes(body.status)) {
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
    return NextResponse.json(
      { error: "No valid fields to update." },
      { status: 400 }
    );
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
    console.error("[api/admin/cases] Update error:", error);
    return NextResponse.json(
      { error: "Failed to update case." },
      { status: 500 }
    );
  }

  return NextResponse.json({ case: data });
}
