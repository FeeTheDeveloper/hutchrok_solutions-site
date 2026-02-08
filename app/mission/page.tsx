import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Cog,
  Building2,
  BarChart3,
  Layers,
  Target,
  Shield,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Mission",
  description:
    "The mission of Hutchrok Solutions Group: systems-first execution, compliance-driven operations, and a holding company mindset.",
};

const pillars = [
  {
    icon: Cog,
    title: "Systems-First Execution",
    desc: "Every business we touch is built on repeatable systems — not ad-hoc decisions. From formation to filing to ongoing operations, our processes are designed to eliminate guesswork and reduce risk.",
  },
  {
    icon: Shield,
    title: "Compliance as a Foundation",
    desc: "Compliance is not an afterthought. It's the starting point. We build every entity and operational plan on a compliant foundation so you can operate with confidence from day one.",
  },
  {
    icon: Building2,
    title: "Holding Company Mindset",
    desc: "We help entrepreneurs think beyond their first entity. Our approach considers multi-entity structuring, asset protection, and operational scalability — the blueprint for building a portfolio of businesses.",
  },
  {
    icon: Layers,
    title: "Execution Engine",
    desc: "Ideas without execution are just ideas. We build the operational infrastructure — the engine — that turns your business plan into a functioning, compliant, and scalable operation.",
  },
  {
    icon: BarChart3,
    title: "Operational Scalability",
    desc: "From solo founder to multi-entity operator, our systems are designed to scale with you. Add subsidiaries, expand into new states, and grow your operations without rebuilding from scratch.",
  },
  {
    icon: Target,
    title: "Mission-Driven Focus",
    desc: "We serve entrepreneurs, veterans, and mission-driven organizations who are serious about building something real. Our work is purposeful, our standards are high, and our commitment is unwavering.",
  },
];

export default function MissionPage() {
  return (
    <>
      {/* Page Header */}
      <section className="bg-gradient-navy py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="secondary" className="mb-3 text-gold bg-gold/10">
            Our Mission
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            The Blueprint
          </h1>
          <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto">
            Systems-first execution. Compliance-driven operations. A holding
            company mindset applied to everything we build.
          </p>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 sm:py-24 bg-white bg-grid-pattern">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-navy mb-6">
            Why We Exist
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed text-left">
            <p>
              Hutchrok Solutions Group exists to close the gap between ambition
              and execution. Too many entrepreneurs launch businesses without the
              structural foundation needed to survive, let alone scale. We solve
              that problem.
            </p>
            <p>
              We are an execution engine — a systems-first firm that takes the
              complexity of business formation, compliance, and operations and
              turns it into a clear, repeatable process. Our clients don&apos;t
              just get an LLC filed. They get a compliant entity, an operational
              framework, and a clear path forward.
            </p>
            <p>
              Our mission is to deliver compliant business formation, operational
              structuring, and execution support to entrepreneurs, startups, and
              mission-driven organizations — with the discipline and precision of
              a veteran-led operation.
            </p>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-16 sm:py-24 bg-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy mb-4">
              Our Pillars
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              The principles that guide every engagement, decision, and
              deliverable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pillars.map((pillar) => (
              <div
                key={pillar.title}
                className="bg-white rounded-xl p-8 border border-border/60 hover:border-gold/40 transition-colors"
              >
                <pillar.icon className="h-10 w-10 text-gold mb-4" />
                <h3 className="text-lg font-bold text-navy mb-2">
                  {pillar.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {pillar.desc}
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
            Align With a Team That Executes
          </h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">
            If you&apos;re serious about building a compliant, scalable business,
            we&apos;re ready to support you.
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
