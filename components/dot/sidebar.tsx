"use client";

/** Left sidebar: navigation + company roster list. */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useDot } from "./provider";
import { GoldCheck } from "./brand";
import { CONSORTIUM_LABEL } from "@/lib/dot/types";

const NAV = [
  { href: "/dot-random", label: "Dashboard" },
  { href: "/dot-random/draw", label: "Run Draw" },
  { href: "/dot-random/audit", label: "Audit Trail" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { pools, records } = useDot();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-[#21396b] bg-[#0a1a3f] p-4">
      <Link href="/dot-random" className="mb-6 flex items-center gap-2.5">
        <GoldCheck size={30} />
        <div className="leading-tight">
          <div className="dot-serif text-sm font-bold text-white">
            KNOW BEFORE U GO
          </div>
          <div className="text-[10px] uppercase tracking-widest text-[#c9d2e3]">
            DOT Random Testing
          </div>
        </div>
      </Link>

      <nav className="flex flex-col gap-1">
        {NAV.map((item) => {
          const active =
            item.href === "/dot-random"
              ? pathname === item.href
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "dot-gold-fill"
                  : "text-[#c9d2e3] hover:bg-[#122a54]",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-7 mb-2 px-1 text-[10px] font-semibold uppercase tracking-widest text-[#c9d2e3]">
        Companies ({pools.length})
      </div>
      <div className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {pools.length === 0 && (
          <p className="px-2 text-xs text-[#8a97b3]">
            No pools yet. Upload a roster in Run Draw.
          </p>
        )}
        {pools.map((p) => {
          const count = records.filter(
            (r) => r.result.company === p.company,
          ).length;
          return (
            <div
              key={p.company}
              className="flex items-center justify-between rounded-md px-3 py-1.5 text-sm text-white hover:bg-[#122a54]"
            >
              <span className="truncate">{p.company}</span>
              <span className="ml-2 shrink-0 text-[11px] text-[#c9d2e3]">
                {p.drivers.length}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-md border border-[#21396b] p-2 text-[10px] leading-relaxed text-[#8a97b3]">
        {CONSORTIUM_LABEL} draws pull every company&apos;s active drivers into one
        pool. Data stays in your browser.
      </div>
    </aside>
  );
}
