import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import FederalIntakeForm from "@/components/federal-intake-form";
import { getFederalTiers } from "@/lib/consulting/federal-contract-prep";
import { Landmark, ClipboardCheck, FileCheck, ShieldCheck, Check, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Federal Contract Prep — Get Federal-Ready",
  description:
    "Consulting that gets small businesses federal-ready: entity and document readiness, SAM.gov registration prep, and certification navigation. Veteran-owned.",
};

const highlights = [
  { icon: ClipboardCheck, title: "Readiness first", desc: "We map the gap between where your business is and what federal buyers require." },
  { icon: FileCheck, title: "Documents done right", desc: "Entity records, SAM.gov registration prep, and capability statements — built to pass validation." },
  { icon: ShieldCheck, title: "Veteran-owned", desc: "Operator-reviewed guidance from a team that runs its own federal registration." },
];

const faqs = [
  {
    q: "Do you guarantee we'll win a federal contract?",
    a: "No — and no honest consultant can. We prepare your business so it can compete: correct registrations, complete documentation, and a clear strategy. Awards are decided by contracting officers through the federal procurement process.",
  },
  {
    q: "Is this legal or tax advice?",
    a: "No. This is operational business consulting. For legal or tax questions we'll tell you plainly when it's time to talk to a licensed attorney or CPA.",
  },
  {
    q: "Will you ask for my EIN, SSN, or SAM.gov login?",
    a: "Never. We ask only whether you have an EIN — not the number itself — and we never collect SSNs, bank details, or login credentials. You keep control of your own accounts at every step.",
  },
  {
    q: "We already started SAM.gov registration and got stuck. Can you help?",
    a: "That's one of the most common situations we see. Tell us where it stalled in the intake form — entity validation and name-mismatch issues are usually fixable once the underlying records are aligned.",
  },
  {
    q: "Which tier should we start with?",
    a: "If you're unsure, start with the Strategic Roadmap. It's a flat-fee session that ends with a written plan — including whether the bigger tiers are even worth it for you right now.",
  },
];

export default function FederalContractPrepPage() {
  const tiers = getFederalTiers();

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-navy py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-6 sm:px-8 lg:px-10 text-center">
          <Badge variant="secondary" className="mb-4 text-gold bg-gold/10 text-xs tracking-wider uppercase">
            <Landmark className="h-3 w-3 mr-1" />
            Federal Contract Prep
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            Get Your Business Federal-Ready
          </h1>
          <p className="text-white/65 max-w-2xl mx-auto text-sm sm:text-base lg:text-lg leading-relaxed">
            The federal government buys almost everything — from landscaping to
            logistics. Most small businesses never sell to it because the setup
            defeats them. We get your entity, documents, and registrations
            ready so you can compete.
          </p>
          <div className="mt-7">
            <Link href="#intake">
              <Button size="lg" className="bg-gold hover:bg-gold-dark text-navy font-bold gap-2">
                Start My Readiness Review
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <p className="mt-5 text-xs text-white/40 tracking-wide">
            Veteran-owned · UEI PT36H4F81AU9 · SAM.gov registration in progress
          </p>
        </div>
      </section>

      {/* Highlights */}
      <section className="bg-cream border-b border-border/30 py-10">
        <div className="mx-auto max-w-5xl px-6 sm:px-8 lg:px-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {highlights.map((h) => (
            <div key={h.title} className="flex flex-col items-center text-center gap-2">
              <div className="h-11 w-11 rounded-xl bg-gold/10 flex items-center justify-center">
                <h.icon className="h-5 w-5 text-gold" />
              </div>
              <h3 className="font-semibold text-navy text-[15px]">{h.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[240px]">{h.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing tiers */}
      <section className="section-padding bg-white">
        <div className="mx-auto max-w-5xl px-6 sm:px-8 lg:px-10">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-2">Three Ways to Engage</h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
              Start where you are. Every tier ends with deliverables you keep,
              whether or not you continue.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map((tier, i) => (
              <div
                key={tier.key}
                className={
                  i === 1
                    ? "rounded-2xl border-2 border-gold bg-white p-6 shadow-md flex flex-col"
                    : "rounded-2xl border border-border/50 bg-white p-6 shadow-sm flex flex-col"
                }
              >
                {i === 1 && (
                  <span className="self-start rounded-full bg-gold/10 px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-gold-dark mb-3">
                    Most popular
                  </span>
                )}
                <h3 className="text-lg font-bold text-navy">{tier.name}</h3>
                <p className="mt-1 text-2xl font-bold text-navy">{tier.fee}</p>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{tier.tagline}</p>
                <ul className="mt-4 space-y-2 flex-1">
                  {tier.includes.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="#intake" className="mt-6">
                  <Button
                    className={
                      i === 1
                        ? "w-full bg-gold hover:bg-gold-dark text-navy font-bold"
                        : "w-full border-navy/30 text-navy hover:bg-navy hover:text-white"
                    }
                    variant={i === 1 ? "default" : "outline"}
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-cream border-y border-border/30 section-padding">
        <div className="mx-auto max-w-3xl px-6 sm:px-8 lg:px-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-navy text-center mb-8">
            Straight Answers
          </h2>
          <div className="space-y-4">
            {faqs.map((f) => (
              <details key={f.q} className="group rounded-xl border border-border/50 bg-white p-5">
                <summary className="cursor-pointer list-none font-semibold text-navy text-[15px] flex items-center justify-between gap-3">
                  {f.q}
                  <span className="text-gold transition-transform group-open:rotate-90">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Intake form */}
      <section id="intake" className="section-padding bg-white scroll-mt-20">
        <div className="mx-auto max-w-3xl px-6 sm:px-8 lg:px-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-2">Federal Readiness Intake</h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Takes about 4 minutes. Required fields are marked with an asterisk.
            </p>
          </div>
          <FederalIntakeForm />
        </div>
      </section>

      {/* Disclaimer */}
      <section className="bg-white border-t border-border/30 py-8">
        <div className="mx-auto max-w-3xl px-6 sm:px-8 lg:px-10">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            Operational business consulting only — not legal or tax advice. No
            contract awards are guaranteed. Verify requirements at SAM.gov and
            SBA.gov.
          </p>
        </div>
      </section>
    </>
  );
}
