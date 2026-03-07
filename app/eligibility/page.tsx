import { Badge } from "@/components/ui/badge";
import EligibilityQuiz from "@/components/eligibility-quiz";
import { Shield, CheckCircle, FileText, Users } from "lucide-react";
import { ProcessTransparencyBanner } from "@/components/authority-signals";

export const metadata = {
  title: "Check Your Eligibility — Free Texas LLC Filing for Veterans",
  description:
    "Answer a few quick questions to see if you qualify for Hutchrok's free veteran LLC filing program in Texas.",
};

export default function EligibilityPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-gradient-navy py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-6 sm:px-8 lg:px-10 text-center">
          <Badge
            variant="secondary"
            className="mb-4 text-gold bg-gold/10 text-xs tracking-wider uppercase"
          >
            Eligibility Check
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            See If You Qualify
          </h1>
          <p className="text-white/65 max-w-2xl mx-auto text-sm sm:text-base lg:text-lg leading-relaxed">
            Five quick questions to determine whether you&apos;re eligible for
            Hutchrok&apos;s free Texas LLC filing program for veterans.
          </p>
        </div>
      </section>

      {/* Quiz */}
      <section className="section-padding bg-cream">
        <div className="mx-auto max-w-5xl px-6 sm:px-8 lg:px-10">
          <EligibilityQuiz />
        </div>
      </section>

      {/* Trust band */}
      <section className="bg-white border-t border-border/30 py-10 sm:py-12">
        <div className="mx-auto max-w-4xl px-6 sm:px-8 lg:px-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center mb-10">
            {[
              { icon: Shield, text: "Veteran-Focused" },
              { icon: CheckCircle, text: "Operator-Reviewed" },
              { icon: FileText, text: "No SOS Account Needed" },
              { icon: Users, text: "Texas-Specific" },
            ].map((item) => (
              <div key={item.text} className="flex flex-col items-center gap-1.5">
                <item.icon className="h-5 w-5 text-gold" />
                <span className="text-xs font-semibold text-navy">{item.text}</span>
              </div>
            ))}
          </div>
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
              <Shield className="h-5 w-5 text-gold" />
            </div>
            <div>
              <h3 className="font-semibold text-navy mb-1 text-[15px]">
                Your answers are saved locally
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your quiz responses are stored on your device only — nothing is
                sent to a server. You can come back and pick up where you left
                off, or restart at any time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Transparency */}
      <ProcessTransparencyBanner />

      {/* Disclaimer */}
      <section className="bg-white border-t border-border/30 py-8">
        <div className="mx-auto max-w-3xl px-6 sm:px-8 lg:px-10">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            This eligibility check is informational only and does not constitute
            a guarantee of qualification. Final eligibility is determined by the
            Texas Veterans Commission&apos;s verification process and current
            program requirements. Hutchrok Solutions Group is not a law firm and
            does not provide legal advice.
          </p>
        </div>
      </section>
    </>
  );
}
