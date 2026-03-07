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

export const metadata: Metadata = {
  title: "Launch Services — Build Your Business After Filing",
  description:
    "Your LLC is filed — now launch it properly. Hutchrok offers websites, branding, logo design, email, hosting, and compliance setup for veteran-owned businesses.",
};

const launchServices = [
  {
    icon: Globe,
    title: "Business Website",
    desc: "A professional, mobile-ready website built for your new LLC — designed to convert visitors into customers.",
    tag: "Web Development",
    features: [
      "Custom responsive design",
      "Mobile-first build",
      "SEO-ready structure",
      "Contact forms and lead capture",
      "Hosting setup included",
    ],
  },
  {
    icon: Palette,
    title: "Brand Identity Package",
    desc: "Complete visual identity including color palette, typography, and brand guidelines for a cohesive look.",
    tag: "Branding",
    features: [
      "Color palette and typography system",
      "Brand guidelines document",
      "Business card design",
      "Social media templates",
      "Brand asset library",
    ],
  },
  {
    icon: PenTool,
    title: "Logo Design",
    desc: "A custom logo that represents your business and makes a strong first impression across all materials.",
    tag: "Design",
    features: [
      "Custom logo concepts",
      "Multiple revision rounds",
      "All file formats (SVG, PNG, PDF)",
      "Light and dark variations",
      "Brand mark + wordmark",
    ],
  },
  {
    icon: Mail,
    title: "Business Email Setup",
    desc: "Professional email (you@yourbusiness.com) configured and ready to use from day one.",
    tag: "Email",
    features: [
      "Custom domain email",
      "Google Workspace or Microsoft 365",
      "Email signature design",
      "SPF/DKIM/DMARC configuration",
      "Migration assistance",
    ],
  },
  {
    icon: Server,
    title: "Domain + Hosting",
    desc: "Domain registration and reliable hosting setup so your business is live and accessible online.",
    tag: "Infrastructure",
    features: [
      "Domain name registration",
      "SSL certificate setup",
      "Reliable cloud hosting",
      "DNS configuration",
      "Performance monitoring",
    ],
  },
  {
    icon: FileText,
    title: "Compliance & Ops Setup",
    desc: "EIN coordination, operating agreements, registered agent support, and compliance calendar setup.",
    tag: "Operations",
    features: [
      "EIN application coordination",
      "Operating agreement drafting assistance",
      "Registered agent service",
      "Compliance calendar",
      "Annual report tracking",
    ],
  },
];

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
            Launch Your Business the Right Way
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
            {launchServices.map((service) => (
              <Card
                key={service.title}
                className="border border-border/50 bg-cream/50 hover:border-gold/40 hover:shadow-lg transition-all duration-300 group flex flex-col"
              >
                <CardContent className="p-6 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-11 w-11 rounded-lg bg-gold/8 flex items-center justify-center group-hover:bg-gold/15 transition-colors">
                      <service.icon className="h-5 w-5 text-gold" />
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
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {service.desc}
                  </p>
                  <ul className="space-y-1.5 mt-auto">
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
                </CardContent>
              </Card>
            ))}
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
                desc: "Pick the launch services that fit your business needs.",
                icon: Rocket,
              },
              {
                step: 3,
                title: "We Build & Deliver",
                desc: "Our team handles setup and delivers everything ready to go.",
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
            Start with your free LLC filing, then let us help you build
            everything else.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/contact">
              <Button
                size="lg"
                className="bg-gold hover:bg-gold-dark text-navy font-bold text-base px-10 h-12 shadow-lg shadow-gold/10"
              >
                Get Started
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

      {/* Disclaimer */}
      <section className="bg-white border-t border-border/30 py-8">
        <div className="mx-auto max-w-3xl px-6 sm:px-8 lg:px-10">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            Launch services are optional paid services available after your LLC
            formation is complete. Pricing varies by service. Your veteran free
            filing has no obligations or requirements to purchase additional
            services.
          </p>
        </div>
      </section>
    </>
  );
}
