import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { ALLOWED_UPLOAD_TYPES, MAX_UPLOAD_SIZE } from "@/lib/types";
import { apiError, apiSuccess, ErrorCode } from "@/lib/api-response";
import { rateLimit } from "@/lib/rate-limit";
import { validateFileContent, sanitizeFilename } from "@/lib/upload-safety";

/** Case statuses that still accept client document uploads. */
const UPLOADABLE_STATUSES = new Set([
  "LEAD",
  "ELIGIBILITY_PENDING",
  "VVL_PENDING",
  "READY_FOR_INTAKE",
  "IN_REVIEW",
]);

/**
 * POST /api/client/cases/[id]/upload
 *
 * Authenticated client document upload (e.g. the TVC verification letter).
 * Unlike the public post-intake endpoint, there is no 30-minute window —
 * ownership is enforced via the Clerk session and the case's clerk_user_id,
 * so a signed-in client can attach documents any time before filing.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return apiError(ErrorCode.UNAUTHORIZED, "Sign in to upload documents.", 401);
  }

  // ── Rate limit (5 uploads / 60s per user) ──
  const rl = rateLimit(`client-upload:${userId}`, { limit: 5, windowMs: 60_000 });
  if (!rl.allowed) {
    return apiError(ErrorCode.RATE_LIMITED, "Too many uploads. Please wait a moment.", 429);
  }

  const { id: caseId } = await params;
  const supabase = getSupabaseServer();

  // ── Ownership check: the case must be claimed by this user ──
  const { data: filing, error: caseErr } = await supabase
    .from("filing_cases")
    .select("id, case_number, status, clerk_user_id")
    .eq("id", caseId)
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (caseErr || !filing) {
    return apiError(ErrorCode.NOT_FOUND, "Case not found.", 404);
  }

  if (!UPLOADABLE_STATUSES.has(filing.status)) {
    return apiError(
      ErrorCode.BAD_REQUEST,
      "This case is past the document-collection stage. Contact Hutchrok to submit documents.",
      400,
    );
  }

  // ── Parse multipart form ──
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return apiError(ErrorCode.BAD_REQUEST, "Invalid form data.", 400);
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return apiError(ErrorCode.BAD_REQUEST, "No file provided. Use field name 'file'.", 400);
  }

  // ── Validate file ──
  if (
    !ALLOWED_UPLOAD_TYPES.includes(
      file.type as (typeof ALLOWED_UPLOAD_TYPES)[number],
    )
  ) {
    return apiError(
      ErrorCode.BAD_REQUEST,
      "File type not allowed. Use PDF, JPG, or PNG.",
      400,
    );
  }
  if (file.size > MAX_UPLOAD_SIZE) {
    return apiError(ErrorCode.BAD_REQUEST, "File too large. Maximum 10 MB.", 400);
  }

  const safeFilename = sanitizeFilename(file.name);
  if (!safeFilename) {
    return apiError(
      ErrorCode.BAD_REQUEST,
      "File has an unsupported extension. Use PDF, JPG, or PNG.",
      400,
    );
  }

  const buffer = new Uint8Array(await file.arrayBuffer());

  // Verify file content matches claimed MIME type (magic bytes)
  const contentError = validateFileContent(buffer, file.type);
  if (contentError) {
    return apiError(ErrorCode.BAD_REQUEST, contentError, 400);
  }

  // Client uploads are prefixed vvl- when flagged as the verification letter
  const isVvl = formData.get("kind") === "vvl";
  const finalName = isVvl ? `vvl-${safeFilename}` : safeFilename;
  const storagePath = `${filing.case_number}/${finalName}`;

  const { error: uploadError } = await supabase.storage
    .from("case-documents")
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    console.error("[api/client/upload] Storage error:", uploadError.message);
    return apiError(ErrorCode.INTERNAL_ERROR, "Failed to upload file.", 500);
  }

  const { error: docError } = await supabase.from("case_documents").insert({
    case_id: filing.id,
    filename: finalName,
    mime: file.type,
    size: file.size,
    storage_path: storagePath,
  });

  if (docError) {
    console.error("[api/client/upload] Doc record error:", docError.message);
  }

  return apiSuccess({ uploaded: true, filename: finalName }, 201);
}
