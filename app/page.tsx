import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  CheckCircle,
  FileText,
  ArrowRight,
  Star,
  BadgeCheck,
  Building2,
  Globe,
  Palette,
  Mail,
  Server,
  PenTool,
  ClipboardList,
  Rocket,
} from "lucide-react";
import { HutchrokConcierge } from "@/components/concierge/hutchrok-concierge";
import { formatStartingPrice, PAID_SERVICES } from "@/lib/paid-services";
import {
  SocialProofStrip,
  WhyHutchrokSection,
  TexasExpertiseSection,
  TrustBadgeStrip,
} from "@/components/authority-signals";

const paidServiceIcons = {
  "business-website": Globe,
  "brand-identity-package": Palette,
  "logo-design": PenTool,
  "business-email-setup": Mail,
  "domain-hosting": Server,
  "compliance-ops-setup": FileText,
} as const;

export default function HomePage() {
  return (
    <>
      {/* ════════════════════════════════════════
          HERO
          ════════════════════════════════════════ */}
      <section className="relative bg-hero-premium overflow-hidden">
        <div className="bg-grid-pattern absolute inset-0 pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none opacity-[0.035]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-gold" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-gold" />
        </div>

        <div className="relative mx-auto max-w-5xl px-6 sm:px-8 lg:px-10 py-24 sm:py-32 lg:py-44 flex flex-col items-center text-center">
          <Image
            src="/brand/logo.png"
            alt="Hutchrok Solutions Group"
            width={600}
            height={200}
            className="mx-auto mb-10 h-28 sm:h-40 lg:h-48 w-auto drop-shadow-[0_4px_32px_rgba(200,169,81,0.12)]"
            priority
            sizes="(max-width: 640px) 280px, (max-width: 1024px) 400px, 600px"
          />

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mb-4 leading-tight max-w-3xl">
            Veterans Can Start a Texas LLC for Free
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-white/65 mb-6 max-w-2xl leading-relaxed">
            Hutchrok handles your intake, guides you through TVC verification,
            prepares your Certificate of Formation, and manages the filing with
            the Texas Secretary of State — at no cost to you.
          </p>

          <p className="text-xs sm:text-sm text-gold/70 mb-10 font-medium tracking-wide">
            Free Texas LLC filing support for qualified veterans. No SOS account needed.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md sm:max-w-none">
            <Link href="/free-filing" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gold hover:bg-gold-dark text-navy font-bold text-base px-10 h-12 shadow-lg shadow-gold/10 hover:shadow-gold/20 transition-shadow"
              >
                Start My Free Filing
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/eligibility" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-gold/40 text-gold hover:bg-gold/10 font-semibold text-base px-10 h-12"
              >
                See If I Qualify
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          TRUST BAND
          ════════════════════════════════════════ */}
      <section className="bg-cream border-y border-border/30">
        <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-10 py-10 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6 text-center">
            {[
              {
                icon: Shield,
                title: "Veteran-Focused",
                desc: "Built by veterans, for veterans. Every filing is handled with the care your service earned.",
              },
              {
                icon: FileText,
                title: "Operator-Reviewed Filings",
                desc: "No automated submissions. A real person reviews and files every Certificate of Formation.",
              },
              {
                icon: Building2,
                title: "Texas-Specific Expertise",
                desc: "We work exclusively with Texas LLC formations and TVC verification — it's all we do.",
              },
              {
                icon: CheckCircle,
                title: "No SOS Account Required",
                desc: "You don't need a Secretary of State account. Hutchrok handles the entire filing process for you.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex flex-col items-center gap-3 px-3"
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
          SOCIAL PROOF — Stats Strip
          ════════════════════════════════════════ */}
      <SocialProofStrip />

      {/* ════════════════════════════════════════
          CONCIERGE — Guided Assistant
          ════════════════════════════════════════ */}
      <section className="section-padding bg-white">
        <div className="mx-auto max-w-5xl px-6 sm:px-8 lg:px-10">
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-3 text-gold bg-gold/10 text-xs tracking-wider uppercase">
              Guide
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-navy mb-3 leading-tight">
              Not Sure Where to Start?
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
              Tell us where you are in the process and we&apos;ll point you in the right direction.
            </p>
          </div>
          <HutchrokConcierge />
        </div>
      </section>

      {/* ════════════════════════════════════════
          HOW IT WORKS — 5 Steps
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
            <p className="text-muted-foreground max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
              Five clear steps from veteran to LLC owner. We guide you at every stage.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              {
                step: 1,
                title: "Check Eligibility",
                desc: "Confirm you meet the requirements: U.S. veteran, honorable discharge, Texas LLC.",
                icon: BadgeCheck,
              },
              {
                step: 2,
                title: "Get TVC Verified",
                desc: "Obtain your Veteran Verification Letter from the Texas Veterans Commission.",
                icon: Shield,
              },
              {
                step: 3,
                title: "Complete Intake",
                desc: "Provide your LLC details — business name, registered agent, management type.",
                icon: ClipboardList,
              },
              {
                step: 4,
                title: "We Prepare Filing",
                desc: "Hutchrok prepares your Certificate of Formation and reviews every detail.",
                icon: FileText,
              },
              {
                step: 5,
                title: "Launch Your Business",
                desc: "We file with the Texas SOS. You receive your approved formation documents.",
                icon: Rocket,
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative bg-cream/60 rounded-2xl p-6 border border-border/50 text-center hover:shadow-md hover:border-gold/30 transition-all duration-300"
              >
                <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-navy flex items-center justify-center shadow-sm">
                  <span className="text-base font-bold text-gold">{item.step}</span>
                </div>
                <item.icon className="h-7 w-7 text-gold/60 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-navy mb-1.5">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/how-it-works">
              <Button variant="outline" className="border-navy/80 text-navy hover:bg-navy hover:text-white font-medium">
                See Full Process Details
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          WHO QUALIFIES
          ════════════════════════════════════════ */}
      <section className="section-padding bg-cream">
        <div className="mx-auto max-w-5xl px-6 sm:px-8 lg:px-10">
          <div className="text-center mb-12 lg:mb-16">
            <Badge variant="secondary" className="mb-3 text-gold bg-gold/10 text-xs tracking-wider uppercase">
              Eligibility
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-navy mb-3 leading-tight">
              Who Qualifies
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
              This program is built for U.S. military veterans forming a new Texas LLC.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {[
              {
                icon: Star,
                title: "U.S. Military Veteran",
                desc: "Honorably discharged from any branch of the U.S. Armed Forces.",
              },
              {
                icon: Shield,
                title: "TVC Verification Letter",
                desc: "Must obtain (or already hold) a Veteran Verification Letter from the Texas Veterans Commission.",
              },
              {
                icon: Building2,
                title: "Texas LLC Only",
                desc: "Filing a new Texas Limited Liability Company — single or multi-member.",
              },
              {
                icon: CheckCircle,
                title: "One Free Filing",
                desc: "One free LLC formation per qualified veteran through this program.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-4 p-6 rounded-2xl bg-white border border-border/40 hover:border-gold/30 hover:shadow-md transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-xl bg-gold/8 flex items-center justify-center shrink-0">
                  <item.icon className="h-6 w-6 text-gold" />
                </div>
                <div>
                  <h3 className="font-semibold text-navy mb-1 text-[15px]">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/free-filing">
              <Button className="bg-gold hover:bg-gold-dark text-navy font-semibold">
                See If I Qualify
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          WHY HUTCHROK — Mission Authority
          ════════════════════════════════════════ */}
      <WhyHutchrokSection />

      {/* ════════════════════════════════════════
          TEXAS EXPERTISE — Local Authority
          ════════════════════════════════════════ */}
      <TexasExpertiseSection />

      {/* ════════════════════════════════════════
          POST-FILING SERVICES — Paid Upsells
          ════════════════════════════════════════ */}
      <section className="section-padding bg-white">
        <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-10">
          <div className="text-center mb-12 lg:mb-16">
            <Badge variant="secondary" className="mb-3 text-gold bg-gold/10 text-xs tracking-wider uppercase">
              After Your LLC
            </Badge>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-navy mb-3 leading-tight">
              Optional Paid Services After Your LLC
          </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
              Your free filing is just the start. Build a professional presence
              with services designed for new business owners.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PAID_SERVICES.map((service) => {
              const Icon = paidServiceIcons[service.slug];
              return (
              <Card
                key={service.slug}
                className="border border-border/50 bg-cream/50 hover:border-gold/40 hover:shadow-lg transition-all duration-300 group flex flex-col"
              >
                <CardContent className="p-6 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-11 w-11 rounded-lg bg-gold/8 flex items-center justify-center group-hover:bg-gold/15 transition-colors">
                      <Icon className="h-5 w-5 text-gold" />
                    </div>
                    <Badge variant="outline" className="text-[10px] tracking-wider uppercase text-gold/80 border-gold/25 font-medium">
                      {service.tag}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-navy text-[15px] leading-snug mb-2">
                    {service.title}
                  </h3>
                  <p className="text-sm font-semibold text-navy mb-2">
                    {formatStartingPrice(service.startingPrice)}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {service.description}
                  </p>
                  <Link href={`/service-request?service=${service.slug}`} className="mt-auto">
                    <Button className="w-full bg-gold hover:bg-gold-dark text-navy font-semibold h-10">
                      {service.primaryCtaLabel}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
              );
            })}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-8">
            These are optional paid services available after your LLC is filed. Your free filing comes with zero obligations.
          </p>

          <div className="text-center mt-6">
            <Link href="/launch-services">
              <Button variant="outline" className="border-navy/80 text-navy hover:bg-navy hover:text-white font-medium">
                See Paid Service Options
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          TRUST BADGES — Credibility Strip
          ════════════════════════════════════════ */}
      <TrustBadgeStrip />

      {/* ════════════════════════════════════════
          CTA STRIP
          ════════════════════════════════════════ */}
      <section className="bg-gradient-navy py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-6 sm:px-8 lg:px-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 leading-tight">
            Ready to file your Texas LLC — for free?
          </h2>
          <p className="text-white/60 mb-6 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
            Start your business without navigating the Texas system alone.
            Hutchrok manages every step from intake to filing.
          </p>
          <p className="text-xs text-gold/60 mb-10 font-medium">
            Veteran-owned · Operator-reviewed · No filing fees · No SOS account required
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/free-filing">
              <Button
                size="lg"
                className="bg-gold hover:bg-gold-dark text-navy font-bold text-base px-10 h-12 shadow-lg shadow-gold/10"
              >
                Start My Free Filing
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/verification-help">
              <Button
                size="lg"
                variant="outline"
                className="border-gold/40 text-gold hover:bg-gold/10 font-semibold text-base px-8 h-12"
              >
                I Need Verification Help
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
