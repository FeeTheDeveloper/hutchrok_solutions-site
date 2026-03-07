import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { HutchrokConcierge } from "@/components/concierge/hutchrok-concierge";
import {
  SocialProofStrip,
  ProcessTransparencyBanner,
} from "@/components/authority-signals";
import {
  Shield,
  CheckCircle,
  FileText,
  ArrowRight,
  Star,
  Building2,
  UserCheck,
  ClipboardList,
  AlertCircle,
} from "lucide-react";

export const metadata = {
  title: "Free Texas LLC Filing for Veterans",
  description:
    "Qualified U.S. military veterans can file a Texas LLC at no cost. Hutchrok handles your Certificate of Formation with the Texas Secretary of State — free.",
};

export default function FreeFilingPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-gradient-navy py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-6 sm:px-8 lg:px-10 text-center">
          <Badge
            variant="secondary"
            className="mb-4 text-gold bg-gold/10 text-xs tracking-wider uppercase"
          >
            $0 Filing for Veterans
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            Start Your Texas LLC — Free
          </h1>
          <p className="text-white/65 max-w-2xl mx-auto text-sm sm:text-base lg:text-lg leading-relaxed mb-4">
            If you&apos;re a U.S. military veteran with a Texas Veterans Commission
            Verification Letter, Hutchrok will file your LLC at no cost.
          </p>
          <p className="text-xs sm:text-sm text-gold/70 mb-8 font-medium tracking-wide">
            No SOS account needed · Operator-reviewed filings · No hidden fees
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/contact">
              <Button
                size="lg"
                className="bg-gold hover:bg-gold-dark text-navy font-bold text-base px-10 h-12 shadow-lg shadow-gold/10"
              >
                Start My Filing
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/eligibility">
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 font-medium text-base px-8 h-12"
              >
                Check My Eligibility
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Who Qualifies ── */}
      <section id="eligibility" className="section-padding bg-white">
        <div className="mx-auto max-w-5xl px-6 sm:px-8 lg:px-10">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-3">
              Who Qualifies
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
              This is a focused program. Texas only. LLCs only. Veterans only.
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
                desc: "You must obtain a Veteran Verification Letter (VVL) from the Texas Veterans Commission — or already have one on file.",
              },
              {
                icon: Building2,
                title: "Texas LLC Formation",
                desc: "This program covers new Texas Limited Liability Companies — single-member or multi-member.",
              },
              {
                icon: CheckCircle,
                title: "One Free Filing Per Veteran",
                desc: "Each qualified veteran receives one free LLC formation through this program.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-4 p-6 rounded-2xl bg-cream/50 border border-border/40 hover:border-gold/30 hover:shadow-md transition-all duration-300"
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
        </div>
      </section>

      {/* ── Social Proof ── */}
      <SocialProofStrip />

      {/* ── What Hutchrok Does vs What You Do ── */}
      <section className="section-padding bg-cream">
        <div className="mx-auto max-w-5xl px-6 sm:px-8 lg:px-10">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-3">
              What&apos;s Involved
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
              We handle the heavy lifting — but we need a few things from you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* What Hutchrok Does */}
            <Card className="border border-gold/30 bg-white">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-lg bg-gold/10 flex items-center justify-center">
                    <ClipboardList className="h-5 w-5 text-gold" />
                  </div>
                  <h3 className="text-lg font-bold text-navy">
                    What Hutchrok Handles
                  </h3>
                </div>
                <ul className="space-y-3">
                  {[
                    "Guide you through the intake process",
                    "Explain TVC verification requirements",
                    "Prepare your Certificate of Formation (Form 205)",
                    "Review all details before submission",
                    "Submit your filing to the Texas Secretary of State",
                    "Deliver your approved formation documents",
                    "Keep you updated on filing status",
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

            {/* What You Need To Do */}
            <Card className="border border-border/50 bg-white">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-lg bg-navy/10 flex items-center justify-center">
                    <UserCheck className="h-5 w-5 text-navy" />
                  </div>
                  <h3 className="text-lg font-bold text-navy">
                    What You Need to Do
                  </h3>
                </div>
                <ul className="space-y-3">
                  {[
                    "Obtain your Veteran Verification Letter from TVC (we can help)",
                    "Choose your LLC name (we'll check availability)",
                    "Decide on management structure (member-managed or manager-managed)",
                    "Designate a registered agent (Texas address required)",
                    "Provide accurate personal information for the filing",
                    "Respond to any follow-up questions from our team",
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-sm text-navy"
                    >
                      <FileText className="h-4 w-4 text-navy/50 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Important Notes ── */}
      <section className="section-padding bg-white">
        <div className="mx-auto max-w-3xl px-6 sm:px-8 lg:px-10">
          <div className="bg-cream rounded-2xl border border-border/40 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-5">
              <AlertCircle className="h-5 w-5 text-gold" />
              <h3 className="font-semibold text-navy">Important Notes</h3>
            </div>
            <ul className="space-y-3">
              {[
                "This program covers the Texas SOS filing fee ($300) which is waived through TVC verification — and Hutchrok's preparation service at no charge.",
                "EIN application, operating agreements, registered agent service, and compliance setup are not included but are available as paid add-on services.",
                "All filings are reviewed and submitted by our operations team. We do not auto-submit to the Texas SOS.",
                "Filing timelines depend on the Texas Secretary of State's processing schedule.",
              ].map((note, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-sm text-muted-foreground"
                >
                  <span className="text-gold font-bold mt-px">•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Process Transparency ── */}
      <ProcessTransparencyBanner />

      {/* ── Trust Indicators ── */}
      <section className="bg-white border-t border-border/30 py-10 sm:py-12">
        <div className="mx-auto max-w-5xl px-6 sm:px-8 lg:px-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {[
              { icon: Shield, label: "Veteran-Focused", sub: "Built for those who served" },
              { icon: CheckCircle, label: "Operator-Reviewed", sub: "No automated submissions" },
              { icon: Building2, label: "Texas-Specific", sub: "SOS filing expertise" },
              { icon: Star, label: "No SOS Account Needed", sub: "We handle the portal" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-gold/10 flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-gold" />
                </div>
                <p className="text-sm font-semibold text-navy">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="bg-gradient-navy py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-6 sm:px-8 lg:px-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 leading-tight">
            Don&apos;t Navigate the Texas Filing System Alone
          </h2>
          <p className="text-white/60 mb-8 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
            Hutchrok manages every step from intake to SOS submission — at no cost to qualified veterans.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <Link href="/contact">
              <Button
                size="lg"
                className="bg-gold hover:bg-gold-dark text-navy font-bold text-base px-10 h-12 shadow-lg shadow-gold/10"
              >
                Start My Filing
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/verification-help">
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 font-medium text-base px-8 h-12"
              >
                I Need Verification Help
              </Button>
            </Link>
          </div>
          <HutchrokConcierge />
        </div>
      </section>

      {/* Disclaimer */}
      <section className="bg-white border-t border-border/30 py-8">
        <div className="mx-auto max-w-3xl px-6 sm:px-8 lg:px-10">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            Hutchrok Solutions Group is not a law firm and does not provide legal
            advice. We prepare and submit formation documents on your behalf
            based on information you provide. Filing timelines depend on the
            Texas Secretary of State&apos;s processing schedule. This is not an
            automated filing service — all submissions are reviewed and managed
            by our operations team.
          </p>
        </div>
      </section>
    </>
  );
}
