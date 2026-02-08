import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
      {/* ── HERO ── */}
      <section className="relative bg-gradient-navy overflow-hidden">
        <div className="bg-grid-pattern absolute inset-0" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36 text-center">
          <div className="mx-auto max-w-3xl">
            <Image
              src="/brand/logo.png"
              alt="Hutchrok Solutions Group"
              width={400}
              height={120}
              className="mx-auto mb-8 h-24 sm:h-32 lg:h-36 w-auto drop-shadow-lg"
              priority
            />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gold mb-4">
              Veteran-Focused Business Enablement
            </h1>
            <p className="text-base sm:text-lg text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
              Compliant formation, operational structuring &amp; execution support
              for entrepreneurs, startups, and mission-driven organizations.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/contact">
                <Button
                  size="lg"
                  className="bg-gold hover:bg-gold-dark text-navy font-bold text-base px-8"
                >
                  Start Intake
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/services">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gold/50 text-gold hover:bg-gold/10 font-semibold text-base px-8"
                >
                  View Services
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAND ── */}
      <section className="bg-cream border-b border-border/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
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
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center gap-2">
                <item.icon className="h-8 w-8 text-gold" />
                <h3 className="font-semibold text-navy">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES OVERVIEW ── */}
      <section className="py-16 sm:py-24 bg-white bg-grid-pattern">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-3 text-gold bg-gold/10">
              Our Services
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy mb-4">
              End-to-End Business Enablement
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From formation through operations, we provide the systems and support
              your business needs to launch, stay compliant, and scale.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: FileText,
                title: "Business Formation & Structuring",
                desc: "LLC and corporate formation, EIN coordination, operating agreements, and state filing support.",
              },
              {
                icon: Shield,
                title: "Compliance & Operations Setup",
                desc: "Registered agent coordination, compliance calendars, and operational readiness from day one.",
              },
              {
                icon: Lightbulb,
                title: "Strategic Advisory",
                desc: "Entity structuring guidance, holding company strategy, and expansion planning.",
              },
              {
                icon: Settings,
                title: "Managed Business Services",
                desc: "Ongoing filing management, annual report tracking, and operational maintenance.",
              },
            ].map((service) => (
              <Card
                key={service.title}
                className="border border-border/60 hover:border-gold/40 hover:shadow-lg transition-all duration-300 group"
              >
                <CardContent className="p-6">
                  <service.icon className="h-10 w-10 text-gold mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-navy text-lg mb-2">
                    {service.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {service.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/services">
              <Button variant="outline" className="border-navy text-navy hover:bg-navy hover:text-white">
                Explore All Services
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-16 sm:py-24 bg-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-3 text-gold bg-gold/10">
              Process
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A clear, repeatable process designed to get you operational fast.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Intake",
                desc: "Share your business goals and current stage. We assess your needs and build a tailored plan.",
                icon: Target,
              },
              {
                step: "02",
                title: "Build & File",
                desc: "We handle formation, filings, compliance setup, and operational structuring — all coordinated for you.",
                icon: Rocket,
              },
              {
                step: "03",
                title: "Maintain & Scale",
                desc: "Ongoing support keeps you compliant while you focus on growth. Expand when you're ready.",
                icon: TrendingUp,
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative bg-white rounded-xl p-8 border border-border/60 text-center hover:shadow-md transition-shadow"
              >
                <span className="text-5xl font-black text-gold/20 absolute top-4 right-6">
                  {item.step}
                </span>
                <item.icon className="h-10 w-10 text-gold mx-auto mb-4" />
                <h3 className="text-xl font-bold text-navy mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHO WE SERVE ── */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-3 text-gold bg-gold/10">
              Our Clients
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy mb-4">
              Who We Serve
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                className="flex flex-col items-center text-center p-6 rounded-xl bg-cream border border-border/40 hover:border-gold/40 transition-colors"
              >
                <persona.icon className="h-10 w-10 text-gold mb-3" />
                <h3 className="font-semibold text-navy mb-1">{persona.title}</h3>
                <p className="text-sm text-muted-foreground">{persona.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA STRIP ── */}
      <section className="bg-gradient-navy py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Ready to get compliant and operational?
          </h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">
            Start with a quick intake — we'll assess your needs and build a plan
            tailored to your business goals.
          </p>
          <Link href="/contact">
            <Button
              size="lg"
              className="bg-gold hover:bg-gold-dark text-navy font-bold text-base px-10"
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
