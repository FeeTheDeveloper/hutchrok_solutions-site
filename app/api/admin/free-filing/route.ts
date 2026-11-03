import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { apiError, apiSuccess, ErrorCode } from "@/lib/api-response";
import { FreeFilingError, setEntitlementStatus } from "@/lib/free-filing";

const bodySchema = z.object({
  clerkUserId: z.string().trim().min(1),
  action: z.enum(["verify", "revoke", "link_case"]),
  actor: z.string().trim().min(1).max(120),
  note: z.string().trim().max(1000).optional(),
  filingCaseId: z.string().uuid().optional(),
});

/**
 * POST /api/admin/free-filing  (Authorization: Bearer ADMIN_TOKEN)
 * Ops verifies a veteran's eligibility (VVL/TVC confirmed), revokes, or links
 * the redeemed entitlement to its filing case.
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
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return apiError(ErrorCode.VALIDATION_ERROR, "Invalid request.", 400);
  }
  if (parsed.data.action === "link_case" && !parsed.data.filingCaseId) {
    return apiError(ErrorCode.VALIDATION_ERROR, "filingCaseId is required for link_case.", 400);
  }

  try {
    const entitlement = await setEntitlementStatus(parsed.data);
    return apiSuccess({ entitlement });
  } catch (e) {
    if (e instanceof FreeFilingError) return apiError(ErrorCode.NOT_FOUND, e.message, 404);
    console.error("[api/admin/free-filing] failed:", e instanceof Error ? e.message : e);
    return apiError(ErrorCode.INTERNAL_ERROR, "Update failed.", 500);
  }
}
