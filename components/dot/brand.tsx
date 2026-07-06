/**
 * Brand primitives for the DOT tool: the gold checkmark motif and small styled
 * building blocks (Panel, GoldButton, ProgressBar, StatusPill). Kept dependency
 * -light and scoped to the navy/gold palette.
 */
import { cn } from "@/lib/utils";

/** The signature gold checkmark. `pop` triggers the success animation. */
export function GoldCheck({
  size = 28,
  pop = false,
  className,
}: {
  size?: number;
  pop?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn("inline-flex", pop && "dot-check-pop", className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 32 32" width={size} height={size}>
        <defs>
          <linearGradient id="dotGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#B8860B" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#F5D67E" />
          </linearGradient>
        </defs>
        <path
          d="M5 17 L13 24 L27 7"
          fill="none"
          stroke="url(#dotGold)"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function Panel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("dot-panel p-5", className)}>{children}</div>;
}

export function GoldButton({
  className,
  variant = "solid",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "solid" | "outline";
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold",
        variant === "solid" ? "dot-btn-gold" : "dot-btn-outline",
        className,
      )}
      {...props}
    />
  );
}

export function ProgressBar({
  percent,
  className,
}: {
  percent: number;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className={cn("dot-progress-track h-2.5 w-full", className)}>
      <div className="dot-progress-fill" style={{ width: `${clamped}%` }} />
    </div>
  );
}

export function StatusPill({ onTrack }: { onTrack: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        onTrack
          ? "bg-[#3ec98a]/15 text-[#3ec98a]"
          : "bg-[#ff6b6b]/15 text-[#ff6b6b]",
      )}
    >
      <span
        className="inline-block size-1.5 rounded-full"
        style={{ backgroundColor: onTrack ? "#3ec98a" : "#ff6b6b" }}
      />
      {onTrack ? "On track" : "Behind"}
    </span>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-[#c9d2e3]">
        {label}
      </span>
      {children}
    </label>
  );
}

export const selectClass =
  "w-full rounded-md border border-[#21396b] bg-[#0a1a3f] px-3 py-2 text-sm text-white outline-none focus:border-[#d4af37]";
