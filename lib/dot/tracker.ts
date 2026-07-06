/**
 * lib/dot/tracker.ts
 * ----------------------------------------------------------------------------
 * Pure quarterly rate-tracking math: cumulative selections vs. the required
 * annual rate, per company and per test type (49 CFR 382.305).
 * ----------------------------------------------------------------------------
 */
import {
  annualRequiredCount,
  CYCLES,
  FMCSA_RATES,
  rateFor,
  type Cycle,
  type TestType,
} from "@/lib/selection";
import type { AuditRecord, RateProgress } from "./types";

export interface CompanyTrackerRow {
  company: string;
  poolSize: number;
  drug: RateProgress;
  alcohol: RateProgress;
}

/** How far through the year (fraction) the given cycle should have us tested. */
export function expectedPaceThroughCycle(cycle: Cycle): number {
  const idx = CYCLES.indexOf(cycle);
  return (idx + 1) / CYCLES.length; // Q1 -> .25, Q4 -> 1.0
}

function progressFor(
  company: string,
  testType: TestType,
  poolSize: number,
  records: AuditRecord[],
  currentCycle: Cycle,
): RateProgress {
  const rate = rateFor(testType);
  const requiredYtd = annualRequiredCount(poolSize, rate);
  const completedYtd = records
    .filter((r) => r.testType === testType)
    .reduce((sum, r) => sum + r.result.selected.length, 0);

  // On-track means we have met the pace expected by the end of the current cycle.
  const expectedByNow = Math.ceil(requiredYtd * expectedPaceThroughCycle(currentCycle));
  const onTrack = completedYtd >= expectedByNow;
  const percent =
    requiredYtd === 0 ? 100 : Math.min(100, (completedYtd / requiredYtd) * 100);

  return {
    company,
    testType,
    rate,
    poolSize,
    requiredYtd,
    completedYtd,
    onTrack,
    percent,
  };
}

/**
 * Build a tracker row for one company for a given year. Only records matching
 * the company + year are counted. `poolSize` is the current eligible pool size.
 */
export function buildCompanyTracker(
  company: string,
  poolSize: number,
  allRecords: AuditRecord[],
  year: number,
  currentCycle: Cycle = "Q" + (currentQuarterIndex() + 1) as Cycle,
): CompanyTrackerRow {
  const records = allRecords.filter(
    (r) => r.result.company === company && r.year === year,
  );
  return {
    company,
    poolSize,
    drug: progressFor(company, "drug", poolSize, records, currentCycle),
    alcohol: progressFor(company, "alcohol", poolSize, records, currentCycle),
  };
}

/** 0-based quarter index for the current month (Q1 = 0 .. Q4 = 3). */
export function currentQuarterIndex(): number {
  const month = new Date().getMonth(); // 0..11
  return Math.floor(month / 3);
}

export function currentCycle(): Cycle {
  return CYCLES[currentQuarterIndex()];
}

export const RATE_YEAR = FMCSA_RATES.year;
