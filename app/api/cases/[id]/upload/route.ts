import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { ALLOWED_UPLOAD_TYPES, MAX_UPLOAD_SIZE } from "@/lib/types";

function isAuthorized(request: NextRequest): boolean {
  const token =
    request.nextUrl.searchParams.get("token") ||
    request.headers.get("authorization")?.replace("Bearer ", "");
  return !!token && token === process.env.ADMIN_TOKEN;
}

/**
 * POST /api/cases/[id]/upload?token=...
 * Accepts multipart form data with a "file" field.
 * Validates type (pdf/jpg/png) and size (10 MB).
 * Stores in Supabase Storage bucket `case-documents` under /{case_number}/{filename}.
 * Creates a `case_documents` row.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: caseId } = await params;
  const supabase = getSupabaseServer();

  // 1. Look up the case to get case_number for the storage path
  const { data: filing, error: caseErr } = await supabase
    .from("filing_cases")
    .select("id, case_number")
    .eq("id", caseId)
    .single();

  if (caseErr || !filing) {
    return NextResponse.json({ error: "Case not found." }, { status: 404 });
  }

  // 2. Parse multipart form
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid form data." },
      { status: 400 }
    );
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json(
      { error: "No file provided. Use field name 'file'." },
      { status: 400 }
    );
  }

  // 3. Validate MIME type
  if (
    !ALLOWED_UPLOAD_TYPES.includes(
      file.type as (typeof ALLOWED_UPLOAD_TYPES)[number]
    )
  ) {
    return NextResponse.json(
      {
        error: `Invalid file type "${file.type}". Allowed: PDF, JPG, PNG.`,
      },
      { status: 400 }
    );
  }

  // 4. Validate size
  if (file.size > MAX_UPLOAD_SIZE) {
    return NextResponse.json(
      {
        error: `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 10 MB.`,
      },
      { status: 400 }
    );
  }

  // 5. Read file buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // 6. Build storage path: {case_number}/{timestamp}-{filename}
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${filing.case_number}/${Date.now()}-${safeName}`;

  // 7. Upload to Supabase Storage
  const { error: uploadErr } = await supabase.storage
    .from("case-documents")
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadErr) {
    console.error("[api/cases/upload] Storage error:", uploadErr);
    return NextResponse.json(
      { error: "Failed to upload file to storage." },
      { status: 500 }
    );
  }

  // 8. Insert metadata row
  const { data: doc, error: docErr } = await supabase
    .from("case_documents")
    .insert({
      case_id: caseId,
      filename: file.name,
      mime: file.type,
      size: file.size,
      storage_path: storagePath,
    })
    .select("id, filename, mime, size, storage_path, uploaded_at")
    .single();

  if (docErr) {
    console.error("[api/cases/upload] DB insert error:", docErr);
    return NextResponse.json(
      { error: "File uploaded but failed to save metadata." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, document: doc }, { status: 201 });
}
