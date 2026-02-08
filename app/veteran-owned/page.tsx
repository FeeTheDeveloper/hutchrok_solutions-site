import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Target, Users, CheckCircle, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Veteran-Owned",
  description:
    "Hutchrok Solutions Group is a veteran-owned solutions firm built on discipline, accountability, and an operator mindset.",
};

const values = [
  {
    icon: Shield,
    title: "Discipline Over Hype",
    desc: "We don't chase trends or make empty promises. Every engagement is rooted in structure, process, and clear deliverables.",
  },
  {
    icon: Target,
    title: "Operator Mindset",
    desc: "Our team thinks like operators — because we are. We approach every business challenge with the same rigor and precision that military service demands.",
  },
  {
    icon: Users,
    title: "Accountability First",
    desc: "We hold ourselves to the same standard we hold our clients. Commitments are met, timelines are honored, and communication is direct.",
  },
];

export default function VeteranOwnedPage() {
  return (
    <>
      {/* Page Header */}
      <section className="bg-gradient-navy py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="secondary" className="mb-3 text-gold bg-gold/10">
            Veteran-Owned
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Built by a Veteran. Run Like a Mission.
          </h1>
          <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto">
            Hutchrok Solutions Group is a veteran-owned firm grounded in
            discipline, accountability, and a commitment to doing things right.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 sm:py-24 bg-white bg-grid-pattern">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-center mb-8">
              <Image
                src="/brand/logo.png"
                alt="Hutchrok Solutions Group"
                width={200}
                height={60}
                className="h-16 w-auto"
              />
            </div>
            <h2 className="text-3xl font-bold text-navy mb-6 text-center">
              Our Story
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Hutchrok Solutions Group was founded on a simple observation: too
                many entrepreneurs and business owners launch without the proper
                structure, compliance foundations, or operational systems to
                sustain and scale. The result is wasted time, preventable risk,
                and missed opportunities.
              </p>
              <p>
                As a veteran-owned firm, we bring the same discipline and
                operational precision that military service demands to the world
                of business formation and enablement. We don&apos;t cut corners,
                skip steps, or overpromise. We build systems that work.
              </p>
              <p>
                Our approach is simple: assess the need, build the plan, execute
                with precision, and maintain with accountability. Whether
                you&apos;re forming your first LLC or structuring a holding
                company, we treat every engagement with the seriousness it
                deserves.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 sm:py-24 bg-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy mb-4">
              How We Operate
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Our values aren&apos;t aspirational — they&apos;re operational.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value) => (
              <div
                key={value.title}
                className="bg-white rounded-xl p-8 border border-border/60 text-center hover:border-gold/40 transition-colors"
              >
                <value.icon className="h-12 w-12 text-gold mx-auto mb-4" />
                <h3 className="text-xl font-bold text-navy mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {value.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commitment */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-navy mb-6">
            Our Commitment
          </h2>
          <div className="space-y-3 text-left max-w-xl mx-auto">
            {[
              "Transparent communication at every stage",
              "Compliance-first approach to every formation",
              "Systems built for repeatability and scale",
              "No exaggerated claims — only clear deliverables",
              "Respect for your time, your goals, and your investment",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-gold mt-0.5 shrink-0" />
                <span className="text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-navy py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Work With a Team That Operates With Purpose
          </h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">
            Start your engagement with a quick intake. We&apos;ll assess your
            needs and build a plan tailored to your business.
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
