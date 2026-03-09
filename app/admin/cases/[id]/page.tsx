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
import {
  CASE_STATUSES,
  QUICK_ACTIONS,
  LAUNCH_SERVICE_OPTIONS,
  LAUNCH_SERVICE_LABELS,
  ENTITY_TYPES,
  BRANCHES_OF_SERVICE,
  type FilingCase,
  type CaseStatus,
  type CaseDocument,
  type OwnerDetail,
  type HandoffData,
  ALLOWED_UPLOAD_TYPES,
  MAX_UPLOAD_SIZE,
} from "@/lib/types";
import {
  ArrowLeft,
  Save,
  ShieldAlert,
  Loader2,
  Upload,
  FileText,
  Image,
  Trash2,
  Download,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  User,
  Building2,
  Users,
  FileCheck,
  MessageSquare,
  Clock,
  CalendarDays,
  Zap,
  Rocket,
} from "lucide-react";
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
  LEAD: "bg-slate-100 text-slate-800 border-slate-200",
  ELIGIBILITY_PENDING: "bg-amber-100 text-amber-800 border-amber-200",
  VVL_PENDING: "bg-orange-100 text-orange-800 border-orange-200",
  READY_FOR_INTAKE: "bg-blue-100 text-blue-800 border-blue-200",
  IN_REVIEW: "bg-yellow-100 text-yellow-800 border-yellow-200",
  READY_FOR_FILING: "bg-indigo-100 text-indigo-800 border-indigo-200",
  SUBMITTED: "bg-purple-100 text-purple-800 border-purple-200",
  ACCEPTED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  COMPLETED: "bg-green-100 text-green-800 border-green-200",
};

const STATUS_LABELS: Record<CaseStatus, string> = {
  LEAD: "Lead",
  ELIGIBILITY_PENDING: "Eligibility Pending",
  VVL_PENDING: "VVL Pending",
  READY_FOR_INTAKE: "Ready for Intake",
  IN_REVIEW: "In Review",
  READY_FOR_FILING: "Ready for Filing",
  SUBMITTED: "Submitted",
  ACCEPTED: "Accepted",
  COMPLETED: "Completed",
};

const VVL_LABELS: Record<string, string> = {
  have_vvl: "Has VVL",
  applied: "Applied — Waiting on TVC",
  not_started: "Not Started",
};

const TIMELINE_LABELS: Record<string, string> = {
  asap: "ASAP",
  "1_3_months": "1–3 months",
  "3_6_months": "3–6 months",
  "6_plus_months": "6+ months",
  not_sure: "Not sure",
};

const RA_LABELS: Record<string, string> = {
  self: "Self",
  hutchrok: "Hutchrok recommended",
  other: "Already has one",
};

const ENTITY_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  ENTITY_TYPES.map((t) => [t.value, t.label])
);

const BRANCH_LABELS: Record<string, string> = Object.fromEntries(
  BRANCHES_OF_SERVICE.map((b) => [b.value, b.label])
);

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
  const [status, setStatus] = useState<CaseStatus>("LEAD");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [handoffData, setHandoffData] = useState<HandoffData>({
    servicesInterested: [],
    recommendedService: null,
    launchReady: false,
    handoffNotes: null,
  });

  // Documents
  const [documents, setDocuments] = useState<CaseDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

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
      setHandoffData(c.handoff_data ?? {
        servicesInterested: [],
        recommendedService: null,
        launchReady: false,
        handoffNotes: null,
      });
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
    e.target.value = "";

    if (
      !ALLOWED_UPLOAD_TYPES.includes(
        file.type as (typeof ALLOWED_UPLOAD_TYPES)[number]
      )
    ) {
      setUploadMsg({
        type: "error",
        text: `Invalid file type. Allowed: PDF, JPG, PNG.`,
      });
      return;
    }
    if (file.size > MAX_UPLOAD_SIZE) {
      setUploadMsg({
        type: "error",
        text: `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 10 MB.`,
      });
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
            handoff_data: handoffData,
            _old_status: filing?.status,
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

  const handleQuickAction = async (targetStatus: CaseStatus) => {
    const oldStatus = filing?.status;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(
        `/api/admin/cases/${caseId}?token=${encodeURIComponent(token)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: targetStatus,
            _old_status: oldStatus,
          }),
        }
      );
      if (!res.ok) {
        setMessage({ type: "error", text: "Quick action failed." });
        return;
      }
      const json = await res.json();
      setFiling(json.case);
      setStatus(json.case.status);
      setMessage({ type: "success", text: `Moved to ${targetStatus.replace(/_/g, " ").toLowerCase()}.` });
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
  const isVeteran = intake?.veteran_status === true;
  const hasVvl = intake?.vvl_status === "have_vvl";
  const intakeComplete =
    isVeteran && !!intake?.business_name && !!intake?.organizer_name;
  const owners = (intake?.owner_details ?? []) as OwnerDetail[];
  const eligibility = intake?.eligibility_answers as Record<
    string,
    boolean | null
  > | null;

  // Pipeline position
  const pipelineIdx = CASE_STATUSES.indexOf(filing.status);

  return (
    <div className="min-h-screen bg-cream">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Back link */}
        <Link
          href={`/admin?token=${encodeURIComponent(token)}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-navy mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        {/* Case header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold font-mono text-navy">
                {filing.case_number}
              </h1>
              <Badge
                className={`text-xs px-2.5 py-0.5 border ${STATUS_COLORS[filing.status]}`}
              >
                {STATUS_LABELS[filing.status]}
              </Badge>
              {isVeteran && (
                <Badge
                  variant="outline"
                  className="text-xs px-2.5 py-0.5 border-amber-400 text-amber-700"
                >
                  Veteran Filing
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Created {new Date(filing.created_at).toLocaleString()} · Updated{" "}
              {new Date(filing.updated_at).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Pipeline progress */}
        <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
          {CASE_STATUSES.map((s, i) => {
            const isCurrent = s === filing.status;
            const isPast = i < pipelineIdx;
            return (
              <div key={s} className="flex items-center gap-1 shrink-0">
                <div
                  className={`text-[10px] px-2 py-1 rounded-full font-medium border ${
                    isCurrent
                      ? STATUS_COLORS[s]
                      : isPast
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-muted text-muted-foreground border-border"
                  }`}
                >
                  {STATUS_LABELS[s]}
                </div>
                {i < CASE_STATUSES.length - 1 && (
                  <span
                    className={`text-xs ${isPast ? "text-green-400" : "text-muted-foreground/40"}`}
                  >
                    →
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Blocking alerts */}
        {isVeteran && (!hasVvl || !intakeComplete) && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-orange-800">
                    Blocking Issues
                  </p>
                  {!hasVvl && (
                    <p className="text-sm text-orange-700">
                      VVL not uploaded — applicant status:{" "}
                      <span className="font-medium">
                        {VVL_LABELS[intake?.vvl_status ?? ""] ?? "Unknown"}
                      </span>
                    </p>
                  )}
                  {!intakeComplete && (
                    <p className="text-sm text-orange-700">
                      Intake form incomplete — missing business or ownership
                      details
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Operations ── */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Operations
            </CardTitle>
            <CardDescription>
              Microsoft 365 integration &amp; sync status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground">SharePoint Folder</p>
                {filing.sharepoint_folder_url ? (
                  <a
                    href={filing.sharepoint_folder_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-blue-700 hover:underline font-medium"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Open in SharePoint
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">Not synced</p>
                )}
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Microsoft List Item ID</p>
                {filing.ms_list_item_id ? (
                  <code className="text-sm bg-muted px-1.5 py-0.5 rounded">
                    {filing.ms_list_item_id}
                  </code>
                ) : (
                  <p className="text-sm text-muted-foreground">—</p>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Last Ops Sync</p>
              <p className="text-sm">
                {filing.ops_synced_at
                  ? new Date(filing.ops_synced_at).toLocaleString()
                  : "Never synced"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ── Filing Actions ── */}
        <Card className="mb-6 border-indigo-200 bg-indigo-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-indigo-700" />
              Filing Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                className="border-indigo-300 text-indigo-800 hover:bg-indigo-100"
                onClick={() => fetchCase()}
              >
                <RefreshCw className="h-3 w-3 mr-1.5" />
                Refresh Case
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-indigo-300 text-indigo-800 hover:bg-indigo-100"
                disabled={saving}
                onClick={() => handleQuickAction("READY_FOR_FILING" as CaseStatus)}
              >
                <CheckCircle2 className="h-3 w-3 mr-1.5" />
                Mark Ready for Filing
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── Quick Actions ── */}
        {(() => {
          const available = QUICK_ACTIONS.filter((qa) =>
            qa.fromStatuses.includes(filing.status)
          );
          if (available.length === 0) return null;
          return (
            <Card className="mb-6 border-blue-200 bg-blue-50/50">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-800 mb-3">
                      Quick Actions
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {available.map((qa) => (
                        <Button
                          key={qa.targetStatus}
                          size="sm"
                          variant="outline"
                          disabled={saving}
                          onClick={() => handleQuickAction(qa.targetStatus)}
                          className="border-blue-300 text-blue-800 hover:bg-blue-100 hover:border-blue-400"
                          title={qa.description}
                        >
                          {saving ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                          ) : (
                            <Zap className="h-3 w-3 mr-1.5" />
                          )}
                          {qa.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })()}

        {/* ── MAIN CONTENT GRID ── */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* ── 1. Applicant Summary ── */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                Applicant
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Field label="Name" value={intake?.name} />
              <Field label="Email" value={intake?.email} />
              <Field label="Phone" value={intake?.phone} />
              {!isVeteran && (
                <>
                  <Field
                    label="Business Stage"
                    value={intake?.business_stage}
                  />
                  <Field
                    label="Service Needed"
                    value={intake?.service_needed}
                  />
                </>
              )}
              {isVeteran && intake?.branch_of_service && (
                <Field
                  label="Branch of Service"
                  value={BRANCH_LABELS[intake.branch_of_service] ?? intake.branch_of_service}
                />
              )}
              {isVeteran && intake?.years_of_service != null && (
                <Field
                  label="Years of Service"
                  value={String(intake.years_of_service)}
                />
              )}
              {intake?.message && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Notes / Message
                  </p>
                  <p className="text-sm bg-muted/50 p-3 rounded">
                    {intake.message}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── 2. Eligibility Summary ── */}
          {isVeteran && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Eligibility
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Field
                  label="Veteran Status"
                  value={intake?.veteran_status ? "Yes" : "No"}
                />
                <Field
                  label="Texas Confirmed"
                  value={
                    intake?.texas_confirmed === true
                      ? "Yes"
                      : intake?.texas_confirmed === false
                        ? "No"
                        : "—"
                  }
                />
                <Field
                  label="All Owners Veterans"
                  value={
                    intake?.all_owners_veterans === true
                      ? "Yes"
                      : intake?.all_owners_veterans === false
                        ? "No"
                        : "—"
                  }
                />
                <Field
                  label="Fully Veteran-Owned"
                  value={
                    intake?.fully_veteran_owned === true
                      ? "Yes"
                      : intake?.fully_veteran_owned === false
                        ? "No"
                        : "—"
                  }
                />
                {eligibility && Object.keys(eligibility).length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Quiz Answers
                    </p>
                    <div className="space-y-1">
                      {Object.entries(eligibility).map(([key, val]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="text-muted-foreground capitalize">
                            {key.replace(/_/g, " ")}
                          </span>
                          <span
                            className={
                              val === true
                                ? "text-green-700 font-medium"
                                : val === false
                                  ? "text-red-600 font-medium"
                                  : "text-muted-foreground"
                            }
                          >
                            {val === true
                              ? "Yes"
                              : val === false
                                ? "No"
                                : "—"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ── 3. Verification (VVL) ── */}
          {isVeteran && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileCheck className="h-4 w-4" />
                  Verification (VVL)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  {hasVvl ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                  )}
                  <span className="text-sm font-medium">
                    {VVL_LABELS[intake?.vvl_status ?? ""] ?? "Unknown"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {hasVvl
                    ? "VVL has been provided. Verification criteria met."
                    : "VVL not yet received. Free filing cannot proceed until the Veteran Verification Letter is uploaded."}
                </p>
              </CardContent>
            </Card>
          )}

          {/* ── 4. Business Formation ── */}
          {isVeteran && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Business Formation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Field label="Business Name" value={intake?.business_name} />
                <Field
                  label="Entity Type"
                  value={
                    ENTITY_TYPE_LABELS[intake?.entity_type ?? ""] ??
                    intake?.entity_type?.toUpperCase() ?? "—"
                  }
                />
                {intake?.entity_type === "dba" && (
                  <Field label="DBA Name" value={intake?.dba_name} />
                )}
                {intake?.entity_type === "nonprofit" && (
                  <Field
                    label="Nonprofit Purpose"
                    value={intake?.nonprofit_purpose}
                  />
                )}
                <Field
                  label="Business Purpose"
                  value={intake?.business_purpose}
                />
                <Field
                  label="Principal Address"
                  value={intake?.principal_address}
                />
                {intake?.mailing_address && (
                  <Field
                    label="Mailing Address"
                    value={intake.mailing_address}
                  />
                )}
                <Field
                  label="Launch Timeline"
                  value={
                    TIMELINE_LABELS[intake?.launch_timeline ?? ""] ??
                    intake?.launch_timeline
                  }
                />
              </CardContent>
            </Card>
          )}

          {/* ── 5. Ownership & Structure ── */}
          {isVeteran && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Ownership &amp; Structure
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Field label="Organizer" value={intake?.organizer_name} />
                {intake?.organizer_title && (
                  <Field
                    label="Organizer Title"
                    value={intake.organizer_title}
                  />
                )}
                <Field
                  label="Registered Agent"
                  value={
                    RA_LABELS[intake?.registered_agent_preference ?? ""] ??
                    intake?.registered_agent_preference
                  }
                />
                <Field
                  label="Operator Review Confirmed"
                  value={intake?.operator_review_confirmed ? "Yes" : "No"}
                />
                {owners.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Owners / Members
                    </p>
                    <div className="space-y-1">
                      {owners.map((o, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-sm bg-muted/40 px-3 py-1.5 rounded"
                        >
                          <span className="font-medium">{o.name}</span>
                          <Badge variant="outline" className="text-[10px]">
                            {o.role}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ── 6. Documents ── */}
          <Card className={isVeteran ? "" : "lg:col-span-2"}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Documents
                {documents.length > 0 && (
                  <Badge variant="outline" className="text-[10px] ml-1">
                    {documents.length}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Uploaded client documents &amp; generated filings · PDF, JPG, PNG (max 10 MB)
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
                    uploadMsg.type === "success"
                      ? "text-green-700"
                      : "text-destructive"
                  }`}
                >
                  {uploadMsg.text}
                </p>
              )}

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
                            {doc.filename.startsWith("COF-") && (
                              <Badge variant="outline" className="text-[9px] ml-1.5 py-0 px-1 align-middle border-green-300 text-green-700">
                                Filing
                              </Badge>
                            )}
                            {doc.filename.toLowerCase().includes("vvl") && (
                              <Badge variant="outline" className="text-[9px] ml-1.5 py-0 px-1 align-middle border-amber-300 text-amber-700">
                                VVL
                              </Badge>
                            )}
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
                          onClick={() =>
                            handleDeleteDoc(doc.id, doc.filename)
                          }
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

          {/* ── 7. Internal Notes ── */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Internal Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                id="notes"
                placeholder="Internal notes about this case…"
                rows={5}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* ── 8. Status & Pipeline ── */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Status &amp; Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Current Status</Label>
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
              <div className="text-xs text-muted-foreground space-y-1">
                <p>
                  Pipeline: Lead → Eligibility → VVL → Intake → Review → Filing
                  → Submitted → Accepted → Completed
                </p>
              </div>
            </CardContent>
          </Card>

          {/* ── 9. Assignment & Due Date ── */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Assignment &amp; Due Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
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
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── 10. Launch Services Handoff ── */}
        {(filing.status === "ACCEPTED" || filing.status === "COMPLETED") && isVeteran && (
          <Card className="mt-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Rocket className="h-4 w-4" />
                Launch Services Handoff
              </CardTitle>
              <CardDescription>
                Track post-filing service interest and prepare the handoff
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Service interest checkboxes */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Services Interested In
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {LAUNCH_SERVICE_OPTIONS.map((svc) => (
                    <label
                      key={svc}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={handoffData.servicesInterested.includes(svc)}
                        onChange={(e) => {
                          setHandoffData((prev) => ({
                            ...prev,
                            servicesInterested: e.target.checked
                              ? [...prev.servicesInterested, svc]
                              : prev.servicesInterested.filter((s) => s !== svc),
                          }));
                        }}
                        className="rounded border-border"
                      />
                      <span>{LAUNCH_SERVICE_LABELS[svc]}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Recommended next service */}
              <div className="space-y-2">
                <Label htmlFor="recommendedService">Recommended Next Service</Label>
                <Select
                  value={handoffData.recommendedService ?? "none"}
                  onValueChange={(v) =>
                    setHandoffData((prev) => ({
                      ...prev,
                      recommendedService: v === "none" ? null : v as typeof prev.recommendedService,
                    }))
                  }
                >
                  <SelectTrigger id="recommendedService" className="w-full">
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— None —</SelectItem>
                    {LAUNCH_SERVICE_OPTIONS.map((svc) => (
                      <SelectItem key={svc} value={svc}>
                        {LAUNCH_SERVICE_LABELS[svc]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Launch ready toggle */}
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={handoffData.launchReady}
                  onChange={(e) =>
                    setHandoffData((prev) => ({
                      ...prev,
                      launchReady: e.target.checked,
                    }))
                  }
                  className="rounded border-border"
                />
                <span className="font-medium">
                  Case is launch-ready for post-filing services
                </span>
              </label>

              {/* Handoff notes */}
              <div className="space-y-2">
                <Label htmlFor="handoffNotes">Handoff Notes</Label>
                <Textarea
                  id="handoffNotes"
                  placeholder="Internal notes for the launch services handoff…"
                  rows={3}
                  value={handoffData.handoffNotes ?? ""}
                  onChange={(e) =>
                    setHandoffData((prev) => ({
                      ...prev,
                      handoffNotes: e.target.value || null,
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Save bar */}
        <div className="mt-8 flex items-center gap-4">
          <Button onClick={handleSave} disabled={saving} className="px-8">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
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
