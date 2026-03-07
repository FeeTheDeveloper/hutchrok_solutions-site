import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, MapPin, Phone, Calendar, Shield, CheckCircle } from "lucide-react";
import VeteranIntakeForm from "@/components/veteran-intake-form";

export const metadata: Metadata = {
  title: "Start Your Free Filing — Veteran LLC Intake",
  description:
    "Complete your intake to begin your free Texas LLC filing. Hutchrok handles verification guidance, formation prep, and operator-managed filing.",
};

export default function ContactPage() {
  return (
    <>
      {/* Page Header */}
      <section className="bg-gradient-navy py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="secondary" className="mb-3 text-gold bg-gold/10">
            Veteran Filing Intake
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Start Your Free Filing
          </h1>
          <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto">
            Complete your intake below. A Hutchrok operator will review
            your case and guide you through the next steps.
          </p>
        </div>
      </section>

      {/* Form + Sidebar */}
      <section className="py-16 sm:py-24 bg-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Form */}
            <div className="lg:col-span-2">
              <VeteranIntakeForm />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* What to expect */}
              <div className="bg-white rounded-xl border border-border/40 p-6">
                <h3 className="font-semibold text-navy mb-3">
                  What to Expect
                </h3>
                <ul className="space-y-2.5 text-sm text-muted-foreground">
                  {[
                    "We review all submissions within 24–48 hours",
                    "A Hutchrok operator manages your case from start to finish",
                    "No filing is automated — every submission is operator-reviewed",
                    "All conversations are confidential",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Eligibility reminder */}
              <div className="bg-white rounded-xl border border-gold/20 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-5 w-5 text-gold" />
                  <h3 className="font-semibold text-navy">Not sure if you qualify?</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Take our quick eligibility check before starting intake.
                </p>
                <Button
                  variant="outline"
                  className="w-full border-gold/40 text-navy hover:bg-gold/5"
                  asChild
                >
                  <a href="/eligibility">Check Eligibility</a>
                </Button>
              </div>

              {/* Contact Info */}
              <div className="bg-white rounded-xl border border-border/40 p-6">
                <h3 className="font-semibold text-navy mb-4">
                  Contact Information
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 text-sm">
                    <Mail className="h-5 w-5 text-gold mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-navy">Email</p>
                      <p className="text-muted-foreground">
                        contact@hutchrok.com
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <MapPin className="h-5 w-5 text-gold mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-navy">Location</p>
                      <p className="text-muted-foreground">Dallas, TX</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Book a Call */}
              <div className="bg-navy rounded-xl p-6 text-center">
                <Calendar className="h-10 w-10 text-gold mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">
                  Prefer to Talk?
                </h3>
                <p className="text-sm text-white/70 mb-4">
                  Schedule a consultation to discuss your needs directly.
                </p>
                <Button
                  variant="outline"
                  className="border-gold/50 text-gold hover:bg-gold/10 w-full"
                  asChild
                >
                  <a href="mailto:contact@hutchrok.com?subject=Consultation%20Request">
                    Contact Us to Schedule
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
