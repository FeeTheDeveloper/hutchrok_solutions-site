import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Shield,
  CheckCircle,
  Building2,
  Star,
  Users,
  MapPin,
  Eye,
  ArrowRight,
  Handshake,
  Heart,
} from "lucide-react";

/* ──────────────────────────────────────────────
   SOCIAL PROOF STATS — Numbers that build trust
   ────────────────────────────────────────────── */
const stats = [
  { value: "100%", label: "Human-Reviewed Filings" },
  { value: "Texas", label: "Only — SOS Expertise" },
  { value: "$0", label: "Cost for Qualified Veterans" },
  { value: "5-Step", label: "Transparent Process" },
];

export function SocialProofStrip() {
  return (
    <section className="bg-navy py-10 sm:py-12">
      <div className="mx-auto max-w-5xl px-6 sm:px-8 lg:px-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-2xl sm:text-3xl font-bold text-gold mb-1">
                {s.value}
              </p>
              <p className="text-xs sm:text-sm text-white/60 font-medium">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   WHY HUTCHROK EXISTS — Mission statement block
   ────────────────────────────────────────────── */
const pillars = [
  {
    icon: Heart,
    title: "Built by Veterans",
    desc: "Founded to serve those who served. Every process is designed with the veteran experience in mind.",
  },
  {
    icon: Eye,
    title: "No Automation, No Shortcuts",
    desc: "A real person reviews every filing. We don't auto-submit to the Texas SOS — ever.",
  },
  {
    icon: Handshake,
    title: "Guided, Not Gatekept",
    desc: "We don't hide behind forms. Hutchrok walks you through every step of the LLC filing process.",
  },
];

export function WhyHutchrokSection() {
  return (
    <section className="section-padding bg-cream">
      <div className="mx-auto max-w-5xl px-6 sm:px-8 lg:px-10">
        <div className="text-center mb-10 lg:mb-14">
          <p className="text-xs font-semibold tracking-wider uppercase text-gold mb-3">
            Why Hutchrok
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-navy mb-3 leading-tight">
            We Exist Because the System Wasn&apos;t Built for You
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            The Texas SOS filing process is confusing, fragmented, and wasn&apos;t
            designed with veterans in mind. Hutchrok was built to fix that — one
            filing at a time.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {pillars.map((p) => (
            <div
              key={p.title}
              className="bg-white rounded-2xl border border-border/40 p-6 text-center hover:border-gold/30 hover:shadow-md transition-all duration-300"
            >
              <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-gold/8 flex items-center justify-center">
                <p.icon className="h-6 w-6 text-gold" />
              </div>
              <h3 className="font-semibold text-navy text-[15px] mb-2">
                {p.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {p.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/mission">
            <Button
              variant="outline"
              className="border-navy/80 text-navy hover:bg-navy hover:text-white font-medium"
            >
              Read Our Full Mission
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   TEXAS EXPERTISE — Deep local knowledge block
   ────────────────────────────────────────────── */
const texasPoints = [
  {
    icon: MapPin,
    title: "Texas Secretary of State",
    desc: "We know the SOS portal, processing timelines, and filing requirements inside and out.",
  },
  {
    icon: Shield,
    title: "Texas Veterans Commission",
    desc: "We guide veterans through TVC's verification process and coordinate VVL delivery to the SOS.",
  },
  {
    icon: Building2,
    title: "Texas LLC Law",
    desc: "Certificate of Formation (Form 205), registered agent rules, and management structure options — all Texas-specific.",
  },
  {
    icon: Star,
    title: "Veteran Fee Waiver Program",
    desc: "We specialize in the $300 SOS filing fee waiver available exclusively to verified Texas veterans.",
  },
];

export function TexasExpertiseSection() {
  return (
    <section className="section-padding bg-white">
      <div className="mx-auto max-w-5xl px-6 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* Left — text */}
          <div>
            <p className="text-xs font-semibold tracking-wider uppercase text-gold mb-3">
              Texas Expertise
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-4 leading-tight">
              We Work Exclusively with Texas Formations
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-6">
              Hutchrok isn&apos;t a nationwide form-filling service. We operate
              only in Texas — which means we know the Secretary of State&apos;s
              process, the TVC verification pipeline, and the veteran fee waiver
              program better than anyone.
            </p>
            <Link href="/how-it-works">
              <Button
                variant="outline"
                size="sm"
                className="border-gold/40 text-gold hover:bg-gold/10 font-medium"
              >
                See Our 5-Step Process
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          {/* Right — points */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {texasPoints.map((t) => (
              <div
                key={t.title}
                className="flex items-start gap-3 p-4 rounded-xl bg-cream/60 border border-border/40"
              >
                <div className="h-9 w-9 rounded-lg bg-gold/8 flex items-center justify-center shrink-0">
                  <t.icon className="h-4.5 w-4.5 text-gold" />
                </div>
                <div>
                  <h3 className="font-semibold text-navy text-sm mb-0.5">
                    {t.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   TRUST BADGES — Visual credibility strip
   ────────────────────────────────────────────── */
const badges = [
  { icon: Shield, label: "Veteran-Owned & Operated" },
  { icon: MapPin, label: "Texas-Only Focus" },
  { icon: Users, label: "Human-Reviewed Filings" },
  { icon: CheckCircle, label: "No SOS Account Required" },
  { icon: Building2, label: "TVC-Coordinated Process" },
];

export function TrustBadgeStrip() {
  return (
    <section className="border-y border-border/30 bg-cream/50 py-6 sm:py-8">
      <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-10">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {badges.map((b) => (
            <div
              key={b.label}
              className="flex items-center gap-2 text-navy/80"
            >
              <b.icon className="h-4 w-4 text-gold" />
              <span className="text-xs sm:text-sm font-semibold whitespace-nowrap">
                {b.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   PROCESS TRANSPARENCY — Compact inline block
   ────────────────────────────────────────────── */
export function ProcessTransparencyBanner() {
  return (
    <section className="bg-navy/[0.03] border-y border-border/20 py-8 sm:py-10">
      <div className="mx-auto max-w-4xl px-6 sm:px-8 lg:px-10">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className="h-12 w-12 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
            <Eye className="h-6 w-6 text-gold" />
          </div>
          <div className="text-center sm:text-left">
            <h3 className="font-semibold text-navy text-[15px] mb-1">
              Full Process Transparency
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
              Every filing goes through five clear stages: Eligibility &rarr;
              Verification &rarr; Intake &rarr; Filing Prep &rarr; Submission.
              No black boxes. No surprises. You know exactly where your filing
              stands at every step.
            </p>
          </div>
          <Link href="/how-it-works" className="shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="border-gold/40 text-gold hover:bg-gold/10 font-medium text-xs"
            >
              View Process
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
