import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GUIDES } from "@/lib/guides";

/**
 * "Meet your guides" — the human layer of the homepage. Each named character
 * stands for a service line and links into it.
 */
export function GuideCast() {
  return (
    <section aria-labelledby="guides-title" className="section-padding bg-white">
      <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-10">
        <div className="text-center mb-12 lg:mb-14">
          <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#806A2C] border border-gold/30 rounded px-2.5 py-1 inline-block mb-4">
            Your Guides
          </span>
          <h2
            id="guides-title"
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-navy mb-3 leading-tight"
          >
            Real Guidance at Every Stage
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            No ticket queue and no script. Each part of your launch has a guide
            who knows that stage of the Texas process.
          </p>
        </div>

        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {GUIDES.map((g) => (
            <li key={g.id}>
              <Link
                href={g.href}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-cream/60 hover:border-gold/40 hover:shadow-md transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-dark"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-[#ECEAE6]">
                  <Image
                    src={g.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 260px, 50vw"
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <h3 className="text-[15px] sm:text-base font-bold text-navy">
                    {g.name}
                  </h3>
                  <p className="font-mono text-[10px] sm:text-[11px] tracking-[0.16em] uppercase text-[#806A2C] mt-1">
                    {g.role}
                  </p>
                  <p className="hidden sm:block text-sm text-slate-600 leading-relaxed mt-3">
                    {g.focus}
                  </p>
                  <span className="mt-auto pt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-navy group-hover:text-gold-dark">
                    See this stage
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <p className="text-center text-xs text-slate-600 mt-8">
          Guides shown are illustrative characters representing Hutchrok&apos;s
          service lines.
        </p>
      </div>
    </section>
  );
}
