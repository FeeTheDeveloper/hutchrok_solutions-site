import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ServiceRequestForm from "@/components/service-request-form";
import {
  formatStartingPrice,
  PAID_SERVICE_BY_SLUG,
  type PaidServiceSlug,
} from "@/lib/paid-services";

export const metadata: Metadata = {
  title: "Request a Paid Service",
  description:
    "Start your paid service request with Hutchrok for website, branding, logo, email, hosting, and compliance setup support.",
};

interface ServiceRequestPageProps {
  searchParams: Promise<{ service?: string }>;
}

export default async function ServiceRequestPage({
  searchParams,
}: ServiceRequestPageProps) {
  const params = await searchParams;
  const serviceSlug = (params.service ?? "") as PaidServiceSlug;
  const selectedService = PAID_SERVICE_BY_SLUG[serviceSlug] ?? null;

  return (
    <>
      <section className="bg-gradient-navy py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-6 sm:px-8 lg:px-10 text-center">
          <Badge variant="secondary" className="mb-3 text-gold bg-gold/10">
            Paid Service Request
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Start Your Service Intake
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            This request flow is for optional paid services after your veteran LLC filing.
            Your free Texas LLC filing remains available with no obligation.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-cream">
        <div className="mx-auto max-w-5xl px-6 sm:px-8 lg:px-10 space-y-8">
          {selectedService && (
            <div className="bg-white border border-gold/30 rounded-2xl p-6 sm:p-8">
              <p className="text-xs uppercase tracking-wider text-gold font-semibold mb-2">
                Selected Service
              </p>
              <h2 className="text-2xl font-bold text-navy mb-1">{selectedService.title}</h2>
              <p className="text-muted-foreground mb-2">{selectedService.description}</p>
              <p className="text-sm font-semibold text-navy">
                {formatStartingPrice(selectedService.startingPrice)}
              </p>
            </div>
          )}

          <ServiceRequestForm initialServiceSlug={selectedService?.slug} />

          <div className="bg-white border border-border/50 rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Still need to form your company first? Start the veteran free-filing flow.
            </p>
            <Link href="/free-filing">
              <Button variant="outline" className="border-navy/30 text-navy hover:bg-cream">
                Start Free Filing
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
