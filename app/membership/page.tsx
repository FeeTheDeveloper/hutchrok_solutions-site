import Link from "next/link";
import { ArrowRight, Check, Shield, Clock3, Newspaper, BriefcaseBusiness } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MEMBERSHIP_DISCLAIMER, MEMBERSHIP_TIERS } from "@/lib/membership-tiers";

export const metadata = {
  title: "Hutchrok Membership | Veteran Business Filing & Growth Plans",
  description:
    "Choose a Hutchrok membership for included filing services, priority preparation, veteran business intelligence, compliance support, and expanded subscriber services.",
};

export default function MembershipPage() {
  return (
    <>
      <section className="bg-gradient-navy py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-gold mb-4">
            Hutchrok Membership
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-5">
            Your filing benefit now comes with the platform built to help you operate.
          </h1>
          <p className="text-white/70 max-w-3xl mx-auto text-base sm:text-lg leading-relaxed mb-8">
            Active membership is required for Hutchrok filing services. Qualified filing benefits are included up to your plan allowance, while higher tiers add faster internal preparation, broader advisory support, stronger discounts, and deeper access to veteran-focused business and personal-life updates.
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-xs sm:text-sm text-white/70">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2"><Shield className="h-4 w-4 text-gold" /> Membership-gated filings</span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2"><Clock3 className="h-4 w-4 text-gold" /> Tier-based internal priority</span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2"><Newspaper className="h-4 w-4 text-gold" /> Veteran Intelligence updates</span>
          </div>
        </div>
      </section>

      <section className="section-padding bg-cream">
        <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {MEMBERSHIP_TIERS.map((tier) => (
              <div
                key={tier.slug}
                className={`relative flex flex-col rounded-2xl p-7 border ${tier.featured ? "bg-navy text-white border-gold/50 shadow-xl lg:-my-3 lg:py-10" : "bg-white text-navy border-border/60"}`}
              >
                {tier.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-navy">
                    Best Value
                  </span>
                )}
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold mb-3">{tier.slug}</p>
                <h2 className="text-2xl font-bold mb-1">{tier.name}</h2>
                <div className="text-4xl font-bold text-gold mb-3">{tier.priceLabel}</div>
                <p className={tier.featured ? "text-white/70 mb-5" : "text-muted-foreground mb-5"}>{tier.tagline}</p>

                <div className={`rounded-xl p-4 mb-5 ${tier.featured ? "bg-white/7 border border-white/10" : "bg-cream border border-border/40"}`}>
                  <p className="text-sm font-semibold mb-1">Included filing benefit</p>
                  <p className={tier.featured ? "text-sm text-white/75" : "text-sm text-muted-foreground"}>{tier.filingAllowance}</p>
                  <p className="text-sm font-semibold mt-3 mb-1">Internal preparation target</p>
                  <p className={tier.featured ? "text-sm text-white/75" : "text-sm text-muted-foreground"}>{tier.internalPrepTarget}</p>
                </div>

                <ul className="space-y-3 mb-7">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm">
                      <Check className="h-4 w-4 text-gold mt-0.5 shrink-0" />
                      <span className={tier.featured ? "text-white/85" : "text-navy/85"}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <p className={`text-xs mb-5 ${tier.featured ? "text-white/60" : "text-muted-foreground"}`}>{tier.serviceDiscount}</p>
                <Link href={tier.ctaHref} className="mt-auto">
                  <Button className={`w-full h-11 font-semibold ${tier.featured ? "bg-gold hover:bg-gold-dark text-navy" : "bg-navy hover:bg-navy-light text-white"}`}>
                    {tier.ctaLabel}<ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-border/50 bg-white p-6 sm:p-8">
            <div className="flex items-start gap-3">
              <BriefcaseBusiness className="h-5 w-5 text-gold mt-0.5" />
              <div>
                <h3 className="font-semibold text-navy mb-2">How the filing benefit works</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{MEMBERSHIP_DISCLAIMER}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
