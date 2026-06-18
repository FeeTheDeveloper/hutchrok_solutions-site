import { FILING_MILESTONES } from "@/lib/case-status";
import { cn } from "@/lib/utils";
import { Check, FileText, Building2, Clock } from "lucide-react";

export interface TrackedCase {
  caseNumber: string;
  status: string;
  statusLabel: string;
  milestone: number;
  happening: string;
  next: string;
  businessName: string | null;
  entityType: string | null;
  clientName: string | null;
  createdAt: string;
  updatedAt: string;
  documents: { filename: string; uploadedAt: string }[];
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

const ENTITY_LABELS: Record<string, string> = {
  llc: "Texas LLC",
  dba: "DBA (Assumed Name)",
  nonprofit: "Nonprofit Corporation",
};

/**
 * Presentational filing status tracker — a LegalZoom-style order tracker.
 * Pure render; all data comes from the /api/track lookup.
 */
export function FilingStatusTracker({ data }: { data: TrackedCase }) {
  const current = data.milestone;

  return (
    <div className="w-full">
      {/* ── Summary header ── */}
      <div className="rounded-2xl border border-border/50 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
              Case Number
            </p>
            <p className="font-mono text-lg font-bold text-navy">
              {data.caseNumber}
            </p>
            {data.businessName && (
              <p className="mt-2 flex items-center gap-2 text-sm text-navy">
                <Building2 className="h-4 w-4 text-gold" />
                <span className="font-semibold">{data.businessName}</span>
                {data.entityType && (
                  <span className="text-muted-foreground">
                    · {ENTITY_LABELS[data.entityType] ?? data.entityType}
                  </span>
                )}
              </p>
            )}
          </div>
          <div className="sm:text-right">
            <span className="inline-flex items-center rounded-full bg-gold/10 px-3 py-1 text-sm font-semibold text-gold-dark">
              {data.statusLabel}
            </span>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground sm:justify-end">
              <Clock className="h-3.5 w-3.5" />
              Updated {formatDate(data.updatedAt)}
            </p>
          </div>
        </div>
      </div>

      {/* ── Milestone stepper ── */}
      <div className="mt-6 rounded-2xl border border-border/50 bg-white p-6 sm:p-8 shadow-sm">
        {/* Desktop: horizontal */}
        <ol className="hidden md:flex items-start justify-between">
          {FILING_MILESTONES.map((m, i) => {
            const done = i < current;
            const active = i === current;
            return (
              <li
                key={m.key}
                className="relative flex-1 flex flex-col items-center text-center px-2"
              >
                {/* connector */}
                {i < FILING_MILESTONES.length - 1 && (
                  <span
                    className={cn(
                      "absolute top-5 left-1/2 h-0.5 w-full",
                      done ? "bg-gold" : "bg-border"
                    )}
                  />
                )}
                <span
                  className={cn(
                    "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors",
                    done && "border-gold bg-gold text-navy",
                    active && "border-navy bg-navy text-white",
                    !done && !active && "border-border bg-muted text-muted-foreground"
                  )}
                >
                  {done ? <Check className="h-5 w-5" /> : i + 1}
                </span>
                <span
                  className={cn(
                    "mt-3 text-sm font-semibold",
                    i <= current ? "text-navy" : "text-muted-foreground"
                  )}
                >
                  {m.label}
                </span>
                <span className="mt-1 text-xs text-muted-foreground leading-snug max-w-[10rem]">
                  {m.description}
                </span>
              </li>
            );
          })}
        </ol>

        {/* Mobile: vertical */}
        <ol className="md:hidden space-y-0">
          {FILING_MILESTONES.map((m, i) => {
            const done = i < current;
            const active = i === current;
            const isLast = i === FILING_MILESTONES.length - 1;
            return (
              <li key={m.key} className="relative flex gap-4 pb-6 last:pb-0">
                {!isLast && (
                  <span
                    className={cn(
                      "absolute left-5 top-10 h-full w-0.5 -translate-x-1/2",
                      done ? "bg-gold" : "bg-border"
                    )}
                  />
                )}
                <span
                  className={cn(
                    "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold",
                    done && "border-gold bg-gold text-navy",
                    active && "border-navy bg-navy text-white",
                    !done && !active && "border-border bg-muted text-muted-foreground"
                  )}
                >
                  {done ? <Check className="h-5 w-5" /> : i + 1}
                </span>
                <div className="pt-1.5">
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      i <= current ? "text-navy" : "text-muted-foreground"
                    )}
                  >
                    {m.label}
                  </p>
                  <p className="text-xs text-muted-foreground leading-snug">
                    {m.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* ── Happening now / next ── */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-gold/30 bg-cream/50 p-6">
          <p className="text-xs uppercase tracking-wider text-gold-dark font-semibold mb-2">
            Happening now
          </p>
          <p className="text-sm text-navy leading-relaxed">{data.happening}</p>
        </div>
        <div className="rounded-2xl border border-border/50 bg-white p-6">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            What&apos;s next
          </p>
          <p className="text-sm text-navy leading-relaxed">{data.next}</p>
        </div>
      </div>

      {/* ── Documents ── */}
      <div className="mt-6 rounded-2xl border border-border/50 bg-white p-6">
        <p className="text-sm font-bold text-navy mb-3">Documents on File</p>
        {data.documents.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No documents have been added to your case yet. If we need anything
            from you, we&apos;ll reach out by email.
          </p>
        ) : (
          <ul className="divide-y divide-border/40">
            {data.documents.map((doc, i) => (
              <li
                key={`${doc.filename}-${i}`}
                className="flex items-center gap-3 py-2.5 text-sm"
              >
                <FileText className="h-4 w-4 text-gold shrink-0" />
                <span className="text-navy font-medium truncate">
                  {doc.filename}
                </span>
                <span className="ml-auto text-xs text-muted-foreground shrink-0">
                  {formatDate(doc.uploadedAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-xs text-muted-foreground">
          Need to send us a document? Email it to{" "}
          <span className="font-medium text-navy">contact@hutchrok.com</span>{" "}
          with your case number.
        </p>
      </div>
    </div>
  );
}
