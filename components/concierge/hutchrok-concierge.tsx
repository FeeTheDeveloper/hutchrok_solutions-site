"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  BadgeCheck,
  Shield,
  FileText,
  Rocket,
  HelpCircle,
  ArrowRight,
  ChevronLeft,
  CheckCircle,
  Info,
  MessageCircle,
  MessageSquare,
  X,
  Mail,
  Star,
} from "lucide-react";
import {
  CONCIERGE_TREE,
  CONTEXT_NUDGES,
  TRUST_SIGNALS,
  type ConciergeOption,
  type ConciergeNode,
} from "@/components/concierge/concierge-data";

/* ── Icon resolver ── */
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  BadgeCheck,
  Shield,
  FileText,
  Rocket,
  HelpCircle,
  ArrowRight,
  ChevronLeft,
  CheckCircle,
  Info,
  MessageCircle,
  Mail,
  Star,
};

function OptionIcon({ name, className }: { name?: string; className?: string }) {
  if (!name) return null;
  const Icon = ICON_MAP[name];
  if (!Icon) return null;
  return <Icon className={className} />;
}

/* ── Resolve context nudge from pathname ── */
function resolveContextNudge(pathname: string) {
  // Check most-specific paths first (longer prefixes)
  const sorted = Object.keys(CONTEXT_NUDGES).sort(
    (a, b) => b.length - a.length,
  );
  for (const prefix of sorted) {
    if (pathname.startsWith(prefix)) {
      return CONTEXT_NUDGES[prefix];
    }
  }
  return null;
}

/* ════════════════════════════════════════
   Lead capture prompt — appears after idle
   ════════════════════════════════════════ */

function LeadCapturePrompt({
  compact = false,
  onCapture,
}: {
  compact?: boolean;
  onCapture: () => void;
}) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    // Store locally — a real integration would POST to an API
    try {
      const existing = JSON.parse(
        localStorage.getItem("hutchrok_leads") || "[]",
      );
      existing.push({ email: trimmed, capturedAt: new Date().toISOString() });
      localStorage.setItem("hutchrok_leads", JSON.stringify(existing));
    } catch {
      // localStorage may be unavailable; proceed silently
    }
    setSubmitted(true);
    setError("");
    onCapture();
  };

  if (submitted) {
    return (
      <div
        className={`rounded-xl border border-gold/20 bg-cream/60 text-center ${compact ? "p-3 mt-3" : "p-4 mt-5"}`}
      >
        <CheckCircle
          className={`mx-auto text-gold ${compact ? "h-4 w-4 mb-1" : "h-5 w-5 mb-2"}`}
        />
        <p
          className={`text-navy font-medium ${compact ? "text-xs" : "text-sm"}`}
        >
          We&apos;ll send you the next steps!
        </p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border border-border/50 bg-cream/40 ${compact ? "p-3 mt-3" : "p-4 mt-5"}`}
    >
      <p
        className={`text-navy font-medium mb-2 ${compact ? "text-xs" : "text-sm"}`}
      >
        Want help starting your business later?
      </p>
      <p
        className={`text-muted-foreground mb-3 ${compact ? "text-[11px]" : "text-xs"}`}
      >
        Enter your email and we&apos;ll send you the steps.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError("");
          }}
          placeholder="you@example.com"
          aria-label="Email address"
          className={`flex-1 rounded-lg border border-border/50 bg-white px-3 text-navy placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-gold/30 ${compact ? "h-8 text-xs" : "h-9 text-sm"}`}
        />
        <Button
          type="submit"
          className={`bg-gold hover:bg-gold-dark text-navy font-bold shrink-0 ${compact ? "h-8 px-3 text-xs" : "h-9 px-4 text-sm"}`}
        >
          <Mail className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
        </Button>
      </form>
      {error && (
        <p
          className={`text-destructive mt-1.5 ${compact ? "text-[10px]" : "text-xs"}`}
        >
          {error}
        </p>
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   Micro trust signals
   ════════════════════════════════════════ */

function TrustSignals({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-x-3 gap-y-1 ${compact ? "mt-3" : "mt-5"}`}
    >
      {TRUST_SIGNALS.map((signal) => (
        <span
          key={signal}
          className={`flex items-center gap-1 text-muted-foreground ${compact ? "text-[10px]" : "text-xs"}`}
        >
          <Star
            className={`text-gold fill-gold ${compact ? "h-2.5 w-2.5" : "h-3 w-3"}`}
          />
          {signal}
        </span>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════
   Inline concierge — for embedding in pages
   ════════════════════════════════════════ */

export function HutchrokConcierge() {
  const [nodeId, setNodeId] = useState("root");
  const [history, setHistory] = useState<string[]>([]);
  const [showLead, setShowLead] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const node = CONCIERGE_TREE[nodeId] ?? CONCIERGE_TREE["root"];

  const navigate = useCallback(
    (next: string) => {
      setHistory((prev) => [...prev, nodeId]);
      setNodeId(next);
      setShowLead(false);
    },
    [nodeId],
  );

  // Show lead capture after 8s idle on nodes that support it
  useEffect(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (node.showLeadCapture && !leadCaptured) {
      idleTimer.current = setTimeout(() => setShowLead(true), 8000);
    } else {
      setShowLead(false);
    }
    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [nodeId, node.showLeadCapture, leadCaptured]);

  // Scroll into view on node change (on mobile especially)
  useEffect(() => {
    panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [nodeId]);

  return (
    <div
      ref={panelRef}
      role="region"
      aria-label="Hutchrok Concierge"
      className="w-full max-w-xl mx-auto"
    >
      {/* Speech bubble */}
      <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6 sm:p-8">
        <div className="flex items-start gap-3 mb-5">
          <div className="h-9 w-9 rounded-full bg-navy flex items-center justify-center shrink-0 mt-0.5">
            <MessageSquare className="h-4 w-4 text-gold" />
          </div>
          <div>
            <p className="font-semibold text-navy text-[15px] sm:text-base leading-relaxed">
              {node.message}
            </p>
            {node.subtitle && (
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                {node.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Options as buttons */}
        <div className="flex flex-col gap-2.5" role="group" aria-label="Options">
          {node.options.map((opt) => (
            <OptionButton key={opt.label} option={opt} onNavigate={navigate} />
          ))}
        </div>

        {/* Trust signals */}
        {node.showTrust && <TrustSignals />}

        {/* Lead capture */}
        {showLead && !leadCaptured && (
          <LeadCapturePrompt
            onCapture={() => {
              setLeadCaptured(true);
              setShowLead(false);
              navigate("lead-thanks");
            }}
          />
        )}
      </div>

      {/* Back crumb */}
      {history.length > 0 && (
        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={() => {
              const prev = history[history.length - 1];
              setHistory((h) => h.slice(0, -1));
              setNodeId(prev);
            }}
            className="text-xs text-muted-foreground hover:text-navy transition-colors underline underline-offset-2"
          >
            Back to previous
          </button>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   Floating concierge — bottom-right FAB
   ════════════════════════════════════════ */

export function ConciergeFloating() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [nodeId, setNodeId] = useState("root");
  const [history, setHistory] = useState<string[]>([]);
  const [contextMode, setContextMode] = useState(false);
  const [showLead, setShowLead] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const node = CONCIERGE_TREE[nodeId] ?? CONCIERGE_TREE["root"];
  const nudge = resolveContextNudge(pathname);

  // Determine what content to display — context nudge or tree node
  const isShowingNudge = contextMode && nudge && nodeId === "root";
  const displayMessage = isShowingNudge ? nudge.message : node.message;
  const displaySubtitle = isShowingNudge ? nudge.subtitle : node.subtitle;
  const displayOptions = isShowingNudge ? nudge.options : node.options;
  const displayShowTrust = isShowingNudge ? true : node.showTrust;
  const displayShowLeadCapture = isShowingNudge
    ? false
    : node.showLeadCapture;

  const navigate = useCallback(
    (next: string) => {
      setContextMode(false);
      setHistory((prev) => [...prev, nodeId]);
      setNodeId(next);
      setShowLead(false);
    },
    [nodeId],
  );

  const reset = useCallback(() => {
    setNodeId("root");
    setHistory([]);
    setContextMode(true);
    setShowLead(false);
  }, []);

  // When path changes, reset to context mode
  useEffect(() => {
    setContextMode(true);
    setNodeId("root");
    setHistory([]);
    setShowLead(false);
  }, [pathname]);

  // Show lead capture after 8s idle on nodes that support it
  useEffect(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (displayShowLeadCapture && !leadCaptured && open) {
      idleTimer.current = setTimeout(() => setShowLead(true), 8000);
    } else {
      setShowLead(false);
    }
    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [nodeId, displayShowLeadCapture, leadCaptured, open]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && open) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* FAB trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close concierge" : "Open concierge"}
        className="fixed bottom-5 right-5 z-50 h-14 w-14 rounded-full bg-navy text-gold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center"
      >
        {open ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageSquare className="h-6 w-6" />
        )}
      </button>

      {/* Panel */}
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Hutchrok Concierge"
          aria-modal="false"
          className="fixed bottom-22 right-5 z-50 w-[calc(100vw-2.5rem)] sm:w-96 max-h-[70vh] overflow-y-auto rounded-2xl border border-border/50 bg-white shadow-xl"
        >
          {/* Header */}
          <div className="sticky top-0 bg-navy rounded-t-2xl px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <MessageSquare className="h-4 w-4 text-gold" />
              <span className="text-sm font-semibold text-white">
                Hutchrok Concierge
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                reset();
              }}
              aria-label="Close"
              className="text-white/60 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5">
            <div className="mb-4">
              <p className="font-semibold text-navy text-sm leading-relaxed">
                {displayMessage}
              </p>
              {displaySubtitle && (
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  {displaySubtitle}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2" role="group" aria-label="Options">
              {displayOptions.map((opt) => (
                <OptionButton
                  key={opt.label}
                  option={opt}
                  onNavigate={navigate}
                  compact
                />
              ))}
            </div>

            {/* Trust signals */}
            {displayShowTrust && <TrustSignals compact />}

            {/* Lead capture */}
            {showLead && !leadCaptured && (
              <LeadCapturePrompt
                compact
                onCapture={() => {
                  setLeadCaptured(true);
                  setShowLead(false);
                  navigate("lead-thanks");
                }}
              />
            )}

            {history.length > 0 && (
              <div className="mt-3 text-center">
                <button
                  type="button"
                  onClick={() => {
                    const prev = history[history.length - 1];
                    setHistory((h) => h.slice(0, -1));
                    setNodeId(prev);
                    setContextMode(false);
                  }}
                  className="text-xs text-muted-foreground hover:text-navy transition-colors underline underline-offset-2"
                >
                  Back to previous
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/* ════════════════════════════════════════
   Shared option button
   ════════════════════════════════════════ */

function OptionButton({
  option,
  onNavigate,
  compact = false,
}: {
  option: ConciergeOption;
  onNavigate: (next: string) => void;
  compact?: boolean;
}) {
  const isBack = option.icon === "ChevronLeft";
  const baseClass = compact
    ? "w-full justify-start gap-2 text-xs font-medium h-9 px-3"
    : "w-full justify-start gap-2.5 text-sm font-medium h-11 px-4";

  const styleClass = isBack
    ? "border-border/50 text-muted-foreground hover:text-navy hover:border-navy/30"
    : "border-navy/15 text-navy hover:bg-navy hover:text-white hover:border-navy";

  // External link — wraps in Next.js Link
  if (option.href) {
    return (
      <Link href={option.href}>
        <Button
          variant="outline"
          className={`${baseClass} ${styleClass} transition-all duration-200`}
        >
          <OptionIcon
            name={option.icon}
            className={compact ? "h-3.5 w-3.5 shrink-0" : "h-4 w-4 shrink-0"}
          />
          {option.label}
        </Button>
      </Link>
    );
  }

  // Internal node transition
  return (
    <Button
      variant="outline"
      onClick={() => option.next && onNavigate(option.next)}
      className={`${baseClass} ${styleClass} transition-all duration-200`}
    >
      <OptionIcon
        name={option.icon}
        className={compact ? "h-3.5 w-3.5 shrink-0" : "h-4 w-4 shrink-0"}
      />
      {option.label}
    </Button>
  );
}
