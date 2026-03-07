import { NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { ALLOWED_UPLOAD_TYPES, MAX_UPLOAD_SIZE } from "@/lib/types";
import { apiError, apiSuccess, ErrorCode } from "@/lib/api-response";
import { rateLimit } from "@/lib/rate-limit";
import { validateFileContent, sanitizeFilename } from "@/lib/upload-safety";

/** Max time after case creation during which public VVL upload is allowed */
const UPLOAD_WINDOW_MS = 30 * 60 * 1000; // 30 minutes

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * POST /api/intake/upload-vvl
 *
 * Public endpoint for uploading a VVL document immediately after intake
 * submission. Validates: rate limit, UUID format, case exists + is NEW +
 * was created within 30 minutes, file type (PDF/JPG/PNG), and file size
 * (10 MB).
 */
export async function POST(request: NextRequest) {
  // ── Rate limit (3 requests / 60s per IP) ──
  const ip = getClientIp(request);
  const rl = rateLimit(ip, { limit: 3, windowMs: 60_000 });
  if (!rl.allowed) {
    return apiError(ErrorCode.RATE_LIMITED, "Too many requests.", 429);
  }

  // ── Parse multipart form data ──
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return apiError(ErrorCode.BAD_REQUEST, "Invalid form data.", 400);
  }

  const caseId = formData.get("caseId") as string | null;
  const file = formData.get("file") as File | null;

  if (!caseId || !file) {
    return apiError(
      ErrorCode.BAD_REQUEST,
      "Case ID and file are required.",
      400
    );
  }

  // Validate UUID format to prevent injection
  if (!UUID_RE.test(caseId)) {
    return apiError(ErrorCode.BAD_REQUEST, "Invalid case ID.", 400);
  }

  // ── Validate file ──
  if (
    !ALLOWED_UPLOAD_TYPES.includes(
      file.type as (typeof ALLOWED_UPLOAD_TYPES)[number]
    )
  ) {
    return apiError(
      ErrorCode.BAD_REQUEST,
      "File type not allowed. Use PDF, JPG, or PNG.",
      400
    );
  }
  if (file.size > MAX_UPLOAD_SIZE) {
    return apiError(
      ErrorCode.BAD_REQUEST,
      "File too large. Maximum 10 MB.",
      400
    );
  }

  const supabase = getSupabaseServer();

  // ── Verify case ──
  const { data: filing, error: caseErr } = await supabase
    .from("filing_cases")
    .select("id, case_number, status, created_at")
    .eq("id", caseId)
    .single();

  if (caseErr || !filing) {
    return apiError(ErrorCode.NOT_FOUND, "Case not found.", 404);
  }

  if (filing.status !== "LEAD" && filing.status !== "VVL_PENDING") {
    return apiError(
      ErrorCode.BAD_REQUEST,
      "Case is not in a valid state for upload.",
      400
    );
  }

  const caseAge = Date.now() - new Date(filing.created_at).getTime();
  if (caseAge > UPLOAD_WINDOW_MS) {
    return apiError(
      ErrorCode.BAD_REQUEST,
      "Upload window has expired. Contact Hutchrok to submit documents.",
      400
    );
  }

  // ── Upload to Supabase Storage ──
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

  const storagePath = `${filing.case_number}/vvl-${safeFilename}`;

  const { error: uploadError } = await supabase.storage
    .from("case-documents")
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error(
      "[api/intake/upload-vvl] Storage upload error:",
      uploadError.message
    );
    return apiError(ErrorCode.INTERNAL_ERROR, "Failed to upload file.", 500);
  }

  // ── Create document record ──
  const { error: docError } = await supabase.from("case_documents").insert({
    case_id: filing.id,
    filename: `vvl-${safeFilename}`,
    mime: file.type,
    size: file.size,
    storage_path: storagePath,
  });

  if (docError) {
    console.error(
      "[api/intake/upload-vvl] Doc record error:",
      docError.message
    );
    // File was uploaded but record failed — still partial success
  }

  return apiSuccess({ uploaded: true, filename: safeFilename }, 201);
}
