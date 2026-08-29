import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, ShieldCheck, ArrowRight } from "lucide-react";

export function VeteranOwnedBadge() {
  return (
    <section className="border-t border-border/30 bg-cream py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col items-center gap-6 rounded-[2rem] border border-border/50 bg-white px-6 py-8 text-center shadow-[0_20px_60px_rgba(10,22,40,0.08)] sm:px-10 sm:py-10">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">
              Veteran Credential
            </p>
            <Image
              src="/images/vep-vob-logo.png"
              alt="Veteran-Owned Business badge verified by the Texas Veterans Commission"
              width={1124}
              height={1276}
              className="h-auto w-full max-w-[220px] sm:max-w-[260px]"
              sizes="(max-width: 640px) 220px, 260px"
            />
            <div className="space-y-3">
              <h2 className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">
                Verified Veteran-Owned Business
              </h2>
              <p className="max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
                Hutchrok Solutions Group is a veteran-owned Texas business serving entrepreneurs, agencies, primes, and commercial clients.
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-[2rem] border border-gold/30 bg-navy px-6 py-8 text-white shadow-[0_20px_60px_rgba(10,22,40,0.16)] sm:px-10 sm:py-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">
                SBA VetCert
              </p>
              <div className="mt-6 flex items-start gap-4">
                <div className="rounded-2xl bg-gold/10 p-3">
                  <ShieldCheck className="h-9 w-9 text-gold" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    SBA-Certified SDVOSB & VOSB
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-white/70 sm:text-base">
                    Approved August 28, 2026. Hutchrok is eligible to compete for applicable veteran-owned and service-disabled veteran-owned small-business contracting opportunities.
                  </p>
                </div>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-2 font-semibold text-white">
                    <BadgeCheck className="h-4 w-4 text-gold" /> SDVOSB
                  </div>
                  <p className="mt-1 text-xs text-white/55">Service-Disabled Veteran-Owned Small Business</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-2 font-semibold text-white">
                    <BadgeCheck className="h-4 w-4 text-gold" /> VOSB
                  </div>
                  <p className="mt-1 text-xs text-white/55">Veteran-Owned Small Business</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-md text-[11px] leading-5 text-white/45">
                Certification status communicates program eligibility and does not imply SBA endorsement of Hutchrok products or services.
              </p>
              <Link href="/government" className="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-gold hover:text-gold-dark">
                Government capabilities <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
