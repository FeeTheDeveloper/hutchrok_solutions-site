import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

function isAuthorized(request: NextRequest): boolean {
  const token =
    request.nextUrl.searchParams.get("token") ||
    request.headers.get("authorization")?.replace("Bearer ", "");
  return !!token && token === process.env.ADMIN_TOKEN;
}

/**
 * GET /api/cases/[id]/documents?token=...
 * Returns all documents for a case with signed download URLs.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: caseId } = await params;
  const supabase = getSupabaseServer();

  // Fetch document records
  const { data: docs, error } = await supabase
    .from("case_documents")
    .select("*")
    .eq("case_id", caseId)
    .order("uploaded_at", { ascending: false });

  if (error) {
    console.error("[api/cases/documents] Fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents." },
      { status: 500 }
    );
  }

  // Generate signed download URLs (valid for 1 hour)
  const documents = await Promise.all(
    (docs ?? []).map(async (doc) => {
      const { data } = await supabase.storage
        .from("case-documents")
        .createSignedUrl(doc.storage_path, 3600);

      return {
        ...doc,
        download_url: data?.signedUrl ?? null,
      };
    })
  );

  return NextResponse.json({ documents });
}

/**
 * DELETE /api/cases/[id]/documents?token=...&docId=...
 * Deletes a document from storage and the database.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: caseId } = await params;
  const docId = request.nextUrl.searchParams.get("docId");

  if (!docId) {
    return NextResponse.json(
      { error: "Missing docId query parameter." },
      { status: 400 }
    );
  }

  const supabase = getSupabaseServer();

  // Fetch the document to get storage_path
  const { data: doc, error: fetchErr } = await supabase
    .from("case_documents")
    .select("id, storage_path")
    .eq("id", docId)
    .eq("case_id", caseId)
    .single();

  if (fetchErr || !doc) {
    return NextResponse.json(
      { error: "Document not found." },
      { status: 404 }
    );
  }

  // Remove from storage
  const { error: storageErr } = await supabase.storage
    .from("case-documents")
    .remove([doc.storage_path]);

  if (storageErr) {
    console.error("[api/cases/documents] Storage delete error:", storageErr);
  }

  // Remove DB record
  const { error: dbErr } = await supabase
    .from("case_documents")
    .delete()
    .eq("id", docId);

  if (dbErr) {
    console.error("[api/cases/documents] DB delete error:", dbErr);
    return NextResponse.json(
      { error: "Failed to delete document record." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
