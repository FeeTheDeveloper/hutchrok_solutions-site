import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  Palette,
  PenTool,
  Mail,
  Server,
  FileText,
  ArrowRight,
  CheckCircle,
  Rocket,
} from "lucide-react";
import { formatStartingPrice, PAID_SERVICES } from "@/lib/paid-services";

export const metadata: Metadata = {
  title: "Launch Services — Build Your Business After Filing",
  description:
    "Your LLC is filed — now launch it properly. Hutchrok offers websites, branding, logo design, email, hosting, and compliance setup for veteran-owned businesses.",
};

const serviceIcons = {
  "business-website": Globe,
  "brand-identity-package": Palette,
  "logo-design": PenTool,
  "business-email-setup": Mail,
  "domain-hosting": Server,
  "compliance-ops-setup": FileText,
} as const;

export default function LaunchServicesPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-gradient-navy py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-6 sm:px-8 lg:px-10 text-center">
          <Badge
            variant="secondary"
            className="mb-3 text-gold bg-gold/10 text-xs tracking-wider uppercase"
          >
            After Your Filing
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            Optional Paid Services After Your LLC
          </h1>
          <p className="text-white/60 max-w-2xl mx-auto text-sm sm:text-base lg:text-lg leading-relaxed">
            Your free LLC filing is just the beginning. Build a professional
            presence with services designed specifically for new veteran-owned
            businesses.
          </p>
        </div>
      </section>

      {/* Services grid */}
      <section className="section-padding bg-white">
        <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PAID_SERVICES.map((service) => {
              const Icon = serviceIcons[service.slug];
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
                      <Badge
                        variant="outline"
                        className="text-[10px] tracking-wider uppercase text-gold/80 border-gold/25 font-medium"
                      >
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
                    <ul className="space-y-1.5 mb-5">
                      {service.features.map((f, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-xs text-navy"
                        >
                          <CheckCircle className="h-3.5 w-3.5 text-gold shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="space-y-2 mt-auto">
                      <Link href={`/service-request?service=${service.slug}`}>
                        <Button className="w-full bg-gold hover:bg-gold-dark text-navy font-semibold h-10">
                          {service.primaryCtaLabel}
                        </Button>
                      </Link>
                      {service.secondaryCtaLabel && service.secondaryCtaHref && (
                        <Link href={service.secondaryCtaHref}>
                          <Button
                            variant="outline"
                            className="w-full border-navy/20 text-navy hover:bg-cream h-10"
                          >
                            {service.secondaryCtaLabel}
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-8">
            These are optional paid services available after your LLC is filed.
            Your free filing comes with zero obligations.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="section-padding bg-cream">
        <div className="mx-auto max-w-4xl px-6 sm:px-8 lg:px-10">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-3">
              How Launch Services Work
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
              Simple, transparent, and built around your timeline.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                step: 1,
                title: "File Your LLC",
                desc: "Complete your free veteran filing through Hutchrok first.",
                icon: FileText,
              },
              {
                step: 2,
                title: "Choose Services",
                desc: "Select paid services and submit your checkout-ready intake.",
                icon: Rocket,
              },
              {
                step: 3,
                title: "Operator Follow-Up",
                desc: "We confirm scope, timeline, and next steps before kickoff.",
                icon: CheckCircle,
              },
            ].map((item) => (
              <div
                key={item.step}
                className="text-center bg-white rounded-2xl p-6 border border-border/50"
              >
                <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-navy flex items-center justify-center">
                  <span className="text-base font-bold text-gold">
                    {item.step}
                  </span>
                </div>
                <item.icon className="h-7 w-7 text-gold/60 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-navy mb-1.5">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-navy py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-6 sm:px-8 lg:px-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 leading-tight">
            Ready to Launch Your Business?
          </h2>
          <p className="text-white/60 mb-8 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
            Start with your free LLC filing, then use paid services only when
            you&apos;re ready.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/service-request">
              <Button
                size="lg"
                className="bg-gold hover:bg-gold-dark text-navy font-bold text-base px-10 h-12 shadow-lg shadow-gold/10"
              >
                Request a Paid Service
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/free-filing">
              <Button
                size="lg"
                variant="outline"
                className="border-gold/40 text-gold hover:bg-gold/10 font-semibold text-base px-8 h-12"
              >
                I Need to File My LLC First
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
