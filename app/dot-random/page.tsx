"use client";

import Link from "next/link";
import { useDot } from "@/components/dot/provider";
import {
  GoldButton,
  GoldCheck,
  Panel,
  ProgressBar,
  StatusPill,
} from "@/components/dot/brand";
import { eligibleDrivers } from "@/lib/dot/csv";
import { buildCompanyTracker, currentCycle, RATE_YEAR } from "@/lib/dot/tracker";
import type { RateProgress } from "@/lib/dot/types";

function RateRow({ p }: { p: RateProgress }) {
  return (
    <div className="grid grid-cols-[80px_1fr_auto] items-center gap-3">
      <span className="text-xs font-semibold uppercase tracking-wide text-[#c9d2e3]">
        {p.testType} {(p.rate * 100).toFixed(0)}%
      </span>
      <div>
        <ProgressBar percent={p.percent} />
        <div className="mt-1 text-[11px] text-[#8a97b3]">
          {p.completedYtd} of {p.requiredYtd} required YTD
        </div>
      </div>
      <StatusPill onTrack={p.onTrack} />
    </div>
  );
}

export default function DashboardPage() {
  const { ready, pools, records } = useDot();
  const cycle = currentCycle();

  if (!ready) {
    return <p className="text-[#c9d2e3]">Loading…</p>;
  }

  if (pools.length === 0) {
    return (
      <div className="mx-auto max-w-xl">
        <Panel className="text-center">
          <div className="mb-3 flex justify-center">
            <GoldCheck size={44} />
          </div>
          <h2 className="dot-serif mb-2 text-2xl font-bold text-white">
            Welcome, operator.
          </h2>
          <p className="mb-5 text-sm text-[#c9d2e3]">
            Upload a driver roster to create your first company pool, then run a
            cryptographically random, fully auditable DOT selection.
          </p>
          <Link href="/dot-random/draw">
            <GoldButton>Upload roster &amp; run a draw</GoldButton>
          </Link>
        </Panel>
      </div>
    );
  }

  const totalDrivers = pools.reduce((s, p) => s + p.drivers.length, 0);
  const totalActive = pools.reduce(
    (s, p) => s + eligibleDrivers(p.drivers).length,
    0,
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Companies" value={pools.length} />
        <Stat label="Drivers on file" value={totalDrivers} />
        <Stat label="Active / eligible" value={totalActive} />
        <Stat label="Draws logged" value={records.length} />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="dot-serif text-xl font-bold text-white">
            Quarterly Rate Tracker
          </h2>
          <span className="text-xs text-[#c9d2e3]">
            Year {RATE_YEAR} · Current cycle {cycle}
          </span>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {pools.map((pool) => {
            const activeCount = eligibleDrivers(pool.drivers).length;
            const tracker = buildCompanyTracker(
              pool.company,
              activeCount,
              records,
              RATE_YEAR,
              cycle,
            );
            return (
              <Panel key={pool.company} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="dot-serif text-lg font-semibold text-white">
                    {pool.company}
                  </h3>
                  <span className="text-xs text-[#c9d2e3]">
                    {activeCount} eligible / {pool.drivers.length} total
                  </span>
                </div>
                <RateRow p={tracker.drug} />
                <RateRow p={tracker.alcohol} />
              </Panel>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Panel className="py-4">
      <div className="dot-gold-text text-3xl font-bold">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-wide text-[#c9d2e3]">
        {label}
      </div>
    </Panel>
  );
}
