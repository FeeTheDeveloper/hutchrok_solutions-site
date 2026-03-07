import { NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { apiError, apiSuccess, ErrorCode } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

/**
 * GET /api/admin/cases?token=...&status=...
 * Returns all filing cases with joined intake data.
 */
export async function GET(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  // Rate limit admin list endpoint (30 req/min per token to prevent scraping)
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const rl = rateLimit(`admin-list:${ip}`, { limit: 30, windowMs: 60_000 });
  if (!rl.allowed) {
    return new Response("Too many requests.", { status: 429 });
  }

  const supabase = getSupabaseServer();
  const statusFilter = request.nextUrl.searchParams.get("status");

  let query = supabase
    .from("filing_cases")
    .select(
      `*, intake_submissions ( name, email, phone, business_stage, service_needed, message, veteran_status, vvl_status, business_name, entity_type, business_purpose, principal_address, mailing_address, texas_confirmed, launch_timeline, all_owners_veterans, fully_veteran_owned, owner_details, organizer_name, organizer_title, registered_agent_preference, operator_review_confirmed, eligibility_answers )`
    )
    .order("created_at", { ascending: false });

  if (statusFilter && statusFilter !== "ALL") {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[api/admin/cases] Fetch error:", error.code, error.message);
    return apiError(ErrorCode.INTERNAL_ERROR, "Failed to fetch cases.", 500);
  }

  return apiSuccess({ cases: data ?? [] });
}
