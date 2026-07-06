import { describe, it, expect } from "vitest";
import {
  ALGORITHM_VERSION,
  FMCSA_RATES,
  annualRequiredCount,
  cycleRequiredCount,
  createSeededRng,
  fisherYatesShuffle,
  generateSeed,
  hashPool,
  runDraw,
  sha256Hex,
  verifyDraw,
  type Driver,
} from "./selection";

function makePool(n: number): Driver[] {
  return Array.from({ length: n }, (_, i) => ({
    driverId: `D-${1000 + i}`,
    name: `Driver ${i}`,
    cdlNumber: `CDL${100000 + i}`,
    company: "Test Carrier",
    status: "active",
  }));
}

describe("FMCSA_RATES", () => {
  it("encodes the 2026 minimum annual random rates", () => {
    expect(FMCSA_RATES.drug).toBe(0.5);
    expect(FMCSA_RATES.alcohol).toBe(0.1);
    expect(FMCSA_RATES.year).toBe(2026);
  });
});

describe("required-count math (49 CFR 382.305)", () => {
  it("computes 50% drug requirement rounded up", () => {
    expect(annualRequiredCount(100, FMCSA_RATES.drug)).toBe(50);
    expect(annualRequiredCount(101, FMCSA_RATES.drug)).toBe(51); // 50.5 -> 51
    expect(annualRequiredCount(7, FMCSA_RATES.drug)).toBe(4); // 3.5 -> 4
  });

  it("computes 10% alcohol requirement rounded up", () => {
    expect(annualRequiredCount(100, FMCSA_RATES.alcohol)).toBe(10);
    expect(annualRequiredCount(11, FMCSA_RATES.alcohol)).toBe(2); // 1.1 -> 2
    expect(annualRequiredCount(0, FMCSA_RATES.alcohol)).toBe(0);
  });

  it("never under-tests: ceil guarantees >= rate", () => {
    for (let n = 1; n <= 200; n++) {
      const req = annualRequiredCount(n, FMCSA_RATES.drug);
      expect(req / n).toBeGreaterThanOrEqual(FMCSA_RATES.drug);
    }
  });

  it("spreads selections evenly across four cycles", () => {
    // 100 drivers * 50% = 50/yr -> ceil(50/4) = 13 per cycle
    expect(cycleRequiredCount(100, FMCSA_RATES.drug)).toBe(13);
    expect(cycleRequiredCount(100, FMCSA_RATES.alcohol)).toBe(3); // ceil(10/4)
  });
});

describe("cryptographic seed", () => {
  it("generates a 256-bit (64 hex char) seed", () => {
    const seed = generateSeed();
    expect(seed).toMatch(/^[0-9a-f]{64}$/);
  });
  it("generates distinct seeds", () => {
    const seeds = new Set(Array.from({ length: 100 }, () => generateSeed()));
    expect(seeds.size).toBe(100);
  });
});

describe("sha256Hex", () => {
  it("matches known NIST test vectors", () => {
    expect(sha256Hex("")).toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    );
    expect(sha256Hex("abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
  });
});

describe("hashPool", () => {
  it("is order-independent (captures the SET of drivers)", () => {
    const pool = makePool(20);
    const shuffled = [...pool].reverse();
    expect(hashPool(pool)).toBe(hashPool(shuffled));
  });
  it("changes when the roster changes", () => {
    const a = makePool(20);
    const b = makePool(21);
    expect(hashPool(a)).not.toBe(hashPool(b));
  });
});

describe("reproducibility from a fixed seed", () => {
  it("produces identical selections for the same seed", () => {
    const pool = makePool(50);
    const params = {
      pool,
      testType: "drug" as const,
      cycle: "Q1" as const,
      company: "Test Carrier",
      operator: "auditor",
      count: 25,
      seed: "fixed-seed-abc123",
      timestamp: "2026-01-15T12:00:00.000Z",
    };
    const a = runDraw(params);
    const b = runDraw(params);
    expect(a.selected.map((d) => d.driverId)).toEqual(
      b.selected.map((d) => d.driverId),
    );
    expect(a.alternates.map((d) => d.driverId)).toEqual(
      b.alternates.map((d) => d.driverId),
    );
    expect(a.seed).toBe(b.seed);
    expect(a.poolHash).toBe(b.poolHash);
  });

  it("verifyDraw replays a persisted record and confirms integrity", () => {
    const pool = makePool(40);
    const rec = runDraw({
      pool,
      testType: "alcohol",
      cycle: "Q2",
      company: "Test Carrier",
      operator: "auditor",
      count: 8,
    });
    expect(verifyDraw(rec, pool)).toBe(true);
    // Tampering with the recorded selection is detected.
    const tampered = {
      ...rec,
      selected: [...rec.selected.slice(1), pool[pool.length - 1]],
    };
    expect(verifyDraw(tampered, pool)).toBe(false);
  });

  it("different seeds generally produce different selections", () => {
    const pool = makePool(50);
    const base = {
      pool,
      testType: "drug" as const,
      cycle: "Q1" as const,
      company: "Test Carrier",
      operator: "auditor",
      count: 25,
      timestamp: "2026-01-15T12:00:00.000Z",
    };
    const a = runDraw({ ...base, seed: "seed-A" });
    const b = runDraw({ ...base, seed: "seed-B" });
    expect(a.selected.map((d) => d.driverId)).not.toEqual(
      b.selected.map((d) => d.driverId),
    );
  });
});

describe("draw structure", () => {
  it("selects without replacement within a draw (no duplicates)", () => {
    const pool = makePool(30);
    const rec = runDraw({
      pool,
      testType: "drug",
      cycle: "Q1",
      company: "Test Carrier",
      operator: "op",
      count: 15,
    });
    const all = [...rec.selected, ...rec.alternates].map((d) => d.driverId);
    expect(new Set(all).size).toBe(all.length);
  });

  it("records all required audit fields", () => {
    const pool = makePool(10);
    const rec = runDraw({
      pool,
      testType: "drug",
      cycle: "Q3",
      company: "Test Carrier",
      operator: "op",
      count: 5,
    });
    expect(rec.algorithmVersion).toBe(ALGORITHM_VERSION);
    expect(rec.seed).toMatch(/^[0-9a-f]{64}$/);
    expect(rec.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(rec.poolHash).toMatch(/^[0-9a-f]{64}$/);
    expect(rec.poolSize).toBe(10);
    expect(rec.requiredCount).toBe(5);
  });

  it("clamps count to pool size", () => {
    const pool = makePool(3);
    const rec = runDraw({
      pool,
      testType: "drug",
      cycle: "Q1",
      company: "c",
      operator: "o",
      count: 99,
    });
    expect(rec.selected.length).toBe(3);
    expect(rec.alternates.length).toBe(0);
  });
});

describe("equal-probability distribution", () => {
  it("selects every driver with ~equal frequency over many runs", () => {
    const poolSize = 10;
    const pool = makePool(poolSize);
    const pick = 3;
    const runs = 60000;
    const counts: Record<string, number> = {};
    pool.forEach((d) => (counts[d.driverId] = 0));

    for (let i = 0; i < runs; i++) {
      // Fresh crypto seed each run — mirrors real per-cycle draws.
      const rec = runDraw({
        pool,
        testType: "drug",
        cycle: "Q1",
        company: "Test Carrier",
        operator: "op",
        count: pick,
      });
      rec.selected.forEach((d) => (counts[d.driverId] += 1));
    }

    // Expected times selected = runs * pick / poolSize.
    const expected = (runs * pick) / poolSize; // 18000
    for (const id of Object.keys(counts)) {
      const deviation = Math.abs(counts[id] - expected) / expected;
      // Allow 5% deviation — comfortably within chi-square tolerance at this N.
      expect(deviation).toBeLessThan(0.05);
    }
  });

  it("Fisher-Yates covers all positions uniformly for a small array", () => {
    // With a deterministic RNG, verify each element lands in each slot ~evenly.
    const items = [0, 1, 2, 3];
    const slots = items.map(() => items.map(() => 0));
    const runs = 24000;
    for (let i = 0; i < runs; i++) {
      const rng = createSeededRng(`s-${i}`);
      const out = fisherYatesShuffle(items, rng);
      out.forEach((val, pos) => (slots[val][pos] += 1));
    }
    const expected = runs / items.length; // 6000
    for (const row of slots) {
      for (const c of row) {
        expect(Math.abs(c - expected) / expected).toBeLessThan(0.08);
      }
    }
  });
});
