import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, MapPin, Phone, Calendar } from "lucide-react";
import IntakeForm from "@/components/intake-form";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Hutchrok Solutions Group. Start your intake to begin your business formation and compliance journey.",
};

export default function ContactPage() {
  return (
    <>
      {/* Page Header */}
      <section className="bg-gradient-navy py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="secondary" className="mb-3 text-gold bg-gold/10">
            Contact
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Start Your Intake
          </h1>
          <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto">
            Tell us about your business and goals. We&apos;ll review your
            submission and reach out with a tailored plan.
          </p>
        </div>
      </section>

      {/* Form + Contact Info */}
      <section className="py-16 sm:py-24 bg-white bg-grid-pattern">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-border/60 p-6 sm:p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-navy mb-6">
                  Intake Form
                </h2>
                <IntakeForm />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="bg-cream rounded-xl border border-border/40 p-6">
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
                  <a href="#" rel="noopener noreferrer">
                    Book a Call
                  </a>
                </Button>
              </div>

              {/* Response Time */}
              <div className="bg-cream rounded-xl border border-border/40 p-6">
                <h3 className="font-semibold text-navy mb-2">
                  What to Expect
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• We review all submissions within 24–48 hours</li>
                  <li>
                    • You&apos;ll receive a tailored response based on your needs
                  </li>
                  <li>• All conversations are confidential</li>
                  <li>• No obligation — intake is complimentary</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
