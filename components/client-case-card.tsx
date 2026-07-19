"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ClientCase } from "@/lib/services/client-cases";
import { FILING_MILESTONES } from "@/lib/case-status";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, FileUp, Loader2 } from "lucide-react";

interface UploadResponse {
  ok: boolean;
  error?: { message?: string };
}

function isUploadResponse(value: unknown): value is UploadResponse {
  return typeof value === "object" && value !== null && "ok" in value;
}

/**
 * Dashboard card for one filing case: milestone stepper, current-status
 * narrative, and a TVC letter upload prompt when none is attached yet.
 */
export default function ClientCaseCard({ clientCase }: { clientCase: ClientCase }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleUpload(file: File) {
    setUploading(true);
    setUploadMsg(null);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("kind", "vvl");
      const res = await fetch(`/api/client/cases/${clientCase.id}/upload`, {
        method: "POST",
        body,
      });
      const json: unknown = await res.json();
      if (isUploadResponse(json) && json.ok) {
        setUploadMsg({ ok: true, text: "Verification letter received. Our team will confirm it shortly." });
        router.refresh();
      } else {
        setUploadMsg({
          ok: false,
          text:
            (isUploadResponse(json) ? json.error?.message : null) ??
            "Upload failed. Please try again.",
        });
      }
    } catch {
      setUploadMsg({ ok: false, text: "Network error. Please try again." });
    } finally {
      setUploading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">
              {clientCase.businessName ?? "Your Filing"}
            </CardTitle>
            <CardDescription>
              Case <span className="font-mono font-semibold">{clientCase.caseNumber}</span>
              {clientCase.entityType ? ` · ${clientCase.entityType.toUpperCase()}` : ""}
            </CardDescription>
          </div>
          <span className="rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold text-navy whitespace-nowrap">
            {clientCase.statusLabel}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ── Milestone stepper ── */}
        <ol className="flex items-center gap-1">
          {FILING_MILESTONES.map((m, i) => (
            <li key={m.key} className="flex-1" title={m.description}>
              <div
                className={`h-1.5 rounded-full ${
                  i <= clientCase.milestone ? "bg-gold" : "bg-border"
                }`}
              />
              <p className="mt-1 hidden text-[10px] leading-tight text-muted-foreground sm:block">
                {m.label}
              </p>
            </li>
          ))}
        </ol>

        <div className="text-sm">
          <p className="text-navy">{clientCase.happening}</p>
          <p className="mt-1 text-muted-foreground">
            <span className="font-semibold">Next:</span> {clientCase.next}
          </p>
        </div>

        {/* ── TVC letter upload prompt ── */}
        {!clientCase.hasVvlDocument ? (
          <div className="rounded-lg border border-gold/40 bg-gold/5 p-4">
            <p className="text-sm font-semibold text-navy">
              Attach your TVC Verification Letter
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              We need your Texas Veterans Commission letter (PDF, JPG, or PNG)
              to file with the fee waiver.
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf,image/jpeg,image/png"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleUpload(f);
                e.target.value = "";
              }}
            />
            <Button
              size="sm"
              className="mt-3 bg-gold hover:bg-gold-dark text-navy font-bold gap-2"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileUp className="h-4 w-4" />
              )}
              {uploading ? "Uploading…" : "Upload Letter"}
            </Button>
            {uploadMsg && (
              <p
                className={`mt-2 text-xs ${
                  uploadMsg.ok ? "text-gold-dark font-medium" : "text-destructive"
                }`}
              >
                {uploadMsg.text}
              </p>
            )}
          </div>
        ) : (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CheckCircle className="h-3.5 w-3.5 text-gold" />
            Verification letter on file
            {clientCase.documents.length > 1
              ? ` · ${clientCase.documents.length} documents total`
              : ""}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
