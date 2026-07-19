"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Search, ArrowLeft } from "lucide-react";
import {
  FilingStatusTracker,
  type TrackedCase,
} from "@/components/filing-status-tracker";

interface TrackResponse {
  ok: boolean;
  case?: TrackedCase;
  error?: { message?: string; fields?: Record<string, string> };
}

function isTrackResponse(value: unknown): value is TrackResponse {
  return typeof value === "object" && value !== null && "ok" in value;
}

/**
 * Self-service filing status lookup. Renders a case-number + email form,
 * calls /api/track, and shows the live status tracker on success.
 *
 * Drop-in for both the public /track page and the authenticated dashboard.
 */
export default function FilingTracker({
  initialCaseNumber = "",
  initialEmail = "",
  compact = false,
}: {
  initialCaseNumber?: string;
  initialEmail?: string;
  compact?: boolean;
}) {
  const [caseNumber, setCaseNumber] = useState(initialCaseNumber);
  const [email, setEmail] = useState(initialEmail);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackedCase | null>(null);

  const lookup = useCallback(
    async (cn: string, em: string) => {
      setLoading(true);
      setErrors({});
      try {
        const res = await fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ caseNumber: cn, email: em }),
        });
        const data: unknown = await res.json();
        if (isTrackResponse(data) && data.ok && data.case) {
          setResult(data.case);
        } else {
          const err = isTrackResponse(data) ? data.error ?? {} : {};
          if (err.fields) {
            setErrors(err.fields);
          } else {
            setErrors({ form: err.message ?? "Lookup failed. Please try again." });
          }
        }
      } catch {
        setErrors({ form: "Something went wrong. Please try again." });
      } finally {
        setLoading(false);
      }
    },
    []
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    lookup(caseNumber.trim(), email.trim());
  }

  if (result) {
    return (
      <div>
        <FilingStatusTracker data={result} />
        <div className="mt-6 text-center">
          <Button
            variant="outline"
            onClick={() => setResult(null)}
            className="gap-2 border-navy/30 text-navy hover:bg-navy hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Look up another filing
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={
        compact
          ? "space-y-4"
          : "mx-auto max-w-md rounded-2xl border border-border/50 bg-white p-6 sm:p-8 shadow-sm space-y-4"
      }
    >
      {errors.form && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {errors.form}
        </div>
      )}

      <div>
        <Label htmlFor="track-case" className="mb-1.5 block">
          Case Number <span className="text-destructive">*</span>
        </Label>
        <Input
          id="track-case"
          placeholder="HSG-2026-0001"
          value={caseNumber}
          onChange={(e) => setCaseNumber(e.target.value)}
          className={`font-mono ${errors.caseNumber ? "border-destructive" : ""}`}
          autoComplete="off"
        />
        {errors.caseNumber && (
          <p className="mt-1 text-xs text-destructive">{errors.caseNumber}</p>
        )}
      </div>

      <div>
        <Label htmlFor="track-email" className="mb-1.5 block">
          Email on File <span className="text-destructive">*</span>
        </Label>
        <Input
          id="track-email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={errors.email ? "border-destructive" : ""}
          autoComplete="email"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-destructive">{errors.email}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-gold hover:bg-gold-dark text-navy font-bold gap-2 h-11"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Checking status…
          </>
        ) : (
          <>
            <Search className="h-4 w-4" />
            Track My Filing
          </>
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Enter the case number from your confirmation and the email you used at
        intake.
      </p>
    </form>
  );
}
