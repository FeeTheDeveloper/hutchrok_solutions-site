import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FilingTracker from "@/components/filing-tracker";
import { FILING_MILESTONES } from "@/lib/case-status";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "Track My Filing",
  description:
    "Check the live status of your Texas LLC filing with Hutchrok. Enter your case number and email to see exactly where your formation stands.",
};

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ case?: string; email?: string }>;
}) {
  const sp = await searchParams;
  const initialCaseNumber = sp.case ?? "";
  const initialEmail = sp.email ?? "";

  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-gradient-navy py-14 sm:py-20">
        <div className="mx-auto max-w-3xl px-6 sm:px-8 lg:px-10 text-center">
          <Badge
            variant="secondary"
            className="mb-4 text-gold bg-gold/10 text-xs tracking-wider uppercase"
          >
            Filing Status
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 leading-tight">
            Track My Filing
          </h1>
          <p className="text-white/65 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            See exactly where your Texas LLC formation stands — in real time. No
            phone calls, no waiting. Just enter your case number and the email
            you used at intake.
          </p>
        </div>
      </section>

      {/* ── Lookup ── */}
      <section className="section-padding bg-white">
        <div className="mx-auto max-w-3xl px-6 sm:px-8 lg:px-10">
          <FilingTracker
            initialCaseNumber={initialCaseNumber}
            initialEmail={initialEmail}
          />
        </div>
      </section>

      {/* ── How tracking works ── */}
      <section className="bg-cream border-t border-border/30 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-6 sm:px-8 lg:px-10">
          <h2 className="text-center text-xl sm:text-2xl font-bold text-navy mb-8">
            Every Filing Moves Through Five Stages
          </h2>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {FILING_MILESTONES.map((m, i) => (
              <li
                key={m.key}
                className="rounded-2xl border border-border/40 bg-white p-5 text-center"
              >
                <span className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-navy text-sm font-bold text-gold">
                  {i + 1}
                </span>
                <p className="text-sm font-bold text-navy">{m.label}</p>
                <p className="mt-1 text-xs text-muted-foreground leading-snug">
                  {m.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Cant find case ── */}
      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-2xl px-6 sm:px-8 lg:px-10 text-center">
          <h2 className="text-lg sm:text-xl font-bold text-navy mb-3">
            Don&apos;t have a case number yet?
          </h2>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            You&apos;ll receive a case number the moment you complete your free
            filing intake. Start now and you can track every step from here.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/contact">
              <Button className="bg-gold hover:bg-gold-dark text-navy font-bold gap-2">
                Start My Free Filing
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                variant="outline"
                className="border-navy/30 text-navy hover:bg-navy hover:text-white font-medium"
              >
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
