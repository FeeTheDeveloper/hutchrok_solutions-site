/**
 * Client cases service — links filing cases to authenticated accounts.
 *
 * A case is "claimed" the first time a signed-in user's verified email
 * matches the intake email on an unclaimed case. After claiming, the
 * dashboard lists the user's cases directly — no case-number lookup needed.
 */

import { getSupabaseServer } from "@/lib/supabase/server";
import { getCaseStatusMeta } from "@/lib/case-status";

export interface ClientCaseDocument {
  filename: string;
  uploadedAt: string;
}

export interface ClientCase {
  id: string;
  caseNumber: string;
  status: string;
  statusLabel: string;
  milestone: number;
  happening: string;
  next: string;
  businessName: string | null;
  entityType: string | null;
  createdAt: string;
  updatedAt: string;
  hasVvlDocument: boolean;
  documents: ClientCaseDocument[];
}

interface CaseRow {
  id: string;
  case_number: string;
  status: string;
  created_at: string;
  updated_at: string;
  clerk_user_id: string | null;
  intake_submissions: {
    email: string | null;
    business_name: string | null;
    entity_type: string | null;
  } | null;
  case_documents: { filename: string; uploaded_at: string }[] | null;
}

const CASE_SELECT = `
  id, case_number, status, created_at, updated_at, clerk_user_id,
  intake_submissions ( email, business_name, entity_type ),
  case_documents ( filename, uploaded_at )
`
  .replace(/\s+/g, " ")
  .trim();

function toClientCase(row: CaseRow): ClientCase {
  const meta = getCaseStatusMeta(row.status);
  const documents = (row.case_documents ?? [])
    .slice()
    .sort((a, b) => b.uploaded_at.localeCompare(a.uploaded_at))
    .map((d) => ({ filename: d.filename, uploadedAt: d.uploaded_at }));
  return {
    id: row.id,
    caseNumber: row.case_number,
    status: row.status,
    statusLabel: meta.label,
    milestone: meta.milestone,
    happening: meta.happening,
    next: meta.next,
    businessName: row.intake_submissions?.business_name ?? null,
    entityType: row.intake_submissions?.entity_type ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    hasVvlDocument: documents.some((d) =>
      d.filename.toLowerCase().startsWith("vvl-"),
    ),
    documents,
  };
}

/**
 * Return all cases linked to this Clerk user, claiming any unclaimed
 * cases whose intake email matches one of the user's verified emails.
 * Failures during claiming are logged but never block the case list.
 */
export async function getClientCases(
  clerkUserId: string,
  verifiedEmails: string[],
): Promise<ClientCase[]> {
  const supabase = getSupabaseServer();
  const emails = verifiedEmails.map((e) => e.trim().toLowerCase()).filter(Boolean);

  // ── Claim unclaimed cases matching a verified email ──
  if (emails.length > 0) {
    const { data: candidates, error: candErr } = await supabase
      .from("intake_submissions")
      .select("id, email, filing_cases ( id, clerk_user_id )")
      .in("email", emails);

    if (candErr) {
      console.error("[client-cases] claim lookup error:", candErr.message);
    } else {
      const unclaimedIds = (candidates ?? [])
        .flatMap((i) => (i.filing_cases as { id: string; clerk_user_id: string | null }[]) ?? [])
        .filter((c) => !c.clerk_user_id)
        .map((c) => c.id);

      if (unclaimedIds.length > 0) {
        const { error: claimErr } = await supabase
          .from("filing_cases")
          .update({ clerk_user_id: clerkUserId, claimed_at: new Date().toISOString() })
          .in("id", unclaimedIds)
          .is("clerk_user_id", null);
        if (claimErr) {
          console.error("[client-cases] claim error:", claimErr.message);
        }
      }
    }
  }

  // ── Fetch everything linked to this user ──
  const { data, error } = await supabase
    .from("filing_cases")
    .select(CASE_SELECT)
    .eq("clerk_user_id", clerkUserId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[client-cases] list error:", error.message);
    return [];
  }

  return ((data ?? []) as unknown as CaseRow[]).map(toClientCase);
}

/**
 * Fetch a single case, verifying it belongs to this Clerk user.
 * Returns null when missing or owned by someone else.
 */
export async function getClientCaseById(
  clerkUserId: string,
  caseId: string,
): Promise<ClientCase | null> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("filing_cases")
    .select(CASE_SELECT)
    .eq("id", caseId)
    .eq("clerk_user_id", clerkUserId)
    .maybeSingle();

  if (error || !data) return null;
  return toClientCase(data as unknown as CaseRow);
}
