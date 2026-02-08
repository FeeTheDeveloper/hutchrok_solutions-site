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
import { CASE_STATUSES, type FilingCase, type CaseStatus } from "@/lib/types";
import { ArrowLeft, Save, ShieldAlert, Loader2 } from "lucide-react";
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
