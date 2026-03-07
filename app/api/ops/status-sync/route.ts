import { NextRequest } from "next/server";
import { z } from "zod";
import { getSupabaseServer } from "@/lib/supabase/server";
import { apiError, apiSuccess, ErrorCode } from "@/lib/api-response";
import { requireOps } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { CASE_STATUSES } from "@/lib/types";

/**
 * POST /api/ops/status-sync
 *
 * Called by Power Automate when a case status is changed externally
 * (e.g., from a Microsoft List or Planner task). Syncs the status
 * back into the Supabase filing_cases table.
 *
 * Expected body:
 * {
 *   case_id: "uuid",
 *   status: "IN_PROGRESS",
 *   ms_list_item_id?: "string"
 * }
 */

const bodySchema = z.object({
  case_id: z.string().uuid("case_id must be a valid UUID."),
  status: z.enum(CASE_STATUSES, {
    message: `status must be one of: ${CASE_STATUSES.join(", ")}`,
  }),
  ms_list_item_id: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const denied = requireOps(request);
  if (denied) return denied;

  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const rl = rateLimit(`ops-status-sync:${ip}`, { limit: 60, windowMs: 60_000 });
  if (!rl.allowed) {
    return apiError(ErrorCode.RATE_LIMITED, "Too many requests.", 429);
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return apiError(ErrorCode.BAD_REQUEST, "Invalid JSON body.", 400);
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (key && !fields[String(key)]) fields[String(key)] = issue.message;
    }
    return apiError(ErrorCode.VALIDATION_ERROR, "Validation failed.", 422, fields);
  }

  const { case_id, status, ms_list_item_id } = parsed.data;

  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("filing_cases")
    .update({
      status,
      ...(ms_list_item_id ? { ms_list_item_id } : {}),
      ops_synced_at: new Date().toISOString(),
    })
    .eq("id", case_id)
    .select("id, case_number, status, ops_synced_at")
    .single();

  if (error || !data) {
    console.error("[api/ops/status-sync] Update error:", error?.message);
    return apiError(ErrorCode.NOT_FOUND, "Case not found or update failed.", 404);
  }

  return apiSuccess({ case: data }, 200);
}
