import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

/**
 * Validate the admin token from query params or Authorization header.
 */
function isAuthorized(request: NextRequest): boolean {
  const token =
    request.nextUrl.searchParams.get("token") ||
    request.headers.get("authorization")?.replace("Bearer ", "");
  return !!token && token === process.env.ADMIN_TOKEN;
}

/**
 * GET /api/admin/cases?token=...&status=...
 * Returns all filing cases with joined intake data.
 */
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseServer();
  const statusFilter = request.nextUrl.searchParams.get("status");

  let query = supabase
    .from("filing_cases")
    .select(
      `*, intake_submissions ( name, email, phone, business_stage, service_needed, message )`
    )
    .order("created_at", { ascending: false });

  if (statusFilter && statusFilter !== "ALL") {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[api/admin/cases] Fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cases." },
      { status: 500 }
    );
  }

  return NextResponse.json({ cases: data ?? [] });
}
