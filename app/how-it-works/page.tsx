import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BadgeCheck,
  Shield,
  ClipboardList,
  FileText,
  Rocket,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { TrustBadgeStrip } from "@/components/authority-signals";

export const metadata = {
  title: "How It Works",
  description:
    "Five steps from veteran to Texas LLC owner. Hutchrok guides you through eligibility, TVC verification, intake, filing preparation, and launch.",
};

const steps = [
  {
    step: 1,
    icon: BadgeCheck,
    title: "Check Eligibility",
    summary: "Confirm you meet the basic requirements for a free filing.",
    details: [
      "You must be a U.S. military veteran with an honorable discharge.",
      "This program covers new Texas LLC formations only.",
      "One free filing per qualified veteran.",
      "You'll need your DD-214 or equivalent discharge documentation.",
    ],
    cta: { label: "See Eligibility Details", href: "/free-filing#eligibility" },
  },
  {
    step: 2,
    icon: Shield,
    title: "Get TVC Verified",
    summary:
      "Obtain your Veteran Verification Letter from the Texas Veterans Commission.",
    details: [
      "Contact TVC to request a Veteran Verification Letter (VVL).",
      "Provide your DD-214 and any supporting documentation TVC requests.",
      "TVC sends the letter directly to the Texas Secretary of State.",
      "Hutchrok can guide you through this process and start your filing prep in parallel.",
    ],
    cta: { label: "Get Verification Help", href: "/verification-help" },
  },
  {
    step: 3,
    icon: ClipboardList,
    title: "Complete Intake",
    summary:
      "Provide the details we need to prepare your LLC formation filing.",
    details: [
      "Submit your intake through our form with your business details.",
      "Choose your LLC name — we'll confirm availability with the SOS.",
      "Select your management structure (member-managed or manager-managed).",
      "Designate a registered agent with a Texas address.",
      "Provide any other details needed for the Certificate of Formation.",
    ],
    cta: { label: "Start Intake", href: "/contact" },
  },
  {
    step: 4,
    icon: FileText,
    title: "Hutchrok Prepares Filing",
    summary:
      "Our operations team prepares your Certificate of Formation for submission.",
    details: [
      "We draft your Certificate of Formation (Texas Form 205).",
      "Every detail is reviewed by our operations team before submission.",
      "We confirm your VVL is on file with the Secretary of State.",
      "You review and approve the final filing before we submit.",
      "No automated submissions — a real person manages every filing.",
    ],
    cta: null,
  },
  {
    step: 5,
    icon: Rocket,
    title: "Launch Your Business",
    summary:
      "Your LLC is filed with the Texas SOS. You receive your approved documents.",
    details: [
      "We submit your Certificate of Formation to the Texas Secretary of State.",
      "Processing time depends on the SOS — we keep you updated on status.",
      "Once approved, you receive your official formation documents.",
      "Your LLC is officially formed — you're in business.",
      "Optional post-filing services available: website, branding, compliance setup.",
    ],
    cta: { label: "View Post-Filing Services", href: "/services" },
  },
];

export default function HowItWorksPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-gradient-navy py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-6 sm:px-8 lg:px-10 text-center">
          <Badge
            variant="secondary"
            className="mb-4 text-gold bg-gold/10 text-xs tracking-wider uppercase"
          >
            Process
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            How It Works
          </h1>
          <p className="text-white/65 max-w-2xl mx-auto text-sm sm:text-base lg:text-lg leading-relaxed">
            Five steps from veteran to LLC owner. Hutchrok manages the
            paperwork — you focus on your business.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="section-padding bg-white">
        <div className="mx-auto max-w-4xl px-6 sm:px-8 lg:px-10">
          <div className="space-y-10">
            {steps.map((item, idx) => (
              <div
                key={item.step}
                className="relative flex gap-6 sm:gap-8"
              >
                {/* Vertical line connector */}
                {idx < steps.length - 1 && (
                  <div className="absolute left-6 top-14 bottom-0 w-px bg-border/60 hidden sm:block" />
                )}

                {/* Number circle */}
                <div className="shrink-0">
                  <div className="h-12 w-12 rounded-full bg-navy flex items-center justify-center shadow-sm relative z-10">
                    <span className="text-lg font-bold text-gold">
                      {item.step}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 pb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <item.icon className="h-5 w-5 text-gold" />
                    <h2 className="text-xl sm:text-2xl font-bold text-navy">
                      {item.title}
                    </h2>
                  </div>
                  <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-4">
                    {item.summary}
                  </p>
                  <div className="bg-cream/60 rounded-xl border border-border/40 p-5">
                    <ul className="space-y-2.5">
                      {item.details.map((detail, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2.5 text-sm text-navy"
                        >
                          <CheckCircle className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {item.cta && (
                    <div className="mt-4">
                      <Link href={item.cta.href}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gold/40 text-gold hover:bg-gold/10 font-medium text-sm"
                        >
                          {item.cta.label}
                          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <TrustBadgeStrip />

      {/* CTA */}
      <section className="bg-gradient-navy py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-6 sm:px-8 lg:px-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 leading-tight">
            Ready to Begin?
          </h2>
          <p className="text-white/60 mb-8 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
            Start with eligibility, or jump straight to intake if you already
            have your TVC Verification Letter.
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
