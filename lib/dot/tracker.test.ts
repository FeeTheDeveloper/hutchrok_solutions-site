import { describe, it, expect } from "vitest";
import { buildCompanyTracker, expectedPaceThroughCycle } from "./tracker";
import { runDraw } from "@/lib/selection";
import type { AuditRecord, DriverInput } from "./types";

function record(
  company: string,
  testType: "drug" | "alcohol",
  cycle: "Q1" | "Q2" | "Q3" | "Q4",
  count: number,
  year = 2026,
): AuditRecord {
  const pool: DriverInput[] = Array.from({ length: 100 }, (_, i) => ({
    driverId: `${company}-${i}`,
    name: `n${i}`,
    cdlNumber: `c${i}`,
    company,
    status: "active",
  }));
  const result = runDraw({
    pool,
    testType,
    cycle,
    company,
    operator: "op",
    count,
  });
  return { id: `${company}-${testType}-${cycle}`, createdAt: "2026-01-01T00:00:00.000Z", year, testType, result };
}

describe("expectedPaceThroughCycle", () => {
  it("maps quarters to cumulative fractions", () => {
    expect(expectedPaceThroughCycle("Q1")).toBeCloseTo(0.25);
    expect(expectedPaceThroughCycle("Q4")).toBeCloseTo(1.0);
  });
});

describe("buildCompanyTracker", () => {
  it("computes required YTD from pool size and rate", () => {
    const t = buildCompanyTracker("Acme", 100, [], 2026, "Q4");
    expect(t.drug.requiredYtd).toBe(50);
    expect(t.alcohol.requiredYtd).toBe(10);
  });

  it("counts completed selections from matching records only", () => {
    const records = [
      record("Acme", "drug", "Q1", 13),
      record("Acme", "drug", "Q2", 13),
      record("Other", "drug", "Q1", 13), // different company, ignored
    ];
    const t = buildCompanyTracker("Acme", 100, records, 2026, "Q2");
    expect(t.drug.completedYtd).toBe(26);
  });

  it("flags behind when pace not met", () => {
    // By Q4, need 50 drug tests; only 13 done -> behind.
    const t = buildCompanyTracker(
      "Acme",
      100,
      [record("Acme", "drug", "Q1", 13)],
      2026,
      "Q4",
    );
    expect(t.drug.onTrack).toBe(false);
  });

  it("flags on-track when pace met", () => {
    // By Q1, expected ceil(50*0.25)=13; 13 done -> on track.
    const t = buildCompanyTracker(
      "Acme",
      100,
      [record("Acme", "drug", "Q1", 13)],
      2026,
      "Q1",
    );
    expect(t.drug.onTrack).toBe(true);
  });

  it("ignores records from a different year", () => {
    const t = buildCompanyTracker(
      "Acme",
      100,
      [record("Acme", "drug", "Q1", 13, 2025)],
      2026,
      "Q1",
    );
    expect(t.drug.completedYtd).toBe(0);
  });
});
