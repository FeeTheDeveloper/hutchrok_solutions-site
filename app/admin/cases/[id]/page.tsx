"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CASE_STATUSES, type FilingCase, type CaseStatus, type CaseDocument, ALLOWED_UPLOAD_TYPES, MAX_UPLOAD_SIZE } from "@/lib/types";
import { ArrowLeft, Save, ShieldAlert, Loader2, Upload, FileText, Image, Trash2, Download } from "lucide-react";
import Link from "next/link";

export default function CaseDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-cream">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <CaseDetailContent />
    </Suspense>
  );
}

const STATUS_COLORS: Record<CaseStatus, string> = {
  NEW: "bg-blue-100 text-blue-800 border-blue-200",
  IN_REVIEW: "bg-yellow-100 text-yellow-800 border-yellow-200",
  NEEDS_INFO: "bg-orange-100 text-orange-800 border-orange-200",
  IN_PROGRESS: "bg-purple-100 text-purple-800 border-purple-200",
  FILED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  COMPLETED: "bg-green-100 text-green-800 border-green-200",
};

const STATUS_LABELS: Record<CaseStatus, string> = {
  NEW: "New",
  IN_REVIEW: "In Review",
  NEEDS_INFO: "Needs Info",
  IN_PROGRESS: "In Progress",
  FILED: "Filed",
  COMPLETED: "Completed",
};

function CaseDetailContent() {
  const searchParams = useSearchParams();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";
  const caseId = params.id;

  const [filing, setFiling] = useState<FilingCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Editable fields
  const [status, setStatus] = useState<CaseStatus>("NEW");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

  // Documents
  const [documents, setDocuments] = useState<CaseDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchCase = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/cases/${caseId}?token=${encodeURIComponent(token)}`
      );
      if (res.status === 401) {
        setAuthorized(false);
        return;
      }
      setAuthorized(true);
      const json = await res.json();
      const c: FilingCase = json.case;
      setFiling(c);
      setStatus(c.status);
      setAssignedTo(c.assigned_to ?? "");
      setDueDate(c.due_date ?? "");
      setNotes(c.notes ?? "");
    } catch {
      console.error("Failed to fetch case");
    } finally {
      setLoading(false);
    }
  }, [caseId, token]);

  useEffect(() => {
    if (token && caseId) fetchCase();
    else {
      setAuthorized(false);
      setLoading(false);
    }
  }, [token, caseId, fetchCase]);

  // Fetch documents
  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/cases/${caseId}/documents?token=${encodeURIComponent(token)}`
      );
      if (res.ok) {
        const json = await res.json();
        setDocuments(json.documents ?? []);
      }
    } catch {
      console.error("Failed to fetch documents");
    }
  }, [caseId, token]);

  useEffect(() => {
    if (token && caseId && authorized) fetchDocuments();
  }, [token, caseId, authorized, fetchDocuments]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ""; // reset input

    if (!ALLOWED_UPLOAD_TYPES.includes(file.type as (typeof ALLOWED_UPLOAD_TYPES)[number])) {
      setUploadMsg({ type: "error", text: `Invalid file type. Allowed: PDF, JPG, PNG.` });
      return;
    }
    if (file.size > MAX_UPLOAD_SIZE) {
      setUploadMsg({ type: "error", text: `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 10 MB.` });
      return;
    }

    setUploading(true);
    setUploadMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(
        `/api/cases/${caseId}/upload?token=${encodeURIComponent(token)}`,
        { method: "POST", body: fd }
      );
      if (!res.ok) {
        const json = await res.json();
        setUploadMsg({ type: "error", text: json.error || "Upload failed." });
        return;
      }
      setUploadMsg({ type: "success", text: `"${file.name}" uploaded.` });
      fetchDocuments();
    } catch {
      setUploadMsg({ type: "error", text: "Network error during upload." });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDoc = async (docId: string, filename: string) => {
    if (!confirm(`Delete "${filename}"?`)) return;
    try {
      const res = await fetch(
        `/api/cases/${caseId}/documents?token=${encodeURIComponent(token)}&docId=${docId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== docId));
      }
    } catch {
      console.error("Failed to delete document");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(
        `/api/admin/cases/${caseId}?token=${encodeURIComponent(token)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status,
            assigned_to: assignedTo,
            due_date: dueDate,
            notes,
          }),
        }
      );
      if (!res.ok) {
        setMessage({ type: "error", text: "Failed to save changes." });
        return;
      }
      const json = await res.json();
      setFiling(json.case);
      setMessage({ type: "success", text: "Case updated successfully." });
    } catch {
      setMessage({ type: "error", text: "Network error." });
    } finally {
      setSaving(false);
    }
  };

  if (authorized === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <ShieldAlert className="mx-auto h-12 w-12 text-destructive mb-2" />
            <CardTitle className="text-xl">Unauthorized</CardTitle>
            <CardDescription>
              Access this page with a valid token:
              <code className="block mt-2 text-sm bg-muted px-3 py-2 rounded">
                /admin/cases/ID?token=YOUR_ADMIN_TOKEN
              </code>
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!filing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-12">
            <p className="text-lg font-medium text-navy">Case not found</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() =>
                router.push(`/admin?token=${encodeURIComponent(token)}`)
              }
            >
              Back to console
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const intake = filing.intake_submissions;

  return (
    <div className="min-h-screen bg-cream">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Back link */}
        <Link
          href={`/admin?token=${encodeURIComponent(token)}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-navy mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to console
        </Link>

        {/* Case header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold font-mono text-navy">
                {filing.case_number}
              </h1>
              <Badge
                className={`text-xs px-2.5 py-0.5 border ${STATUS_COLORS[filing.status]}`}
              >
                {STATUS_LABELS[filing.status]}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Created {new Date(filing.created_at).toLocaleString()} · Updated{" "}
              {new Date(filing.updated_at).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Intake info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Intake Submission</CardTitle>
              <CardDescription>
                Original form data from the client
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Field label="Name" value={intake?.name} />
              <Field label="Email" value={intake?.email} />
              <Field label="Phone" value={intake?.phone} />
              <Field label="Business Stage" value={intake?.business_stage} />
              <Field label="Service Needed" value={intake?.service_needed} />
              {intake?.message && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Message
                  </p>
                  <p className="text-sm bg-muted/50 p-3 rounded">
                    {intake.message}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Case management */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Case Management</CardTitle>
              <CardDescription>Update status and details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={status}
                  onValueChange={(v) => setStatus(v as CaseStatus)}
                >
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CASE_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignedTo">Assigned To</Label>
                <Input
                  id="assignedTo"
                  placeholder="e.g., John Doe"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Internal notes about this case…"
                  rows={5}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {message && (
                <p
                  className={`text-sm font-medium ${
                    message.type === "success"
                      ? "text-green-700"
                      : "text-destructive"
                  }`}
                >
                  {message.text}
                </p>
              )}

              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Documents section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Documents</CardTitle>
            <CardDescription>
              Upload PDFs, JPGs, or PNGs (max 10 MB each)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Upload */}
            <div className="flex items-center gap-3">
              <Label
                htmlFor="file-upload"
                className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded-md text-sm hover:bg-muted/50 transition-colors"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {uploading ? "Uploading…" : "Choose file"}
              </Label>
              <input
                id="file-upload"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={handleUpload}
                disabled={uploading}
              />
              <span className="text-xs text-muted-foreground">
                PDF, JPG, PNG · 10 MB max
              </span>
            </div>
            {uploadMsg && (
              <p
                className={`text-sm font-medium ${
                  uploadMsg.type === "success" ? "text-green-700" : "text-destructive"
                }`}
              >
                {uploadMsg.text}
              </p>
            )}

            {/* Document list */}
            {documents.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No documents uploaded yet.
              </p>
            ) : (
              <div className="divide-y">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between py-3 gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {doc.mime === "application/pdf" ? (
                        <FileText className="h-5 w-5 text-red-500 shrink-0" />
                      ) : (
                        <Image className="h-5 w-5 text-blue-500 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {doc.filename}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(doc.size / 1024).toFixed(0)} KB ·{" "}
                          {new Date(doc.uploaded_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {doc.download_url && (
                        <a
                          href={doc.download_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted transition-colors"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      )}
                      <button
                        onClick={() => handleDeleteDoc(doc.id, doc.filename)}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-destructive/10 text-destructive transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value ?? "—"}</p>
    </div>
  );
}
