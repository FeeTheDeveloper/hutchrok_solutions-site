import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  BookOpen,
  Shield,
  Building2,
  Award,
  FileCheck,
  ScrollText,
  DollarSign,
  Compass,
  Briefcase,
  Library,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Veteran Business Guides — Free Resources for Starting a Business in Texas",
  description:
    "Free guides for veteran entrepreneurs. Learn how to start a Texas LLC, get veteran-owned business certification, access veteran business benefits, and file your LLC for free.",
  keywords: [
    "veteran business guides",
    "start a business in Texas as a veteran",
    "Texas LLC guide",
    "veteran business certification",
    "Texas veteran business benefits",
    "Texas veteran LLC filing fee waiver",
    "veteran verification letter Texas",
    "Texas business grants for veterans",
    "veteran entrepreneur guide",
    "best businesses for veterans",
    "veteran small business resources Texas",
  ],
  openGraph: {
    title: "Veteran Business Guides | Hutchrok Solutions Group",
    description:
      "Free guides and resources for veterans starting a business in Texas.",
    type: "website",
    locale: "en_US",
  },
};

const guides = [
  {
    href: "/guides/start-a-business-in-texas-as-a-veteran",
    title: "How to Start a Business in Texas as a Veteran",
    description:
      "Complete step-by-step guide covering everything from choosing your business structure to filing your Certificate of Formation — including the free veteran filing fee waiver.",
    icon: Shield,
    readingTime: "8 min read",
  },
  {
    href: "/guides/how-to-start-an-llc-in-texas",
    title: "How to Start an LLC in Texas",
    description:
      "Detailed guide to forming a Texas LLC. Covers naming, registered agents, Form 205, EIN, operating agreements, and ongoing compliance requirements.",
    icon: Building2,
    readingTime: "9 min read",
  },
  {
    href: "/guides/texas-veteran-owned-business-certification",
    title: "Texas Veteran-Owned Business Certification",
    description:
      "How to get your business certified as veteran-owned. Covers Texas HUB certification, federal VOSB/SDVOSB programs, and government contracting advantages.",
    icon: Award,
    readingTime: "7 min read",
  },
  {
    href: "/guides/texas-veteran-business-benefits",
    title: "Texas Veteran Business Benefits",
    description:
      "Comprehensive overview of every program, incentive, and resource available to veteran entrepreneurs in Texas — from SBA programs to tax benefits.",
    icon: BookOpen,
    readingTime: "8 min read",
  },
  {
    href: "/guides/texas-veteran-llc-filing-fee-waiver",
    title: "Texas Veteran LLC Filing Fee Waiver",
    description:
      "How to waive the $300 LLC filing fee using your Veteran Verification Letter. Step-by-step process under Texas Business Organizations Code §3.005(b).",
    icon: FileCheck,
    readingTime: "7 min read",
  },
  {
    href: "/guides/texas-veteran-verification-letter",
    title: "How to Get Your Veteran Verification Letter",
    description:
      "Step-by-step guide to requesting your VVL from the Texas Veterans Commission — the key to free LLC filing.",
    icon: ScrollText,
    readingTime: "6 min read",
  },
  {
    href: "/guides/texas-business-grants-for-veterans",
    title: "Texas Business Grants for Veterans",
    description:
      "Grants, loans, and funding programs for veteran entrepreneurs in Texas. Federal, state, and private funding sources.",
    icon: DollarSign,
    readingTime: "9 min read",
  },
  {
    href: "/guides/texas-veteran-entrepreneur-guide",
    title: "Texas Veteran Entrepreneur Guide",
    description:
      "A complete roadmap from military service to business ownership in Texas. Planning, formation, launch, and growth.",
    icon: Compass,
    readingTime: "10 min read",
  },
  {
    href: "/guides/best-businesses-for-veterans",
    title: "Best Businesses for Veterans",
    description:
      "Top industries and business ideas that leverage military skills. Security, consulting, trades, tech, and more.",
    icon: Briefcase,
    readingTime: "9 min read",
  },
  {
    href: "/guides/veteran-small-business-resources-texas",
    title: "Veteran Small Business Resources in Texas",
    description:
      "Complete directory of federal, state, and nonprofit resources for veteran entrepreneurs in Texas.",
    icon: Library,
    readingTime: "10 min read",
  },
];

export default function GuidesPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-navy py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-6 sm:px-8 lg:px-10 text-center">
          <Badge
            variant="secondary"
            className="mb-4 text-gold bg-gold/10 text-xs tracking-wider uppercase"
          >
            Free Resources
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            Veteran Business Guides
          </h1>
          <p className="text-white/65 max-w-2xl mx-auto text-sm sm:text-base lg:text-lg leading-relaxed">
            Everything you need to know about starting and growing a
            veteran-owned business in Texas. Written by veterans, for veterans.
          </p>
        </div>
      </section>

      {/* Guide Cards */}
      <section className="section-padding bg-white">
        <div className="mx-auto max-w-5xl px-6 sm:px-8 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {guides.map((guide) => {
              const Icon = guide.icon;
              return (
                <Link key={guide.href} href={guide.href} className="group">
                  <Card className="h-full border-border/50 hover:border-gold/30 hover:shadow-lg transition-all duration-200">
                    <CardContent className="p-6 sm:p-8">
                      <div className="flex items-start gap-4">
                        <div className="shrink-0 w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-gold" />
                        </div>
                        <div className="min-w-0">
                          <h2 className="text-lg font-bold text-navy mb-2 group-hover:text-gold transition-colors leading-snug">
                            {guide.title}
                          </h2>
                          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                            {guide.description}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gold font-medium">
                            <BookOpen className="h-3.5 w-3.5" />
                            <span>{guide.readingTime}</span>
                            <ArrowRight className="h-3.5 w-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-cream section-padding">
        <div className="mx-auto max-w-3xl px-6 sm:px-8 lg:px-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-3">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm sm:text-base leading-relaxed mb-6">
            Check your eligibility for Hutchrok&apos;s free Texas LLC filing
            program in under 60 seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/eligibility">
              <button className="inline-flex items-center justify-center rounded-md bg-gold hover:bg-gold-dark text-navy font-bold text-base px-10 h-12 transition-colors">
                Check My Eligibility
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </Link>
            <Link href="/free-filing">
              <button className="inline-flex items-center justify-center rounded-md border border-navy/20 text-navy hover:bg-navy/5 font-medium text-base px-8 h-12 transition-colors">
                Learn About Free Filing
              </button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
