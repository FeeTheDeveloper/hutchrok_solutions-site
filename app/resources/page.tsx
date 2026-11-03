import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Newspaper } from "lucide-react";
import NewsletterSignup from "@/components/newsletter-signup";
import SpecialsStrip from "@/components/specials-strip";
import { getVeteranFeed, RESOURCE_LINKS } from "@/lib/veteran-feeds";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Veteran Benefits & Business Resources",
  description:
    "Current news from the VA and leading veteran organizations, plus Texas veteran benefits and business resources curated by Hutchrok Solutions Group, an SBA-certified SDVOSB.",
};

export default async function ResourcesPage() {
  const { items, failed } = await getVeteranFeed();

  return (
    <main className="bg-white">
      <section className="bg-navy py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Veteran Intelligence</p>
          <h1 className="mt-3 text-3xl font-bold text-white sm:text-5xl">Benefits and business resources, in one place.</h1>
          <p className="mt-4 max-w-2xl text-white/70">
            Updates from the VA and leading veteran organizations, refreshed hourly, plus the Texas resources we use with every veteran we file for.
          </p>
        </div>
      </section>

      <SpecialsStrip />

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 grid gap-12 lg:grid-cols-[2fr_1fr]">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-navy">
            <Newspaper className="h-5 w-5 text-gold" /> Latest updates
          </h2>
          {items.length === 0 ? (
            <p className="mt-4 text-muted-foreground">Updates are temporarily unavailable. Check the organizations below directly.</p>
          ) : (
            <ul className="mt-6 divide-y">
              {items.slice(0, 12).map((item) => (
                <li key={item.link} className="py-4">
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="group block">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gold">
                      {item.org}
                      {item.published && ` · ${new Date(item.published).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
                    </p>
                    <p className="mt-1 font-semibold text-navy group-hover:underline">{item.title}</p>
                  </a>
                </li>
              ))}
            </ul>
          )}
          {failed.length > 0 && items.length > 0 && (
            <p className="mt-4 text-xs text-muted-foreground">Some sources are delayed: {failed.join(", ")}.</p>
          )}
          <p className="mt-6 text-xs text-muted-foreground">
            Headlines link to the original publisher. Hutchrok is not affiliated with these organizations.
          </p>
        </div>

        <aside className="space-y-8">
          <div className="rounded-xl border border-gold/40 p-6">
            <h2 className="text-lg font-bold text-navy">Get it by email</h2>
            <p className="mt-1 mb-4 text-sm text-muted-foreground">A short veteran benefits and business brief, plus member specials.</p>
            <NewsletterSignup source="resources" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-navy">Talk to a benefits specialist</h2>
            <p className="mt-1 text-sm text-muted-foreground">Claims and benefits questions go to an accredited service officer, free of charge.</p>
            <Link href="/tvc-connect" className="mt-2 inline-block text-sm font-bold text-navy underline underline-offset-4">
              Texas Veterans Commission Connect
            </Link>
          </div>
        </aside>
      </section>

      <section className="bg-slate-50 py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-navy">Organizations we point veterans to</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {RESOURCE_LINKS.map((r) => (
              <a key={r.org} href={r.href} target="_blank" rel="noopener noreferrer" className="rounded-xl border bg-white p-5 hover:border-gold">
                <p className="flex items-center justify-between font-bold text-navy">
                  {r.org} <ArrowUpRight className="h-4 w-4 text-gold" />
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{r.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
