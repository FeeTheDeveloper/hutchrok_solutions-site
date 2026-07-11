import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Shield,
  CheckCircle,
  FileText,
  ArrowRight,
  Star,
  BadgeCheck,
  Building2,
  ClipboardList,
  Rocket,
  Check,
} from "lucide-react";
import { HutchrokConcierge } from "@/components/concierge/hutchrok-concierge";
import { formatStartingPrice, PAID_SERVICES } from "@/lib/paid-services";
import { LAUNCH_OFFERS } from "@/lib/launch-offers";
import {
  SocialProofStrip,
  TexasExpertiseSection,
  TrustBadgeStrip,
} from "@/components/authority-signals";
import { VeteranOwnedBadge } from "@/components/VeteranOwnedBadge";

/** Mono field-label — the site's signature device, styled like a form annotation. */
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-gold border border-gold/30 rounded px-2.5 py-1 inline-block">
      {children}
    </span>
  );
}

export default function HomePage() {
  return (
    <>
      {/* ════════════════════════════════════════
          HERO — Veteran Business Launch Platform
          ════════════════════════════════════════ */}
      <section className="relative bg-hero-premium overflow-hidden">
        <div className="bg-grid-pattern absolute inset-0 pointer-events-none" />

        <div className="relative mx-auto max-w-4xl px-6 sm:px-8 lg:px-10 py-24 sm:py-32 lg:py-40 flex flex-col items-center text-center">
          <p className="font-mono text-[11px] sm:text-xs tracking-[0.28em] uppercase text-gold/80 mb-6">
            Veteran Business Launch Platform · Texas
          </p>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-[1.08] max-w-3xl">
            From DD-214 to{" "}
            <span className="text-gold">open for business.</span>
          </h1>

          <p className="text-base sm:text-lg text-white/70 mb-10 max-w-2xl leading-relaxed">
            Hutchrok files your Texas LLC for free — then equips it to earn.
            TVC verification, Certificate of Formation, SOS filing, and every
            launch asset your new company needs, handled by veterans who have
            done it themselves.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md sm:max-w-none mb-12">
            <Link href="/free-filing" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gold hover:bg-gold-dark text-navy font-bold text-base px-10 h-12 shadow-lg shadow-gold/10 hover:shadow-gold/20 transition-shadow"
              >
                Start My Free Filing
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="#launch-path" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-gold/40 text-gold hover:bg-gold/10 font-semibold text-base px-10 h-12"
              >
                See the Launch Package
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-[11px] tracking-[0.16em] uppercase text-white/50">
            <span className="flex items-center gap-1.5">
              <BadgeCheck className="h-3.5 w-3.5 text-gold/70" />
              TVC-Verified Veteran-Owned
            </span>
            <span className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-gold/70" />
              Human-Reviewed Filings
            </span>
            <span className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-gold/70" />
              Texas-Only Expertise
            </span>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SOCIAL PROOF — Stats Strip
          ════════════════════════════════════════ */}
      <SocialProofStrip />

      {/* ════════════════════════════════════════
          LAUNCH PATH — Revenue Architecture
          ════════════════════════════════════════ */}
      <section id="launch-path" className="section-padding bg-cream scroll-mt-20">
        <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-10">
          <div className="text-center mb-12 lg:mb-16">
            <div className="mb-4">
              <FieldLabel>Launch Path</FieldLabel>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-navy mb-3 leading-tight">
              The Filing Is Free. The Mission Is Bigger.
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
              Every veteran gets the free LLC filing — no strings. When you&apos;re
              ready to look open for business and stay compliant, Hutchrok is
              built for that too.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {LAUNCH_OFFERS.map((offer) => (
              <div
                key={offer.slug}
                className={`relative flex flex-col rounded-2xl p-7 transition-all duration-300 ${
                  offer.featured
                    ? "bg-navy text-white border border-gold/50 shadow-xl shadow-navy/20 lg:-my-3 lg:py-10"
                    : "bg-white text-navy border border-border/60 hover:border-gold/40 hover:shadow-md"
                }`}
              >
                {offer.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.2em] uppercase bg-gold text-navy font-bold rounded-full px-3 py-1">
                    Most Popular
                  </span>
                )}

                <span
                  className={`font-mono text-[10px] tracking-[0.22em] uppercase mb-4 ${
                    offer.featured ? "text-gold" : "text-gold-dark"
                  }`}
                >
                  {offer.fieldLabel}
                </span>

                <h3 className="text-lg font-bold mb-1">{offer.title}</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span
                    className={`text-3xl font-bold ${
                      offer.featured ? "text-gold" : "text-navy"
                    }`}
                  >
                    {offer.price}
                  </span>
                  <span
                    className={`text-xs ${
                      offer.featured ? "text-white/60" : "text-muted-foreground"
                    }`}
                  >
                    {offer.priceNote}
                  </span>
                </div>

                <p
                  className={`text-sm leading-relaxed mb-6 ${
                    offer.featured ? "text-white/75" : "text-muted-foreground"
                  }`}
                >
                  {offer.description}
                </p>

                <ul className="space-y-2.5 mb-8">
                  {offer.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check
                        className={`h-4 w-4 mt-0.5 shrink-0 ${
                          offer.featured ? "text-gold" : "text-gold-dark"
                        }`}
                      />
                      <span
                        className={`text-sm leading-snug ${
                          offer.featured ? "text-white/85" : "text-navy/85"
                        }`}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link href={offer.ctaHref} className="mt-auto">
                  <Button
                    className={`w-full font-semibold h-11 ${
                      offer.featured
                        ? "bg-gold hover:bg-gold-dark text-navy"
                        : "bg-navy hover:bg-navy-light text-white"
                    }`}
                  >
                    {offer.ctaLabel}
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-10">
            The free filing stands alone — no purchase required, ever. Launch
            services are optional and available before or after your LLC is
            approved.
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FOUNDER — Why Hutchrok Exists
          ════════════════════════════════════════ */}
      <section className="section-padding bg-white">
        <div className="mx-auto max-w-4xl px-6 sm:px-8 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 md:gap-12 items-start">
            <div className="mx-auto md:mx-0">
              <div className="h-24 w-24 rounded-2xl bg-navy flex items-center justify-center">
                <Shield className="h-11 w-11 text-gold" />
              </div>
            </div>
            <div>
              <div className="mb-4">
                <FieldLabel>The Founder</FieldLabel>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-4 leading-tight">
                Built by a veteran who filed his own.
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4 text-sm sm:text-base">
                Hutchrok Solutions Group was founded by Alfreddie
                &ldquo;Fee&rdquo; Postell II — U.S. Army veteran, full-stack
                developer, and operator of multiple Texas companies. He built
                Hutchrok after navigating the Texas SOS and TVC process
                firsthand and realizing most veterans never learn the $300
                filing fee can be waived entirely.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6 text-sm sm:text-base">
                Every filing that comes through Hutchrok is reviewed by a
                person, not a script. That&apos;s not a marketing line —
                it&apos;s how the operation runs.
              </p>
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
        </div>
      </section>

      {/* ════════════════════════════════════════
          HOW IT WORKS — 5 Steps
          ════════════════════════════════════════ */}
      <section className="section-padding bg-cream">
        <div className="mx-auto max-w-5xl px-6 sm:px-8 lg:px-10">
          <div className="text-center mb-12 lg:mb-16">
            <div className="mb-4">
              <FieldLabel>Process</FieldLabel>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-navy mb-3 leading-tight">
              Five Steps From Veteran to LLC Owner
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
              A filing is a sequence. We run it with you, in order, every time.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              {
                step: "01",
                title: "Check Eligibility",
                desc: "Confirm the requirements: U.S. veteran, honorable discharge, new Texas LLC.",
                icon: BadgeCheck,
              },
              {
                step: "02",
                title: "Get TVC Verified",
                desc: "Obtain your Veteran Verification Letter from the Texas Veterans Commission.",
                icon: Shield,
              },
              {
                step: "03",
                title: "Complete Intake",
                desc: "Provide your LLC details — business name, registered agent, management type.",
                icon: ClipboardList,
              },
              {
                step: "04",
                title: "We Prepare Filing",
                desc: "Hutchrok prepares your Certificate of Formation and reviews every detail.",
                icon: FileText,
              },
              {
                step: "05",
                title: "Launch Your Business",
                desc: "We file with the Texas SOS. You receive your approved formation documents.",
                icon: Rocket,
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative bg-white rounded-2xl p-6 border border-border/50 text-center hover:shadow-md hover:border-gold/30 transition-all duration-300"
              >
                <span className="font-mono text-[11px] tracking-[0.2em] text-gold-dark block mb-3">
                  STEP {item.step}
                </span>
                <item.icon className="h-7 w-7 text-gold mx-auto mb-3" />
                <h3 className="text-sm font-bold text-navy mb-1.5">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/how-it-works">
              <Button
                variant="outline"
                className="border-navy/80 text-navy hover:bg-navy hover:text-white font-medium"
              >
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
      <section className="section-padding bg-white">
        <div className="mx-auto max-w-5xl px-6 sm:px-8 lg:px-10">
          <div className="text-center mb-12 lg:mb-16">
            <div className="mb-4">
              <FieldLabel>Eligibility</FieldLabel>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-navy mb-3 leading-tight">
              Who Qualifies
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
              This program is built for U.S. military veterans forming a new
              Texas LLC.
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
                className="flex items-start gap-4 p-6 rounded-2xl bg-cream/60 border border-border/40 hover:border-gold/30 hover:shadow-md transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-xl bg-gold/8 flex items-center justify-center shrink-0">
                  <item.icon className="h-6 w-6 text-gold" />
                </div>
                <div>
                  <h3 className="font-semibold text-navy mb-1 text-[15px]">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
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
          CONCIERGE — Guided Assistant
          ════════════════════════════════════════ */}
      <section className="section-padding bg-cream">
        <div className="mx-auto max-w-5xl px-6 sm:px-8 lg:px-10">
          <div className="text-center mb-8">
            <div className="mb-4">
              <FieldLabel>Guide</FieldLabel>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-navy mb-3 leading-tight">
              Not Sure Where to Start?
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
              Tell us where you are in the process and we&apos;ll point you in
              the right direction.
            </p>
          </div>
          <HutchrokConcierge />
        </div>
      </section>

      {/* ════════════════════════════════════════
          TEXAS EXPERTISE — Local Authority
          ════════════════════════════════════════ */}
      <TexasExpertiseSection />

      {/* ════════════════════════════════════════
          À LA CARTE SERVICES — Compact
          ════════════════════════════════════════ */}
      <section className="section-padding bg-white">
        <div className="mx-auto max-w-4xl px-6 sm:px-8 lg:px-10">
          <div className="text-center mb-10">
            <div className="mb-4">
              <FieldLabel>À La Carte</FieldLabel>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-3 leading-tight">
              Need Just One Piece?
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
              Every Launch Package service is available on its own.
            </p>
          </div>

          <div className="divide-y divide-border/50 border-y border-border/50">
            {PAID_SERVICES.map((service) => (
              <Link
                key={service.slug}
                href={`/service-request?service=${service.slug}`}
                className="group flex items-center justify-between gap-4 py-4 px-2 hover:bg-cream/60 transition-colors"
              >
                <div className="min-w-0">
                  <span className="font-semibold text-navy text-[15px] group-hover:text-gold-dark transition-colors">
                    {service.title}
                  </span>
                  <span className="hidden sm:inline text-sm text-muted-foreground ml-3">
                    {service.tag}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-semibold text-navy">
                    {formatStartingPrice(service.startingPrice)}
                  </span>
                  <ArrowRight className="h-4 w-4 text-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/launch-services">
              <Button
                variant="outline"
                className="border-navy/80 text-navy hover:bg-navy hover:text-white font-medium"
              >
                See All Launch Services
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
          <p className="font-mono text-[11px] tracking-[0.28em] uppercase text-gold/70 mb-5">
            Mission Ready
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 leading-tight">
            Your LLC is one filing away. The filing is free.
          </h2>
          <p className="text-white/60 mb-10 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
            Start your business without navigating the Texas system alone.
            Hutchrok manages every step from intake to filing — and stays with
            you after launch.
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

      <VeteranOwnedBadge />
    </>
  );
}
