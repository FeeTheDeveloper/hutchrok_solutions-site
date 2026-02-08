import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FormationIllustration,
  ComplianceIllustration,
  AdvisoryIllustration,
} from "@/components/activity-illustrations";
import {
  Shield,
  CheckCircle,
  Building2,
  FileText,
  Lightbulb,
  Settings,
  ArrowRight,
  Users,
  Rocket,
  TrendingUp,
  Target,
} from "lucide-react";

export default function HomePage() {
  return (
    <>
      {/* ════════════════════════════════════════
          HERO — Big Logo Splash
          ════════════════════════════════════════ */}
      <section className="relative bg-hero-premium overflow-hidden">
        {/* Faint grid texture */}
        <div className="bg-grid-pattern absolute inset-0 pointer-events-none" />
        {/* Subtle radial ring decoration */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.035]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-gold" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-gold" />
        </div>

        <div className="relative mx-auto max-w-5xl px-6 sm:px-8 lg:px-10 py-24 sm:py-32 lg:py-44 flex flex-col items-center text-center">
          {/* Logo as the headline — generous size, no layout shift */}
          <Image
            src="/brand/logo.png"
            alt="Hutchrok Solutions Group"
            width={600}
            height={200}
            className="mx-auto mb-10 h-28 sm:h-40 lg:h-48 w-auto drop-shadow-[0_4px_32px_rgba(200,169,81,0.12)]"
            priority
            sizes="(max-width: 640px) 280px, (max-width: 1024px) 400px, 600px"
          />

          {/* Subline */}
          <p className="text-lg sm:text-xl lg:text-2xl font-semibold tracking-wide text-gold mb-3">
            Veteran-Focused Business Enablement
          </p>

          {/* Supporting line */}
          <p className="text-sm sm:text-base lg:text-lg text-white/65 mb-10 max-w-xl leading-relaxed">
            Compliant formation, operational structuring &amp; execution support.
          </p>

          {/* CTAs — stack on mobile, row on sm+ */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md sm:max-w-none">
            <Link href="/contact" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gold hover:bg-gold-dark text-navy font-bold text-base px-10 h-12 shadow-lg shadow-gold/10 hover:shadow-gold/20 transition-shadow"
              >
                Start Intake
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/services" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-gold/40 text-gold hover:bg-gold/10 font-semibold text-base px-10 h-12"
              >
                View Services
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          TRUST BAND
          ════════════════════════════════════════ */}
      <section className="bg-cream border-y border-border/30">
        <div className="mx-auto max-w-5xl px-6 sm:px-8 lg:px-10 py-10 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-0 text-center">
            {[
              {
                icon: Settings,
                title: "Systems-First Execution",
                desc: "Structured processes from day one — no guesswork.",
              },
              {
                icon: Shield,
                title: "Compliance-First Setup",
                desc: "Every formation built on a compliant foundation.",
              },
              {
                icon: Building2,
                title: "Built for Scale",
                desc: "Holdings, subsidiaries, and multi-entity structuring.",
              },
            ].map((item, i) => (
              <div
                key={item.title}
                className={`flex flex-col items-center gap-3 px-4 ${
                  i > 0 ? "sm:border-l sm:border-border/40" : ""
                }`}
              >
                <div className="h-12 w-12 rounded-xl bg-gold/8 flex items-center justify-center">
                  <item.icon className="h-6 w-6 text-gold" />
                </div>
                <h3 className="font-semibold text-navy text-[15px]">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-[240px]">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          ACTIVITY VISUALS — Cohesive SVG Cards
          ════════════════════════════════════════ */}
      <section className="section-padding bg-white">
        <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-10">
          <div className="text-center mb-12 lg:mb-16">
            <Badge variant="secondary" className="mb-3 text-gold bg-gold/10 text-xs tracking-wider uppercase">
              What We Do
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-navy mb-3 leading-tight">
              Compliant Business Formation &amp; Operations
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
              Three core competencies, delivered with precision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                Illustration: FormationIllustration,
                title: "Formation & Filings",
                desc: "LLC and corporate formation, EIN coordination, operating agreements, and state filings — all coordinated for you.",
              },
              {
                Illustration: ComplianceIllustration,
                title: "Compliance & Ops Setup",
                desc: "Registered agent coordination, compliance calendars, record-keeping frameworks, and operational readiness.",
              },
              {
                Illustration: AdvisoryIllustration,
                title: "Strategic Advisory",
                desc: "Entity structuring guidance, holding company strategy, expansion planning, and operational efficiency.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="flex flex-col items-center text-center p-6 sm:p-8 rounded-2xl border border-border/50 bg-cream/50 hover:border-gold/30 hover:shadow-md transition-all duration-300"
              >
                <card.Illustration className="h-28 w-28 sm:h-32 sm:w-32 mb-6" />
                <h3 className="text-lg font-bold text-navy mb-2">{card.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SERVICES OVERVIEW — 4 Cards with badges
          ════════════════════════════════════════ */}
      <section className="section-padding bg-cream bg-grid-pattern">
        <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-10">
          <div className="text-center mb-12 lg:mb-16">
            <Badge variant="secondary" className="mb-3 text-gold bg-gold/10 text-xs tracking-wider uppercase">
              Our Services
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-navy mb-3 leading-tight">
              End-to-End Business Enablement
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
              From formation through operations, we provide the systems and support
              your business needs to launch, stay compliant, and scale.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: FileText,
                tag: "Formation",
                title: "Business Formation & Structuring",
                desc: "LLC and corporate formation, EIN coordination, operating agreements, and state filing support.",
              },
              {
                icon: Shield,
                tag: "Compliance",
                title: "Compliance & Operations Setup",
                desc: "Registered agent coordination, compliance calendars, and operational readiness from day one.",
              },
              {
                icon: Lightbulb,
                tag: "Advisory",
                title: "Strategic Advisory",
                desc: "Entity structuring guidance, holding company strategy, and expansion planning.",
              },
              {
                icon: Settings,
                tag: "Managed",
                title: "Managed Business Services",
                desc: "Ongoing filing management, annual report tracking, and operational maintenance.",
              },
            ].map((service) => (
              <Card
                key={service.title}
                className="border border-border/50 bg-white hover:border-gold/40 hover:shadow-lg transition-all duration-300 group flex flex-col"
              >
                <CardContent className="p-6 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-11 w-11 rounded-lg bg-gold/8 flex items-center justify-center group-hover:bg-gold/15 transition-colors">
                      <service.icon className="h-5 w-5 text-gold" />
                    </div>
                    <Badge variant="outline" className="text-[10px] tracking-wider uppercase text-gold/80 border-gold/25 font-medium">
                      {service.tag}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-navy text-[15px] leading-snug mb-2">
                    {service.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                    {service.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/services">
              <Button variant="outline" className="border-navy/80 text-navy hover:bg-navy hover:text-white font-medium">
                Explore All Services
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          HOW IT WORKS — Numbered circles
          ════════════════════════════════════════ */}
      <section className="section-padding bg-white">
        <div className="mx-auto max-w-5xl px-6 sm:px-8 lg:px-10">
          <div className="text-center mb-12 lg:mb-16">
            <Badge variant="secondary" className="mb-3 text-gold bg-gold/10 text-xs tracking-wider uppercase">
              Process
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-navy mb-3 leading-tight">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto text-sm sm:text-base leading-relaxed">
              A clear, repeatable process designed to get you operational fast.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                title: "Intake",
                desc: "Share your business goals and current stage. We assess your needs and build a tailored plan.",
                icon: Target,
              },
              {
                step: 2,
                title: "Build & File",
                desc: "We handle formation, filings, compliance setup, and operational structuring — all coordinated for you.",
                icon: Rocket,
              },
              {
                step: 3,
                title: "Maintain & Scale",
                desc: "Ongoing support keeps you compliant while you focus on growth. Expand when you're ready.",
                icon: TrendingUp,
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative bg-cream/60 rounded-2xl p-8 border border-border/50 text-center hover:shadow-md hover:border-gold/30 transition-all duration-300"
              >
                {/* Numbered circle */}
                <div className="mx-auto mb-5 h-14 w-14 rounded-full bg-navy flex items-center justify-center shadow-sm">
                  <span className="text-lg font-bold text-gold">{item.step}</span>
                </div>
                <item.icon className="h-8 w-8 text-gold/60 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-navy mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-[260px] mx-auto">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          WHO WE SERVE
          ════════════════════════════════════════ */}
      <section className="section-padding bg-cream">
        <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-10">
          <div className="text-center mb-12 lg:mb-16">
            <Badge variant="secondary" className="mb-3 text-gold bg-gold/10 text-xs tracking-wider uppercase">
              Our Clients
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-navy mb-3 leading-tight">
              Who We Serve
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: Shield,
                title: "Veterans",
                desc: "Transitioning from service to entrepreneurship with discipline and structure.",
              },
              {
                icon: Users,
                title: "First-Time Founders",
                desc: "Building the right foundation from day one — no shortcuts, no gaps.",
              },
              {
                icon: Building2,
                title: "Small Businesses",
                desc: "Getting compliant, organized, and positioned for sustainable growth.",
              },
              {
                icon: TrendingUp,
                title: "Scaling Operators",
                desc: "Expanding into holding structures, subsidiaries, and multi-entity operations.",
              },
            ].map((persona) => (
              <div
                key={persona.title}
                className="flex flex-col items-center text-center p-6 rounded-2xl bg-white border border-border/40 hover:border-gold/30 hover:shadow-md transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-xl bg-gold/8 flex items-center justify-center mb-4">
                  <persona.icon className="h-6 w-6 text-gold" />
                </div>
                <h3 className="font-semibold text-navy mb-1 text-[15px]">{persona.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{persona.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          CTA STRIP
          ════════════════════════════════════════ */}
      <section className="bg-gradient-navy py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-6 sm:px-8 lg:px-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 leading-tight">
            Ready to get compliant and operational?
          </h2>
          <p className="text-white/60 mb-10 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
            Start with a quick intake — we&apos;ll assess your needs and build a plan
            tailored to your business goals.
          </p>
          <Link href="/contact">
            <Button
              size="lg"
              className="bg-gold hover:bg-gold-dark text-navy font-bold text-base px-10 h-12 shadow-lg shadow-gold/10"
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
