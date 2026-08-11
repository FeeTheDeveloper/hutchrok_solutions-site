export type MemberBusiness = {
  legalName: string;
  entityType: string;
  formationStatus: string;
  einStatus: string;
  veteranCertificationStatus: string;
};

export type PremiumMemberRecord = {
  memberCode: string;
  displayName: string;
  membershipTier: "Premium";
  vvlEnabled: boolean;
  businesses: MemberBusiness[];
};

type PublicMetadata = Record<string, unknown> | null | undefined;

export function getMemberAccess(metadata: PublicMetadata): {
  memberCode: string;
  membershipTier: "Premium";
  vvlEnabled: boolean;
} | null {
  const memberCode = metadata?.memberCode;
  const membershipTier = metadata?.membershipTier;
  const vvlEnabled = metadata?.vvlEnabled;

  if (
    typeof memberCode !== "string" ||
    memberCode.trim().length < 3 ||
    membershipTier !== "premium" ||
    vvlEnabled !== true
  ) {
    return null;
  }

  return {
    memberCode: memberCode.trim(),
    membershipTier: "Premium",
    vvlEnabled: true,
  };
}
