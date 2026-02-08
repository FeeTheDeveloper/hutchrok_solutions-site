import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Shield,
  Lightbulb,
  Settings,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Explore Hutchrok Solutions Group's full range of business formation, compliance, advisory, and managed services.",
};

const services = [
  {
    icon: FileText,
    title: "Business Formation & Structuring",
    desc: "We coordinate the formation of your business entity with compliance and scalability built in from the start.",
    bullets: [
      "LLC and corporation formation support",
      "EIN application coordination",
      "Operating agreement coordination",
      "State filing and registration support",
      "Multi-entity and holding company structuring",
      "Registered agent coordination",
    ],
  },
  {
    icon: Shield,
    title: "Compliance & Operations Setup",
    desc: "From day one, your business will be set up with the systems and documentation needed to operate compliantly.",
    bullets: [
      "Compliance calendar setup and tracking",
      "Annual report and filing reminders",
      "Business license research and guidance",
      "Operational documentation templates",
      "Record-keeping frameworks",
      "Regulatory awareness briefings",
    ],
  },
  {
    icon: Lightbulb,
    title: "Strategic Advisory",
    desc: "High-level guidance for entrepreneurs who need clarity on structure, strategy, and next steps.",
    bullets: [
      "Entity structure evaluation",
      "Holding company strategy development",
      "Business expansion planning",
      "Operational efficiency assessment",
      "Risk and compliance posture review",
      "Founder transition and succession considerations",
    ],
  },
  {
    icon: Settings,
    title: "Managed Business Services",
    desc: "Ongoing operational support so you can focus on running your business while we handle the administrative back-end.",
    bullets: [
      "Ongoing filing and compliance management",
      "Annual report preparation and tracking",
      "Registered agent maintenance",
      "Document management and organization",
      "Operational process monitoring",
      "Periodic compliance reviews and updates",
    ],
  },
];

const packages = [
  {
    name: "Launch",
    focus: "Formation",
    desc: "For entrepreneurs ready to form their first entity and start right.",
    features: [
      "Entity formation (LLC or Corp)",
      "EIN coordination",
      "Operating agreement coordination",
      "State filing support",
      "Compliance checklist",
    ],
  },
  {
    name: "Compliance",
    focus: "Ops Readiness",
    desc: "For businesses that need operational structure and compliance foundations.",
    features: [
      "Everything in Launch",
      "Compliance calendar setup",
      "Business license research",
      "Record-keeping framework",
      "Operational documentation",
    ],
  },
  {
    name: "Scale",
    focus: "Holdings & Subsidiaries",
    desc: "For operators expanding into multi-entity structures and holding companies.",
    features: [
      "Everything in Compliance",
      "Multi-entity structuring",
      "Holding company setup",
      "Subsidiary formation",
      "Expansion planning support",
    ],
  },
  {
    name: "Managed",
    focus: "Ongoing Filings",
    desc: "For businesses that want hands-off management of compliance and operational tasks.",
    features: [
      "Ongoing filing management",
      "Annual report tracking",
      "Registered agent maintenance",
      "Document management",
      "Periodic compliance reviews",
    ],
  },
];

export default function ServicesPage() {
  return (
    <>
      {/* Page Header */}
      <section className="bg-gradient-navy py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="secondary" className="mb-3 text-gold bg-gold/10">
            Our Services
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Comprehensive Business Enablement
          </h1>
          <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto">
            From formation through long-term operations, we deliver the systems,
            structure, and support your business needs to thrive.
          </p>
        </div>
      </section>

      {/* Detailed Services */}
      <section className="py-16 sm:py-24 bg-white bg-grid-pattern">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {services.map((service, i) => (
              <div
                key={service.title}
                className={`flex flex-col lg:flex-row gap-8 items-start ${
                  i % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <div className="lg:w-1/2">
                  <div className="flex items-center gap-3 mb-4">
                    <service.icon className="h-8 w-8 text-gold" />
                    <h2 className="text-2xl font-bold text-navy">
                      {service.title}
                    </h2>
                  </div>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {service.desc}
                  </p>
                  <ul className="space-y-2">
                    {service.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex items-start gap-2 text-sm text-foreground"
                      >
                        <CheckCircle className="h-4 w-4 text-gold mt-0.5 shrink-0" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="lg:w-1/2 flex items-center justify-center">
                  <div className="w-full max-w-md h-48 rounded-xl bg-gradient-to-br from-navy/5 to-gold/10 border border-border/40 flex items-center justify-center">
                    <service.icon className="h-20 w-20 text-gold/30" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="py-16 sm:py-24 bg-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-3 text-gold bg-gold/10">
              Engagement Options
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy mb-4">
              Choose Your Starting Point
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Each package is designed around a specific stage of business growth.
              Pricing details available during intake.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {packages.map((pkg) => (
              <Card
                key={pkg.name}
                className="border border-border/60 hover:border-gold/40 hover:shadow-lg transition-all duration-300"
              >
                <CardHeader>
                  <Badge
                    variant="outline"
                    className="w-fit mb-2 text-gold border-gold/40"
                  >
                    {pkg.focus}
                  </Badge>
                  <CardTitle className="text-xl text-navy">{pkg.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{pkg.desc}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {pkg.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-sm"
                      >
                        <CheckCircle className="h-4 w-4 text-gold mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/contact">
              <Button className="bg-gold hover:bg-gold-dark text-navy font-bold px-8">
                Start Intake
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
