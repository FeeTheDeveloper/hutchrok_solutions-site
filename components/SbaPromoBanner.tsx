import Link from "next/link";
import { BadgeCheck, ArrowRight } from "lucide-react";

export function SbaPromoBanner() {
  return (
    <div className="border-b border-gold/20 bg-navy text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-2 px-4 py-2.5 text-center text-xs sm:flex-row sm:gap-4 sm:text-sm">
        <span className="inline-flex items-center gap-1.5 font-semibold">
          <BadgeCheck className="h-4 w-4 text-gold" />
          Hutchrok is now SBA-Certified SDVOSB & VOSB
        </span>
        <span className="hidden text-white/35 sm:inline">|</span>
        <Link href="/government" className="inline-flex items-center gap-1 font-bold text-gold hover:text-gold-dark">
          Government capabilities <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
