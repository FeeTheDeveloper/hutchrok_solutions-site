import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, ArrowRight, CreditCard } from "lucide-react";

export const metadata: Metadata = {
  title: "Credit Enablement",
  description:
    "Business credit readiness and enablement services from Hutchrok Solutions Group. Build your business credit profile the right way.",
};

const whatWeDo = [
  "Business credit profile readiness assessment",
  "Guidance on establishing trade lines and vendor accounts",
  "Credit-building strategy development",
  "DUNS number registration guidance",
  "Business credit monitoring awareness",
  "Documentation and compliance readiness for lending",
  "Separation of business and personal credit guidance",
];

const whatWeDontDo = [
  "We do not offer loans or lines of credit",
  "We do not guarantee credit approvals or scores",
  "We are not a credit repair agency",
  "We do not provide financial or investment advice",
  "We do not act as a licensed financial institution",
];

export default function CreditEnablementPage() {
  return (
    <>
      {/* Page Header */}
      <section className="bg-gradient-navy py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="secondary" className="mb-3 text-gold bg-gold/10">
            Credit Enablement
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Business Credit Readiness
          </h1>
          <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto">
            Build your business credit profile on the right foundation.
            Structured guidance — not shortcuts, not promises.
          </p>
        </div>
      </section>

      {/* Overview */}
      <section className="py-16 sm:py-24 bg-white bg-grid-pattern">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy mb-4">
              Credit Enablement, Not Credit Repair
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We help business owners establish and build a legitimate business
              credit profile through proper structuring, documentation, and
              strategic guidance. Our approach is compliance-first — we focus on
              positioning your business for creditworthiness, not making promises
              we can&apos;t keep.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-5xl mx-auto">
            {/* What We Do */}
            <div className="bg-cream rounded-xl border border-border/40 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-lg bg-gold/10 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-gold" />
                </div>
                <h3 className="text-xl font-bold text-navy">What We Do</h3>
              </div>
              <ul className="space-y-3">
                {whatWeDo.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-gold mt-0.5 shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What We Don't Do */}
            <div className="bg-white rounded-xl border border-border/60 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-destructive" />
                </div>
                <h3 className="text-xl font-bold text-navy">
                  What We Don&apos;t Do
                </h3>
              </div>
              <ul className="space-y-3">
                {whatWeDontDo.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <XCircle className="h-4 w-4 text-destructive/60 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 sm:py-24 bg-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy mb-4">
              Our Approach
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Structured, transparent, and rooted in compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "Assess",
                desc: "We evaluate your current business structure, documentation, and credit readiness to identify gaps and opportunities.",
              },
              {
                step: "02",
                title: "Position",
                desc: "We guide you through establishing the foundational elements for a strong business credit profile — DUNS, trade lines, vendor accounts.",
              },
              {
                step: "03",
                title: "Build",
                desc: "With the right structure in place, we support your ongoing credit-building efforts through strategy and awareness.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative bg-white rounded-xl p-8 border border-border/60 text-center"
              >
                <span className="text-5xl font-black text-gold/20 absolute top-4 right-6">
                  {item.step}
                </span>
                <h3 className="text-xl font-bold text-navy mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-navy py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Ready to Build Your Business Credit Profile?
          </h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">
            Start with an intake so we can assess where you are and build a plan
            for credit readiness.
          </p>
          <Link href="/contact">
            <Button
              size="lg"
              className="bg-gold hover:bg-gold-dark text-navy font-bold px-10"
            >
              Start Intake
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
