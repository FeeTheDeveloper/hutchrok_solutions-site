import { NextRequest } from "next/server";
import { z } from "zod";
import { apiError, apiSuccess, ErrorCode } from "@/lib/api-response";
import { getConfig } from "@/lib/config";
import { getSupabaseServer } from "@/lib/supabase/server";

const businessSchema = z.object({
  legalName: z.string().trim().min(2).max(300),
  entityType: z.string().trim().min(2).max(80),
  formationStatus: z.string().trim().min(2).max(100).default("Rostered"),
  einStatus: z.string().trim().min(2).max(100).default("Pending document"),
  veteranCertificationStatus: z.string().trim().min(2).max(100).default("Not Started"),
  storageReference: z.string().trim().max(500).nullable().optional(),
});

const provisionSchema = z.object({
  clerkUserId: z.string().trim().min(3).max(200),
  memberCode: z.string().trim().min(3).max(100),
  legalName: z.string().trim().min(2).max(300),
  displayName: z.string().trim().min(2).max(200),
  vvlEnabled: z.boolean().default(false),
  businesses: z.array(businessSchema).max(100),
});

export async function POST(request: NextRequest) {
  const supplied =
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    request.headers.get("x-admin-token");
  if (!supplied || supplied !== getConfig().adminToken) {
    return apiError(ErrorCode.UNAUTHORIZED, "Valid administrator authorization is required.", 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError(ErrorCode.BAD_REQUEST, "Invalid JSON body.", 400);
  }

  const parsed = provisionSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(ErrorCode.VALIDATION_ERROR, "Invalid member provisioning payload.", 400);
  }

  const input = parsed.data;
  const supabase = getSupabaseServer();

  try {
    const { error: memberError } = await supabase.from("premium_members").upsert(
      {
        clerk_user_id: input.clerkUserId,
        member_code: input.memberCode,
        legal_name: input.legalName,
        display_name: input.displayName,
        membership_tier: "Premium",
        vvl_enabled: input.vvlEnabled,
        account_status: "ACTIVE",
      },
      { onConflict: "clerk_user_id" },
    );
    if (memberError) throw new Error(memberError.message);

    for (const business of input.businesses) {
      const { error } = await supabase.from("member_businesses").upsert(
        {
          clerk_user_id: input.clerkUserId,
          legal_name: business.legalName,
          entity_type: business.entityType,
          formation_status: business.formationStatus,
          ein_status: business.einStatus,
          veteran_certification_status: business.veteranCertificationStatus,
          storage_reference: business.storageReference ?? null,
        },
        { onConflict: "clerk_user_id,legal_name" },
      );
      if (error) throw new Error(error.message);
    }

    return apiSuccess({
      memberCode: input.memberCode,
      businessCount: input.businesses.length,
      status: "ACTIVE",
    });
  } catch (error) {
    console.error("[api/admin/members/provision] failed:", error instanceof Error ? error.message : String(error));
    return apiError(ErrorCode.INTERNAL_ERROR, "Member provisioning failed.", 500);
  }
}
