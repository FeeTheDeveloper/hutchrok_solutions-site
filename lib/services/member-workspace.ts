import { getSupabaseServer } from "@/lib/supabase/server";
import type { PremiumMemberRecord } from "@/lib/members/registry";

type MemberRow = {
  member_code: string;
  display_name: string;
  membership_tier: string;
  vvl_enabled: boolean;
  account_status: string;
};

type BusinessRow = {
  legal_name: string;
  entity_type: string;
  formation_status: string;
  ein_status: string;
  veteran_certification_status: string;
};

export async function getPremiumMemberWorkspace(
  clerkUserId: string,
  expectedMemberCode: string,
): Promise<PremiumMemberRecord | null> {
  const supabase = getSupabaseServer();
  const { data: member, error: memberError } = await supabase
    .from("premium_members")
    .select("member_code, display_name, membership_tier, vvl_enabled, account_status")
    .eq("clerk_user_id", clerkUserId)
    .eq("member_code", expectedMemberCode)
    .eq("account_status", "ACTIVE")
    .maybeSingle();

  if (memberError) throw new Error(`[member-workspace] member fetch failed: ${memberError.message}`);
  if (!member) return null;

  const { data: businesses, error: businessesError } = await supabase
    .from("member_businesses")
    .select("legal_name, entity_type, formation_status, ein_status, veteran_certification_status")
    .eq("clerk_user_id", clerkUserId)
    .order("legal_name");

  if (businessesError) {
    throw new Error(`[member-workspace] business fetch failed: ${businessesError.message}`);
  }

  const row = member as MemberRow;
  if (row.membership_tier !== "Premium") return null;

  return {
    memberCode: row.member_code,
    displayName: row.display_name,
    membershipTier: "Premium",
    vvlEnabled: row.vvl_enabled,
    businesses: ((businesses ?? []) as BusinessRow[]).map((business) => ({
      legalName: business.legal_name,
      entityType: business.entity_type,
      formationStatus: business.formation_status,
      einStatus: business.ein_status,
      veteranCertificationStatus: business.veteran_certification_status,
    })),
  };
}
