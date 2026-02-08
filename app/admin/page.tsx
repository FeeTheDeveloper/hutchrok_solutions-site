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
import { ShieldAlert, RefreshCw, FolderOpen } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-cream">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-navy">Admin Console</h1>
            <p className="text-muted-foreground mt-1">
              Filing cases &amp; intake management
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={statusFilter} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-[160px]">
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

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {CASE_STATUSES.map((s) => {
            const count = cases.filter((c) => c.status === s).length;
            return (
              <Card key={s} className="py-3">
                <CardContent className="text-center p-0">
                  <p className="text-2xl font-bold text-navy">{count}</p>
                  <p className="text-xs text-muted-foreground">
                    {STATUS_LABELS[s]}
                  </p>
                </CardContent>
              </Card>
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
            {cases.map((c) => (
              <Link
                key={c.id}
                href={`/admin/cases/${c.id}?token=${encodeURIComponent(token)}`}
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer mb-3">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      {/* Left: case info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono font-semibold text-navy text-sm">
                            {c.case_number}
                          </span>
                          <Badge
                            className={`text-[10px] px-2 py-0 border ${STATUS_COLORS[c.status]}`}
                          >
                            {STATUS_LABELS[c.status]}
                          </Badge>
                        </div>
                        <p className="text-sm text-foreground truncate">
                          {c.intake_submissions?.name ?? "—"} ·{" "}
                          <span className="text-muted-foreground">
                            {c.intake_submissions?.email}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {c.intake_submissions?.service_needed ?? "—"} ·{" "}
                          {new Date(c.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Right: meta */}
                      <div className="text-right text-xs text-muted-foreground shrink-0">
                        {c.assigned_to && (
                          <p>
                            Assigned:{" "}
                            <span className="font-medium text-foreground">
                              {c.assigned_to}
                            </span>
                          </p>
                        )}
                        {c.due_date && (
                          <p>
                            Due:{" "}
                            {new Date(c.due_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
