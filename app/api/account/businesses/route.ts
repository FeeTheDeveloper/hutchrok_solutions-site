import { NextRequest } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { z } from "zod";
import { apiError, apiSuccess, ErrorCode } from "@/lib/api-response";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getMemberAccess } from "@/lib/members/registry";

const businessSchema = z.object({
  legalName: z.string().trim().min(2).max(300),
  entityType: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(40),
  ownershipRole: z.string().trim().min(2).max(100),
  businessAddress: z.string().trim().min(5).max(500),
  formationStatus: z.string().trim().min(2).max(100),
  einStatus: z.string().trim().min(2).max(100),
  veteranCertificationStatus: z.string().trim().min(2).max(100),
  notes: z.string().trim().max(2000).optional().default(""),
});

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return apiError(ErrorCode.UNAUTHORIZED, "Sign in to add a business.", 401);

  const user = await currentUser();
  const member = getMemberAccess(user?.publicMetadata);
  if (!member?.vvlEnabled) {
    return apiError(ErrorCode.UNAUTHORIZED, "VVL-enabled membership is required.", 403);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError(ErrorCode.BAD_REQUEST, "Invalid JSON body.", 400);
  }

  const parsed = businessSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(ErrorCode.VALIDATION_ERROR, "Complete all required business fields.", 400);
  }

  try {
    const supabase = getSupabaseServer();
    const { data: existing, error: lookupError } = await supabase
      .from("member_business_submissions")
      .select("id")
      .eq("clerk_user_id", userId)
      .ilike("legal_name", parsed.data.legalName)
      .maybeSingle();

    if (lookupError) throw new Error(lookupError.message);
    if (existing) {
      return apiError(ErrorCode.BAD_REQUEST, "This business is already attached or pending review.", 409);
    }

    const { data, error } = await supabase
      .from("member_business_submissions")
      .insert({
        clerk_user_id: userId,
        member_code: member.memberCode,
        legal_name: parsed.data.legalName,
        entity_type: parsed.data.entityType,
        formation_state: parsed.data.state.toUpperCase(),
        ownership_role: parsed.data.ownershipRole,
        business_address: parsed.data.businessAddress,
        formation_status: parsed.data.formationStatus,
        ein_status: parsed.data.einStatus,
        veteran_certification_status: parsed.data.veteranCertificationStatus,
        notes: parsed.data.notes,
        review_status: "MEMBER_SUBMITTED_REVIEW_REQUIRED",
      })
      .select("id, legal_name, review_status, created_at")
      .single();

    if (error) throw new Error(error.message);
    return apiSuccess({ business: data });
  } catch (error) {
    console.error("[api/account/businesses] submission failed:", error instanceof Error ? error.message : String(error));
    return apiError(ErrorCode.INTERNAL_ERROR, "Unable to submit the business for review.", 500);
  }
}
