import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import LeadSignupForm from "@/components/lead-signup-form";
import {
  MARKETING_SERVICES,
  SIGNUP_DISCOUNT_LABEL,
  applySignupDiscount,
  formatPrice,
} from "@/lib/promotions";
import {
  Globe,
  Palette,
  PenTool,
  Mail,
  Server,
  Tag,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export const metadata = {
  title: "Sign Up & Get 10% Off Marketing Services",
  description:
    "Create your Hutchrok account and unlock 10% off marketing services — websites, branding, logos, business email, and hosting for your new business.",
};

const ICONS = {
  "business-website": Globe,
  "brand-identity-package": Palette,
  "logo-design": PenTool,
  "business-email-setup": Mail,
  "domain-hosting": Server,
} as const;

export default function GetStartedPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative bg-hero-premium overflow-hidden">
        <div className="bg-grid-pattern absolute inset-0 pointer-events-none" />
        <div className="relative mx-auto max-w-6xl px-6 sm:px-8 lg:px-10 py-16 sm:py-20 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <Badge
              variant="secondary"
              className="mb-4 text-gold bg-gold/10 text-xs tracking-wider uppercase"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              New Sign-Up Offer
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              Sign Up &amp; Get{" "}
              <span className="text-gradient-gold">{SIGNUP_DISCOUNT_LABEL}</span>{" "}
              Marketing Services
            </h1>
            <p className="text-white/65 text-sm sm:text-base lg:text-lg leading-relaxed mb-6 max-w-xl">
              Create your free Hutchrok account and unlock {SIGNUP_DISCOUNT_LABEL}{" "}
              your first marketing service — a professional website, branding,
              logo, business email, or hosting. Built to make your new business
              look established from day one.
            </p>
            <ul className="space-y-2.5">
              {[
                "Instant welcome discount code",
                "No obligation — use it when you're ready",
                "Veteran-owned, operator-reviewed work",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2.5 text-sm text-white/80"
                >
                  <ShieldCheck className="h-4 w-4 text-gold shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Form */}
          <div>
            <LeadSignupForm />
          </div>
        </div>
      </section>

      {/* ── Discounted services grid ── */}
      <section className="section-padding bg-white">
        <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-10">
          <div className="text-center mb-12">
            <Badge
              variant="secondary"
              className="mb-3 text-gold bg-gold/10 text-xs tracking-wider uppercase"
            >
              What Your Discount Covers
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-navy mb-3 leading-tight">
              Marketing Services — Now {SIGNUP_DISCOUNT_LABEL} for New Sign-Ups
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
              Your welcome code applies to any of these. Prices shown reflect
              the {SIGNUP_DISCOUNT_LABEL} sign-up discount.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {MARKETING_SERVICES.map((service) => {
              const Icon = ICONS[service.slug as keyof typeof ICONS];
              const discounted = applySignupDiscount(service.startingPrice);
              return (
                <Card
                  key={service.slug}
                  className="border border-border/50 bg-cream/40 hover:border-gold/40 hover:shadow-lg transition-all duration-300 flex flex-col"
                >
                  <CardContent className="p-6 flex flex-col flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="h-11 w-11 rounded-lg bg-gold/10 flex items-center justify-center">
                        {Icon && <Icon className="h-5 w-5 text-gold" />}
                      </div>
                      <Badge className="bg-gold/15 text-gold-dark border-0 text-[10px] font-bold tracking-wide">
                        {SIGNUP_DISCOUNT_LABEL.toUpperCase()}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-navy text-[15px] mb-2">
                      {service.title}
                    </h3>
                    <div className="mb-2 flex items-baseline gap-2">
                      <span className="text-lg font-bold text-navy">
                        {formatPrice(discounted)}
                      </span>
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(service.startingPrice)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        starting
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {service.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Discount applies to the starting price of your first marketing
            service and is confirmed on your quote. One welcome discount per new
            customer.
          </p>
        </div>
      </section>

      {/* ── Reassurance strip ── */}
      <section className="bg-cream border-t border-border/30 py-12">
        <div className="mx-auto max-w-4xl px-6 sm:px-8 lg:px-10">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 text-center">
            <div className="flex items-center gap-2.5">
              <Tag className="h-5 w-5 text-gold" />
              <span className="text-sm font-medium text-navy">
                Instant {SIGNUP_DISCOUNT_LABEL} welcome code
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-5 w-5 text-gold" />
              <span className="text-sm font-medium text-navy">
                Veteran-owned &amp; operator-reviewed
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Sparkles className="h-5 w-5 text-gold" />
              <span className="text-sm font-medium text-navy">
                No obligation to buy
              </span>
            </div>
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already filing your LLC with us?{" "}
            <Link href="/track" className="text-gold font-medium hover:underline">
              Track your filing
            </Link>{" "}
            or{" "}
            <Link
              href="/launch-services"
              className="text-gold font-medium hover:underline"
            >
              browse all launch services
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
