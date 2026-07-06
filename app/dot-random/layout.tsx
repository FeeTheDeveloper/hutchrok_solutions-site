import type { Metadata } from "next";
import "./dot-theme.css";
import { DotProvider } from "@/components/dot/provider";
import { Sidebar } from "@/components/dot/sidebar";
import { GoldCheck } from "@/components/dot/brand";
import { FMCSA_RATES } from "@/lib/selection";

export const metadata: Metadata = {
  title: "Vet Gang DOT Random Testing Generator",
  description:
    "FMCSA-compliant (49 CFR Part 382) random selection generator for DOT drug & alcohol testing.",
};

export default function DotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dot-root">
      <DotProvider>
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <header className="flex items-center justify-between border-b border-[#21396b] bg-[#0a1a3f] px-8 py-4">
              <div className="flex items-center gap-3">
                <GoldCheck size={26} />
                <h1 className="dot-serif text-lg font-bold">
                  <span className="dot-gold-text">Random Selection</span>{" "}
                  <span className="text-white">Generator</span>
                </h1>
              </div>
              <div className="text-right text-xs text-[#c9d2e3]">
                <div>
                  {FMCSA_RATES.year} FMCSA minimums —{" "}
                  <span className="font-semibold text-white">
                    {(FMCSA_RATES.drug * 100).toFixed(0)}% drug
                  </span>
                  ,{" "}
                  <span className="font-semibold text-white">
                    {(FMCSA_RATES.alcohol * 100).toFixed(0)}% alcohol
                  </span>
                </div>
                <div className="text-[#8a97b3]">49 CFR Part 382</div>
              </div>
            </header>
            <main className="min-w-0 flex-1 p-8">{children}</main>
          </div>
        </div>
      </DotProvider>
    </div>
  );
}
