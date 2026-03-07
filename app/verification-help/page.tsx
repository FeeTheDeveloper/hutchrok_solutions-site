import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { HutchrokConcierge } from "@/components/concierge/hutchrok-concierge";
import {
  Shield,
  CheckCircle,
  FileText,
  ArrowRight,
  ExternalLink,
  HelpCircle,
  Phone,
  BadgeCheck,
  ClipboardList,
  Users,
} from "lucide-react";

export const metadata = {
  title: "Veteran Verification Letter Help",
  description:
    "Need a Veteran Verification Letter (VVL) from the Texas Veterans Commission? Hutchrok guides you through the process — and can start your filing in parallel.",
};

export default function VerificationHelpPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-gradient-navy py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-6 sm:px-8 lg:px-10 text-center">
          <Badge
            variant="secondary"
            className="mb-4 text-gold bg-gold/10 text-xs tracking-wider uppercase"
          >
            Veteran Support
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            Veteran Verification Letter
          </h1>
          <p className="text-white/65 max-w-2xl mx-auto text-sm sm:text-base lg:text-lg leading-relaxed">
            The Veteran Verification Letter (VVL) from the Texas Veterans
            Commission is what waives your $300 state filing fee. Here&apos;s
            everything you need to know.
          </p>
        </div>
      </section>

      {/* ── What Is the VVL ── */}
      <section className="section-padding bg-white">
        <div className="mx-auto max-w-4xl px-6 sm:px-8 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-4">
                What Is the VVL?
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-4">
                Under Texas Business Organizations Code §3.005(b), veterans can
                waive the state filing fee when forming a business entity. The
                Veteran Verification Letter (VVL) is the document from the Texas
                Veterans Commission that confirms your eligibility.
              </p>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-4">
                TVC sends this letter directly to the Texas Secretary of State.
                Once on file, your Certificate of Formation is processed at $0.
              </p>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed font-medium text-navy">
                Without the VVL, the standard filing fee is $300.
              </p>
            </div>
            <div className="bg-cream rounded-2xl border border-border/40 p-6">
              <h3 className="font-semibold text-navy mb-4 flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-gold" />
                Key Facts
              </h3>
              <ul className="space-y-3">
                {[
                  "The VVL is free — there's no cost to request one.",
                  "It waives the $300 Texas SOS filing fee entirely.",
                  "TVC sends it directly to the Secretary of State.",
                  "You need your DD-214 or equivalent discharge documentation.",
                  "Processing time varies — start early.",
                  "One letter covers one filing.",
                ].map((fact, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-navy">
                    <CheckCircle className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why It's Required ── */}
      <section className="bg-cream border-y border-border/30 py-10 sm:py-12">
        <div className="mx-auto max-w-3xl px-6 sm:px-8 lg:px-10 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-navy mb-3">
            Why Is the VVL Required?
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            The Texas Secretary of State requires third-party verification of
            veteran status before waiving the filing fee. Hutchrok cannot waive
            the fee directly — only TVC can authorize it. The VVL is the
            official mechanism that makes your free filing possible.
          </p>
        </div>
      </section>

      {/* ── What Hutchrok Can Do Before & After ── */}
      <section className="section-padding bg-white">
        <div className="mx-auto max-w-5xl px-6 sm:px-8 lg:px-10">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-3">
              What Hutchrok Does at Each Stage
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Before VVL */}
            <Card className="border border-border/50 bg-cream/30">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-lg bg-gold/10 flex items-center justify-center">
                    <ClipboardList className="h-5 w-5 text-gold" />
                  </div>
                  <h3 className="text-lg font-bold text-navy">
                    Before You Have Your VVL
                  </h3>
                </div>
                <ul className="space-y-3">
                  {[
                    "Explain what TVC needs and how to request your letter",
                    "Walk you through the DD-214 documentation requirements",
                    "Help you understand the timeline and next steps",
                    "Begin collecting your LLC formation details in parallel",
                    "Start preparing your Certificate of Formation draft",
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-sm text-navy"
                    >
                      <CheckCircle className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* After VVL */}
            <Card className="border border-gold/30 bg-white">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-lg bg-gold/10 flex items-center justify-center">
                    <BadgeCheck className="h-5 w-5 text-gold" />
                  </div>
                  <h3 className="text-lg font-bold text-navy">
                    After Your VVL Is on File
                  </h3>
                </div>
                <ul className="space-y-3">
                  {[
                    "Confirm the SOS has your VVL on record",
                    "Finalize your Certificate of Formation",
                    "Submit your filing to the Texas Secretary of State",
                    "Monitor processing and provide status updates",
                    "Deliver your approved formation documents",
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-sm text-navy"
                    >
                      <CheckCircle className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Two CTA Cards ── */}
      <section className="section-padding bg-cream">
        <div className="mx-auto max-w-4xl px-6 sm:px-8 lg:px-10">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-3">
              Next Steps
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
              Whether you need help getting verified or you&apos;re ready to
              connect with TVC directly, we&apos;ve got you covered.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Card 1: Review VVL Requirements */}
            <Card className="border border-border/50 bg-white hover:border-gold/40 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 sm:p-8 flex flex-col items-center text-center">
                <div className="h-14 w-14 rounded-2xl bg-gold/10 flex items-center justify-center mb-5">
                  <FileText className="h-7 w-7 text-gold" />
                </div>
                <h3 className="text-lg font-bold text-navy mb-2">
                  Review VVL Requirements
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  See what documents you need, how to request the letter, and
                  what to expect from the TVC process.
                </p>
                <a
                  href="https://www.tvc.texas.gov"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <Button
                    variant="outline"
                    className="border-navy/80 text-navy hover:bg-navy hover:text-white font-medium"
                  >
                    Visit TVC Website
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              </CardContent>
            </Card>

            {/* Card 2: Connect with TVC Consultant */}
            <Card className="border border-border/50 bg-white hover:border-gold/40 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 sm:p-8 flex flex-col items-center text-center">
                <div className="h-14 w-14 rounded-2xl bg-gold/10 flex items-center justify-center mb-5">
                  <Users className="h-7 w-7 text-gold" />
                </div>
                <h3 className="text-lg font-bold text-navy mb-2">
                  Connect with a TVC Business Consultant
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  TVC has business consultants who specialize in helping veterans
                  navigate the verification and fee waiver process.
                </p>
                <a
                  href="https://www.tvc.texas.gov"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <Button
                    variant="outline"
                    className="border-navy/80 text-navy hover:bg-navy hover:text-white font-medium"
                  >
                    Find Your Regional Office
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── TVC Contact Block ── */}
      <section className="section-padding bg-white">
        <div className="mx-auto max-w-3xl px-6 sm:px-8 lg:px-10">
          <div className="bg-cream rounded-2xl border border-border/40 p-8 text-center">
            <h3 className="font-semibold text-navy text-lg mb-4">
              Texas Veterans Commission
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <span className="font-medium text-navy">Phone:</span>{" "}
                (512) 463-6564
              </p>
              <p>
                <span className="font-medium text-navy">Website:</span>{" "}
                <a
                  href="https://www.tvc.texas.gov"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold hover:underline inline-flex items-center gap-1"
                >
                  tvc.texas.gov
                  <ExternalLink className="h-3 w-3" />
                </a>
              </p>
              <p>
                <span className="font-medium text-navy">Address:</span>{" "}
                1700 N Congress Ave, Suite 800, Austin, TX 78701
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="bg-gradient-navy py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-6 sm:px-8 lg:px-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 leading-tight">
            Where Are You in the Process?
          </h2>
          <p className="text-white/60 mb-8 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
            Let us guide you to the right next step.
          </p>
          <HutchrokConcierge />
        </div>
      </section>

      {/* Disclaimer */}
      <section className="bg-white border-t border-border/30 py-8">
        <div className="mx-auto max-w-3xl px-6 sm:px-8 lg:px-10">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            Hutchrok Solutions Group is not affiliated with the Texas Veterans
            Commission or the Texas Secretary of State. We provide guidance
            based on publicly available information. TVC processes and
            requirements may change — always verify directly with TVC. We do not
            guarantee approval of your verification request.
          </p>
        </div>
      </section>
    </>
  );
}
