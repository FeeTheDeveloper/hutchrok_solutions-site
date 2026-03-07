import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BookOpen, ChevronRight } from "lucide-react";

interface GuideLayoutProps {
  badge: string;
  title: string;
  subtitle: string;
  publishedDate: string;
  readingTime: string;
  relatedGuides?: { href: string; title: string }[];
  children: React.ReactNode;
}

/**
 * Reusable layout for long-form SEO guide pages.
 * Provides a hero, article wrapper, mid-article CTA, and bottom CTA.
 */
export function GuideLayout({
  badge,
  title,
  subtitle,
  publishedDate,
  readingTime,
  relatedGuides,
  children,
}: GuideLayoutProps) {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-navy py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-6 sm:px-8 lg:px-10 text-center">
          <Badge
            variant="secondary"
            className="mb-4 text-gold bg-gold/10 text-xs tracking-wider uppercase"
          >
            {badge}
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            {title}
          </h1>
          <p className="text-white/65 max-w-2xl mx-auto text-sm sm:text-base lg:text-lg leading-relaxed">
            {subtitle}
          </p>
          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-white/40">
            <span className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              {readingTime}
            </span>
            <span>·</span>
            <time dateTime={publishedDate}>
              {new Date(publishedDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </div>
        </div>
      </section>

      {/* Article body */}
      <article className="section-padding bg-white">
        <div className="mx-auto max-w-3xl px-6 sm:px-8 lg:px-10 prose-hutchrok">
          {children}
        </div>
      </article>

      {/* Related Guides */}
      {relatedGuides && relatedGuides.length > 0 && (
        <section className="bg-white border-t border-border/50 py-12 sm:py-16">
          <div className="mx-auto max-w-3xl px-6 sm:px-8 lg:px-10">
            <h2 className="text-xl sm:text-2xl font-bold text-navy mb-6">
              Related Guides
            </h2>
            <div className="grid gap-3">
              {relatedGuides.map((guide) => (
                <Link
                  key={guide.href}
                  href={guide.href}
                  className="group flex items-center justify-between rounded-xl border border-border/50 px-5 py-4 hover:border-gold/30 hover:bg-cream/50 transition-all"
                >
                  <span className="text-sm sm:text-base font-medium text-navy group-hover:text-gold transition-colors">
                    {guide.title}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-gold shrink-0 ml-4 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="bg-cream section-padding">
        <div className="mx-auto max-w-3xl px-6 sm:px-8 lg:px-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-3">
            Start Your Free Texas LLC with Hutchrok
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm sm:text-base leading-relaxed mb-6">
            Hutchrok handles your Certificate of Formation with the Texas
            Secretary of State — at no cost to qualified veterans.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/free-filing">
              <Button
                size="lg"
                className="bg-gold hover:bg-gold-dark text-navy font-bold text-base px-10 h-12"
              >
                Start My Free Filing
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/eligibility">
              <Button
                size="lg"
                variant="outline"
                className="border-navy/20 text-navy hover:bg-navy/5 font-medium text-base px-8 h-12"
              >
                Check My Eligibility
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

/**
 * Mid-article CTA block. Drop between sections inside guide content.
 */
export function GuideCTA({
  text = "See if you qualify for free filing.",
  href = "/eligibility",
  label = "Check Eligibility",
}: {
  text?: string;
  href?: string;
  label?: string;
}) {
  return (
    <div className="not-prose my-10 rounded-2xl border border-gold/20 bg-cream p-6 sm:p-8 text-center">
      <p className="text-navy font-semibold text-base sm:text-lg mb-4">
        {text}
      </p>
      <Link href={href}>
        <Button className="bg-gold hover:bg-gold-dark text-navy font-bold px-8 h-11">
          {label}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}
