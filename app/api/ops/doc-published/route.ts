import { NextRequest } from "next/server";
import { z } from "zod";
import { getSupabaseServer } from "@/lib/supabase/server";
import { apiError, apiSuccess, ErrorCode } from "@/lib/api-response";
import { requireOps } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

/**
 * POST /api/ops/doc-published
 *
 * Called by Power Automate after a document is published to SharePoint.
 * Updates the case_documents row with its SharePoint item ID and
 * refreshes the case-level ops_synced_at timestamp.
 *
 * Expected body:
 * {
 *   case_id: "uuid",
 *   document_id: "uuid",
 *   sharepoint_item_id: "string"
 * }
 */

const bodySchema = z.object({
  case_id: z.string().uuid("case_id must be a valid UUID."),
  document_id: z.string().uuid("document_id must be a valid UUID."),
  sharepoint_item_id: z.string().min(1, "sharepoint_item_id is required."),
});

export async function POST(request: NextRequest) {
  const denied = requireOps(request);
  if (denied) return denied;

  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const rl = rateLimit(`ops-doc-published:${ip}`, { limit: 60, windowMs: 60_000 });
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

  const { case_id, document_id, sharepoint_item_id } = parsed.data;
  const supabase = getSupabaseServer();

  // Update the document row
  const { data: doc, error: docError } = await supabase
    .from("case_documents")
    .update({ sharepoint_item_id })
    .eq("id", document_id)
    .eq("case_id", case_id)
    .select("id, filename, sharepoint_item_id")
    .single();

  if (docError || !doc) {
    console.error("[api/ops/doc-published] Doc update error:", docError?.message);
    return apiError(ErrorCode.NOT_FOUND, "Document not found or update failed.", 404);
  }

  // Touch the case-level sync timestamp
  await supabase
    .from("filing_cases")
    .update({ ops_synced_at: new Date().toISOString() })
    .eq("id", case_id);

  return apiSuccess({ document: doc }, 200);
}
