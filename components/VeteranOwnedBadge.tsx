import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function VeteranOwnedBadge() {
  return (
    <section className="border-t border-border/30 bg-cream py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-10">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">
            Federal Veteran Certifications
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-navy sm:text-3xl">
            SBA VetCert — VOSB & SDVOSB
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            Hutchrok Solutions Group is SBA-certified as both a Veteran-Owned Small Business and a Service-Disabled Veteran-Owned Small Business.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col items-center justify-center rounded-[2rem] border border-border/50 bg-white px-6 py-8 text-center shadow-[0_20px_60px_rgba(10,22,40,0.08)] sm:px-10 sm:py-10">
            <Image
              src="/Veteran-Owned%20Certified.png"
              alt="SBA Veteran-Owned Small Business certified badge"
              width={900}
              height={900}
              priority
              className="h-auto w-full max-w-[260px] object-contain sm:max-w-[300px]"
              sizes="(max-width: 640px) 260px, 300px"
            />
            <h3 className="mt-6 text-xl font-bold text-navy">Veteran-Owned Small Business</h3>
            <p className="mt-2 text-sm text-muted-foreground">SBA VetCert VOSB</p>
          </div>

          <div className="flex flex-col items-center justify-center rounded-[2rem] border border-gold/30 bg-navy px-6 py-8 text-center text-white shadow-[0_20px_60px_rgba(10,22,40,0.16)] sm:px-10 sm:py-10">
            <Image
              src="/Service-Disabled%20Veteran-Owned-Certified.png"
              alt="SBA Service-Disabled Veteran-Owned Small Business certified badge"
              width={900}
              height={900}
              priority
              className="h-auto w-full max-w-[260px] object-contain sm:max-w-[300px]"
              sizes="(max-width: 640px) 260px, 300px"
            />
            <h3 className="mt-6 text-xl font-bold">Service-Disabled Veteran-Owned Small Business</h3>
            <p className="mt-2 text-sm text-white/65">SBA VetCert SDVOSB</p>
          </div>
        </div>

        <div className="mt-7 flex flex-col items-center justify-between gap-4 rounded-2xl border border-border/40 bg-white/70 px-5 py-4 sm:flex-row">
          <p className="max-w-3xl text-[11px] leading-5 text-muted-foreground">
            Certification status communicates program eligibility and does not imply SBA endorsement of Hutchrok products or services.
          </p>
          <Link
            href="/government"
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-gold-dark hover:text-gold"
          >
            Government capabilities <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
