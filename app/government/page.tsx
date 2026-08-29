import Link from "next/link";
import { ArrowRight, BadgeCheck, Building2, FileText, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const naics = [
  ["541611", "Administrative Management & General Management Consulting"],
  ["541430", "Graphic Design Services"],
  ["541511", "Custom Computer Programming Services"],
  ["541613", "Marketing Consulting Services"],
  ["541618", "Other Management Consulting Services"],
];

export default function GovernmentPage() {
  return (
    <main className="bg-white">
      <section className="relative overflow-hidden bg-navy py-24 sm:py-32">
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        <div className="relative mx-auto max-w-6xl px-6 sm:px-8 lg:px-10">
          <div className="max-w-4xl">
            <div className="mb-6 flex flex-wrap gap-3">
              <span className="rounded-full border border-gold/50 bg-gold/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-gold">
                SBA Certified SDVOSB
              </span>
              <span className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white/90">
                SBA Certified VOSB
              </span>
            </div>
            <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Veteran-owned execution for government and commercial missions.
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-white/70 sm:text-lg">
              Hutchrok Solutions Group LLC is an SBA-certified Service-Disabled Veteran-Owned Small Business and Veteran-Owned Small Business delivering management consulting, program support, custom software, marketing, and design services.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/contact">
                <Button className="h-12 bg-gold px-7 font-bold text-navy hover:bg-gold-dark">
                  Partner With Hutchrok <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/services">
                <Button variant="outline" className="h-12 border-white/30 px-7 text-white hover:bg-white/10">
                  View Capabilities
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border/50 bg-cream py-8">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 text-center sm:grid-cols-4 sm:px-8 lg:px-10">
          <div><p className="text-xs uppercase tracking-wider text-muted-foreground">UEI</p><p className="mt-1 font-bold text-navy">PT36H4F81AU9</p></div>
          <div><p className="text-xs uppercase tracking-wider text-muted-foreground">CAGE</p><p className="mt-1 font-bold text-navy">22Z09</p></div>
          <div><p className="text-xs uppercase tracking-wider text-muted-foreground">Primary NAICS</p><p className="mt-1 font-bold text-navy">541611</p></div>
          <div><p className="text-xs uppercase tracking-wider text-muted-foreground">PSC</p><p className="mt-1 font-bold text-navy">R408</p></div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Government Ready</p>
              <h2 className="mt-3 text-3xl font-bold text-navy">Certified. Registered. Built to execute.</h2>
              <p className="mt-4 leading-7 text-muted-foreground">
                Hutchrok is positioned for federal, state, local, prime-contractor, and commercial teaming opportunities where agile program support, technology, business operations, and communications matter.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  [ShieldCheck, "SBA Certified SDVOSB", "Approved August 28, 2026"],
                  [BadgeCheck, "SBA Certified VOSB", "Veteran Small Business Certification"],
                  [Building2, "SAM Registered", "All Awards registration"],
                  [FileText, "Texas LLC", "Hutchrok Solutions Group LLC"],
                ].map(([Icon, title, text]) => {
                  const I = Icon as typeof ShieldCheck;
                  return (
                    <div key={String(title)} className="rounded-2xl border border-border/60 bg-cream/50 p-5">
                      <I className="h-6 w-6 text-gold" />
                      <h3 className="mt-3 font-bold text-navy">{String(title)}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{String(text)}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl bg-navy p-7 text-white sm:p-9">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Core NAICS</p>
              <div className="mt-5 space-y-4">
                {naics.map(([code, title]) => (
                  <div key={code} className="flex gap-4 border-b border-white/10 pb-4 last:border-0 last:pb-0">
                    <span className="font-mono text-sm font-bold text-gold">{code}</span>
                    <span className="text-sm leading-6 text-white/80">{title}</span>
                  </div>
                ))}
              </div>
              <div className="mt-7 rounded-xl border border-gold/30 bg-gold/10 p-4 text-sm leading-6 text-white/80">
                Hutchrok may use its certification status to communicate eligibility. SBA certification does not constitute SBA endorsement of Hutchrok&apos;s products or services.
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
