"use client";

import { useState, useCallback, useRef, useEffect } from "react";
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
} from "lucide-react";
import {
  CONCIERGE_TREE,
  type ConciergeOption,
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
};

function OptionIcon({ name, className }: { name?: string; className?: string }) {
  if (!name) return null;
  const Icon = ICON_MAP[name];
  if (!Icon) return null;
  return <Icon className={className} />;
}

/* ════════════════════════════════════════
   Inline concierge — for embedding in pages
   ════════════════════════════════════════ */

export function HutchrokConcierge() {
  const [nodeId, setNodeId] = useState("root");
  const [history, setHistory] = useState<string[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  const node = CONCIERGE_TREE[nodeId] ?? CONCIERGE_TREE["root"];

  const navigate = useCallback(
    (next: string) => {
      setHistory((prev) => [...prev, nodeId]);
      setNodeId(next);
    },
    [nodeId],
  );

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
  const [open, setOpen] = useState(false);
  const [nodeId, setNodeId] = useState("root");
  const [history, setHistory] = useState<string[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  const node = CONCIERGE_TREE[nodeId] ?? CONCIERGE_TREE["root"];

  const navigate = useCallback(
    (next: string) => {
      setHistory((prev) => [...prev, nodeId]);
      setNodeId(next);
    },
    [nodeId],
  );

  const reset = useCallback(() => {
    setNodeId("root");
    setHistory([]);
  }, []);

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
                {node.message}
              </p>
              {node.subtitle && (
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  {node.subtitle}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2" role="group" aria-label="Options">
              {node.options.map((opt) => (
                <OptionButton
                  key={opt.label}
                  option={opt}
                  onNavigate={navigate}
                  compact
                />
              ))}
            </div>

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
