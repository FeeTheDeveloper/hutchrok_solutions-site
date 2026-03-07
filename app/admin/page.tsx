"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CASE_STATUSES, type FilingCase, type CaseStatus } from "@/lib/types";
import {
  ShieldAlert,
  RefreshCw,
  FolderOpen,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-cream">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <AdminContent />
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

function AdminContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [cases, setCases] = useState<FilingCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchCases = useCallback(
    async (filter?: string) => {
      setLoading(true);
      try {
        const status = filter ?? statusFilter;
        const res = await fetch(
          `/api/admin/cases?token=${encodeURIComponent(token)}&status=${status}`
        );
        if (res.status === 401) {
          setAuthorized(false);
          return;
        }
        setAuthorized(true);
        const json = await res.json();
        setCases(json.cases ?? []);
      } catch {
        console.error("Failed to fetch cases");
      } finally {
        setLoading(false);
      }
    },
    [token, statusFilter]
  );

  useEffect(() => {
    if (token) fetchCases();
    else {
      setAuthorized(false);
      setLoading(false);
    }
  }, [token, fetchCases]);

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
                /admin?token=YOUR_ADMIN_TOKEN
              </code>
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleFilterChange = (value: string) => {
    setStatusFilter(value);
    fetchCases(value);
  };

  // Compute pipeline counts
  const actionable = cases.filter((c) =>
    ["LEAD", "ELIGIBILITY_PENDING", "VVL_PENDING", "READY_FOR_INTAKE"].includes(
      c.status
    )
  ).length;
  const inProgress = cases.filter((c) =>
    ["IN_REVIEW", "READY_FOR_FILING", "SUBMITTED"].includes(c.status)
  ).length;
  const closed = cases.filter((c) =>
    ["ACCEPTED", "COMPLETED"].includes(c.status)
  ).length;

  return (
    <div className="min-h-screen bg-cream">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-navy">
              Operator Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Veteran filing pipeline &amp; case management
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={statusFilter} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                {CASE_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchCases()}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* Summary row */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <Card className="py-3">
            <CardContent className="text-center p-0">
              <p className="text-2xl font-bold text-amber-700">{actionable}</p>
              <p className="text-xs text-muted-foreground">Needs Action</p>
            </CardContent>
          </Card>
          <Card className="py-3">
            <CardContent className="text-center p-0">
              <p className="text-2xl font-bold text-indigo-700">{inProgress}</p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </CardContent>
          </Card>
          <Card className="py-3">
            <CardContent className="text-center p-0">
              <p className="text-2xl font-bold text-green-700">{closed}</p>
              <p className="text-xs text-muted-foreground">Closed</p>
            </CardContent>
          </Card>
        </div>

        {/* Pipeline stats */}
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2 mb-8">
          {CASE_STATUSES.map((s) => {
            const count = cases.filter((c) => c.status === s).length;
            return (
              <button
                key={s}
                onClick={() => handleFilterChange(s)}
                className={`rounded-lg border px-2 py-2 text-center transition-colors hover:ring-2 hover:ring-navy/20 ${
                  statusFilter === s ? "ring-2 ring-navy" : ""
                }`}
              >
                <p className="text-lg font-bold text-navy">{count}</p>
                <p className="text-[10px] leading-tight text-muted-foreground">
                  {STATUS_LABELS[s]}
                </p>
              </button>
            );
          })}
        </div>

        {/* Cases list */}
        {loading ? (
          <div className="text-center py-16 text-muted-foreground">
            Loading cases…
          </div>
        ) : cases.length === 0 ? (
          <Card className="py-16">
            <CardContent className="text-center">
              <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-navy">No cases found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {statusFilter !== "ALL"
                  ? "Try a different status filter."
                  : "Cases will appear here after intake form submissions."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {cases.map((c) => {
              const intake = c.intake_submissions;
              const isVeteran = intake?.veteran_status === true;
              const hasVvl = intake?.vvl_status === "have_vvl";
              const intakeComplete =
                isVeteran && !!intake?.business_name && !!intake?.organizer_name;

              return (
                <Link
                  key={c.id}
                  href={`/admin/cases/${c.id}?token=${encodeURIComponent(token)}`}
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer mb-3">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        {/* Left: case info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-mono font-semibold text-navy text-sm">
                              {c.case_number}
                            </span>
                            <Badge
                              className={`text-[10px] px-2 py-0 border ${STATUS_COLORS[c.status]}`}
                            >
                              {STATUS_LABELS[c.status]}
                            </Badge>
                            {isVeteran && (
                              <Badge
                                variant="outline"
                                className="text-[10px] px-2 py-0 border-amber-400 text-amber-700"
                              >
                                Veteran
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-foreground truncate">
                            {intake?.name ?? "—"}
                            {intake?.business_name && (
                              <span className="text-muted-foreground">
                                {" · "}
                                {intake.business_name}
                              </span>
                            )}
                          </p>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <span className="text-xs text-muted-foreground">
                              {intake?.email}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(c.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Right: blockers + meta */}
                        <div className="flex flex-col items-end gap-1 shrink-0 text-xs">
                          {isVeteran && (
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center gap-1 ${
                                  hasVvl ? "text-green-700" : "text-orange-600"
                                }`}
                              >
                                {hasVvl ? (
                                  <CheckCircle2 className="h-3 w-3" />
                                ) : (
                                  <AlertTriangle className="h-3 w-3" />
                                )}
                                VVL
                              </span>
                              <span
                                className={`inline-flex items-center gap-1 ${
                                  intakeComplete
                                    ? "text-green-700"
                                    : "text-orange-600"
                                }`}
                              >
                                {intakeComplete ? (
                                  <CheckCircle2 className="h-3 w-3" />
                                ) : (
                                  <AlertTriangle className="h-3 w-3" />
                                )}
                                Intake
                              </span>
                            </div>
                          )}
                          {c.assigned_to && (
                            <p className="text-muted-foreground">
                              Assigned:{" "}
                              <span className="font-medium text-foreground">
                                {c.assigned_to}
                              </span>
                            </p>
                          )}
                          {c.due_date && (
                            <p className="text-muted-foreground">
                              Due:{" "}
                              {new Date(c.due_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
