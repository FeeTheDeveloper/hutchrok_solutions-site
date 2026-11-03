import Link from "next/link";
import { Tag } from "lucide-react";
import { activeSpecials, specialServiceNames } from "@/lib/specials";

/** Renders currently active add-on specials; renders nothing when none run. */
export default function SpecialsStrip() {
  const specials = activeSpecials();
  if (specials.length === 0) return null;
  return (
    <section aria-label="Current specials" className="bg-gold/10 border-y border-gold/30">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 space-y-3">
        {specials.map((s) => (
          <div key={s.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="flex items-center gap-2 font-bold text-navy">
                <Tag className="h-4 w-4 text-gold" /> {s.title} · {s.percentOff}% off
              </p>
              <p className="text-sm text-navy/70">
                {s.blurb} Applies to {specialServiceNames(s).join(", ")}. Code{" "}
                <span className="font-mono font-bold">{s.code}</span>. Ends{" "}
                {new Date(`${s.endsOn}T12:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric" })}.
              </p>
            </div>
            <Link href="/launch-services" className="shrink-0 text-sm font-bold text-navy underline underline-offset-4">
              See add-on services
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
