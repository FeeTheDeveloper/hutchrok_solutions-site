import "server-only";
import { getSupabaseServer } from "@/lib/supabase/server";

/**
 * One free Texas veteran LLC filing per account.
 *
 * The entitlement is created when a signed-in member opens it, verified by
 * ops after the Texas Veterans Commission Veteran Verification Letter is
 * confirmed, and redeemed once by the member.
 */

export type FreeFilingStatus =
  | "PENDING_VERIFICATION"
  | "VERIFIED"
  | "REDEEMED"
  | "REVOKED";

export interface FreeFilingEntitlement {
  id: string;
  clerk_user_id: string;
  email: string;
  status: FreeFilingStatus;
  verified_at: string | null;
  redeemed_at: string | null;
  filing_case_id: string | null;
  created_at: string;
}

const COLUMNS =
  "id, clerk_user_id, email, status, verified_at, redeemed_at, filing_case_id, created_at";

export class FreeFilingError extends Error {
  constructor(
    public code: "EMAIL_ALREADY_USED" | "NOT_VERIFIED" | "ALREADY_REDEEMED" | "REVOKED" | "NOT_FOUND",
    message: string,
  ) {
    super(message);
  }
}

export async function getOrCreateEntitlement(input: {
  clerkUserId: string;
  email: string;
}): Promise<FreeFilingEntitlement> {
  const supabase = getSupabaseServer();
  const existing = await supabase
    .from("free_filing_entitlements")
    .select(COLUMNS)
    .eq("clerk_user_id", input.clerkUserId)
    .maybeSingle();
  if (existing.error) throw new Error(existing.error.message);
  if (existing.data) return existing.data as unknown as FreeFilingEntitlement;

  const inserted = await supabase
    .from("free_filing_entitlements")
    .insert({ clerk_user_id: input.clerkUserId, email: input.email.trim() })
    .select(COLUMNS)
    .single();
  if (inserted.error) {
    // 23505 = unique violation on lower(email): this email already holds the benefit.
    if (inserted.error.code === "23505") {
      throw new FreeFilingError(
        "EMAIL_ALREADY_USED",
        "This email is already linked to a free filing on another account.",
      );
    }
    throw new Error(inserted.error.message);
  }
  return inserted.data as unknown as FreeFilingEntitlement;
}

/** Member claims their verified free filing. Single-use, race-safe. */
export async function redeemEntitlement(clerkUserId: string): Promise<FreeFilingEntitlement> {
  const supabase = getSupabaseServer();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("free_filing_entitlements")
    .update({ status: "REDEEMED", redeemed_at: now, updated_at: now })
    .eq("clerk_user_id", clerkUserId)
    .eq("status", "VERIFIED")
    .select(COLUMNS)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (data) return data as unknown as FreeFilingEntitlement;

  const current = await supabase
    .from("free_filing_entitlements")
    .select("status")
    .eq("clerk_user_id", clerkUserId)
    .maybeSingle();
  const status = (current.data as { status?: FreeFilingStatus } | null)?.status;
  if (status === "REDEEMED") {
    throw new FreeFilingError("ALREADY_REDEEMED", "Your free filing has already been used.");
  }
  if (status === "REVOKED") {
    throw new FreeFilingError("REVOKED", "This free filing is no longer available.");
  }
  if (!status) throw new FreeFilingError("NOT_FOUND", "No free filing found for this account.");
  throw new FreeFilingError(
    "NOT_VERIFIED",
    "Your veteran verification is still under review.",
  );
}

/** Ops-only state changes. */
export async function setEntitlementStatus(input: {
  clerkUserId: string;
  action: "verify" | "revoke" | "link_case";
  actor: string;
  note?: string;
  filingCaseId?: string;
}): Promise<FreeFilingEntitlement> {
  const supabase = getSupabaseServer();
  const now = new Date().toISOString();
  let patch: Record<string, unknown>;
  let allowedFrom: FreeFilingStatus[];

  switch (input.action) {
    case "verify":
      patch = {
        status: "VERIFIED",
        verified_at: now,
        verified_by: input.actor,
        verification_note: input.note ?? null,
      };
      allowedFrom = ["PENDING_VERIFICATION"];
      break;
    case "revoke":
      patch = { status: "REVOKED", revoked_reason: input.note ?? "Revoked by ops" };
      allowedFrom = ["PENDING_VERIFICATION", "VERIFIED"];
      break;
    case "link_case":
      patch = { filing_case_id: input.filingCaseId };
      allowedFrom = ["REDEEMED"];
      break;
  }

  const { data, error } = await supabase
    .from("free_filing_entitlements")
    .update({ ...patch, updated_at: now })
    .eq("clerk_user_id", input.clerkUserId)
    .in("status", allowedFrom)
    .select(COLUMNS)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) {
    throw new FreeFilingError(
      "NOT_FOUND",
      `No entitlement in a state that allows "${input.action}".`,
    );
  }
  return data as unknown as FreeFilingEntitlement;
}
