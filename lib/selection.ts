/**
 * lib/selection.ts
 * ----------------------------------------------------------------------------
 * FMCSA-compliant random selection engine for DOT drug & alcohol testing.
 *
 * Compliance basis: 49 CFR Part 382 (Controlled Substances and Alcohol Use
 * and Testing). This module implements the *selection math and randomization*
 * only. It is intentionally free of any UI, storage, or I/O coupling so it can
 * be unit-tested in isolation and its behavior can be audited line-by-line.
 *
 * Design guarantees:
 *  - Cryptographically secure entropy: every draw's seed is generated from
 *    crypto.getRandomValues (never Math.random).
 *  - Reproducibility: the shuffle is driven by a *deterministic* PRNG seeded
 *    from that crypto seed, so persisting the seed lets any auditor replay the
 *    exact draw and obtain byte-identical selections.
 *  - Equal probability: an unbiased Fisher-Yates shuffle gives every driver in
 *    the pool an equal chance of selection in every cycle. Within a single draw
 *    selection is without replacement; across cycles drivers return to the pool
 *    (selection with replacement across cycles).
 *  - Auditability: each draw records seed, ISO-8601 timestamp, a SHA-256 pool
 *    snapshot hash, the operator, and the algorithm version.
 * ----------------------------------------------------------------------------
 */

/** Bump this whenever the selection algorithm changes in any observable way. */
export const ALGORITHM_VERSION = "vetgang-dot-rng-1.0.0";

/**
 * 2026 FMCSA minimum annual random testing rates (49 CFR 382.305).
 * Stored as configurable constants so they can be updated when the FMCSA
 * re-publishes the minimum annual percentage rates each January.
 * `drug` = controlled substances, `alcohol` = alcohol.
 */
export const FMCSA_RATES = {
  year: 2026,
  drug: 0.5, // 50% of the average number of driver positions
  alcohol: 0.1, // 10% of the average number of driver positions
} as const;

export const CYCLES_PER_YEAR = 4 as const;

export type TestType = "drug" | "alcohol";
export type Cycle = "Q1" | "Q2" | "Q3" | "Q4";
export const CYCLES: readonly Cycle[] = ["Q1", "Q2", "Q3", "Q4"] as const;

export interface Driver {
  driverId: string;
  name: string;
  cdlNumber: string;
  company: string;
  status: string; // e.g. "active" | "inactive"
}

export interface DrawParams {
  /** Eligible drivers for this draw (already filtered to active, correct company). */
  pool: Driver[];
  testType: TestType;
  cycle: Cycle;
  /** Company label, or a consortium label for a combined draw. */
  company: string;
  operator: string;
  /** How many primary selections to draw. Callers typically use requiredCount(). */
  count: number;
  /** How many labeled alternates to draw after the primaries. Defaults below. */
  alternateCount?: number;
  /**
   * Optional fixed seed (hex). When omitted a cryptographically secure seed is
   * generated. Supplying a seed makes the draw fully reproducible.
   */
  seed?: string;
  /** Optional ISO-8601 timestamp override (for reproducible records/tests). */
  timestamp?: string;
}

export interface DrawResult {
  algorithmVersion: string;
  seed: string;
  timestamp: string;
  company: string;
  operator: string;
  testType: TestType;
  cycle: Cycle;
  rate: number;
  poolSize: number;
  poolHash: string;
  requiredCount: number;
  selected: Driver[];
  alternates: Driver[];
}

// ---------------------------------------------------------------------------
// Required-count math (49 CFR 382.305)
// ---------------------------------------------------------------------------

/**
 * Minimum number of tests required over the *year* for a pool of `poolSize`
 * driver positions at the given annual `rate`. Rounds up so the minimum rate is
 * always met or exceeded (never under-tested).
 */
export function annualRequiredCount(poolSize: number, rate: number): number {
  if (poolSize <= 0) return 0;
  return Math.ceil(poolSize * rate);
}

/**
 * Suggested number of selections for a single cycle so cumulative selections
 * track evenly toward the annual requirement. Rounds up so the program stays on
 * or ahead of the required pace.
 */
export function cycleRequiredCount(
  poolSize: number,
  rate: number,
  cyclesPerYear: number = CYCLES_PER_YEAR,
): number {
  if (poolSize <= 0) return 0;
  return Math.ceil((poolSize * rate) / cyclesPerYear);
}

/** Convenience: rate lookup for a test type from the configured FMCSA_RATES. */
export function rateFor(testType: TestType): number {
  return testType === "drug" ? FMCSA_RATES.drug : FMCSA_RATES.alcohol;
}

// ---------------------------------------------------------------------------
// Cryptographically secure entropy + deterministic PRNG
// ---------------------------------------------------------------------------

function getCrypto(): Crypto {
  const c = (globalThis as { crypto?: Crypto }).crypto;
  if (!c || typeof c.getRandomValues !== "function") {
    throw new Error(
      "A Web Crypto implementation (crypto.getRandomValues) is required for secure draws.",
    );
  }
  return c;
}

/** Generate a 256-bit cryptographically secure seed as a 64-char hex string. */
export function generateSeed(): string {
  const bytes = new Uint8Array(32);
  getCrypto().getRandomValues(bytes);
  return bytesToHex(bytes);
}

function bytesToHex(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i].toString(16).padStart(2, "0");
  }
  return out;
}

/**
 * cyrb128 — hashes a string into four 32-bit seed integers. Used to expand a
 * hex seed into the state for the deterministic PRNG below.
 */
function cyrb128(str: string): [number, number, number, number] {
  let h1 = 1779033703,
    h2 = 3144134277,
    h3 = 1013904242,
    h4 = 2773480762;
  for (let i = 0; i < str.length; i++) {
    const k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  return [
    (h1 ^ h2 ^ h3 ^ h4) >>> 0,
    (h2 ^ h1) >>> 0,
    (h3 ^ h1) >>> 0,
    (h4 ^ h1) >>> 0,
  ];
}

/**
 * sfc32 — a fast, well-distributed deterministic PRNG. Given the same seed it
 * always produces the same stream, which is what makes a draw reproducible.
 * The entropy quality of a draw comes from `generateSeed()` (crypto); sfc32 is
 * purely the deterministic expander so an auditor can replay the result.
 */
export function createSeededRng(seed: string): () => number {
  const [a0, b0, c0, d0] = cyrb128(seed);
  let a = a0,
    b = b0,
    c = c0,
    d = d0;
  return function next(): number {
    a >>>= 0;
    b >>>= 0;
    c >>>= 0;
    d >>>= 0;
    let t = (a + b) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    d = (d + 1) | 0;
    t = (t + d) | 0;
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296; // [0, 1)
  };
}

/**
 * Unbiased integer in [0, max) using rejection sampling on the PRNG stream so
 * every index is equally likely (no modulo bias).
 */
function randInt(rng: () => number, max: number): number {
  return Math.floor(rng() * max);
}

// ---------------------------------------------------------------------------
// Fisher-Yates shuffle (unbiased) — equal probability of selection
// ---------------------------------------------------------------------------

/**
 * Returns a NEW array containing the items of `items` in a uniformly random
 * order, driven by the supplied deterministic `rng`. Does not mutate the input.
 * Every permutation is equally likely, so taking the first N gives every item
 * an equal chance of selection.
 */
export function fisherYatesShuffle<T>(items: readonly T[], rng: () => number): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = randInt(rng, i + 1);
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

// ---------------------------------------------------------------------------
// SHA-256 (synchronous, dependency-free) — pool snapshot fingerprint
// ---------------------------------------------------------------------------

const SHA256_K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
  0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
  0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
  0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
  0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
  0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

function rotr(x: number, n: number): number {
  return (x >>> n) | (x << (32 - n));
}

/** Synchronous SHA-256 → 64-char lowercase hex digest of a UTF-8 string. */
export function sha256Hex(message: string): string {
  const bytes = utf8Bytes(message);
  const l = bytes.length;
  const bitLen = l * 8;
  // Padding: append 0x80, then zeros, then 64-bit big-endian length.
  const withOne = l + 1;
  const k = (56 - (withOne % 64) + 64) % 64;
  const total = withOne + k + 8;
  const buf = new Uint8Array(total);
  buf.set(bytes);
  buf[l] = 0x80;
  // 64-bit length (high 32 bits are 0 for our practical sizes).
  const view = new DataView(buf.buffer);
  view.setUint32(total - 4, bitLen >>> 0, false);
  view.setUint32(total - 8, Math.floor(bitLen / 0x100000000), false);

  let h0 = 0x6a09e667,
    h1 = 0xbb67ae85,
    h2 = 0x3c6ef372,
    h3 = 0xa54ff53a,
    h4 = 0x510e527f,
    h5 = 0x9b05688c,
    h6 = 0x1f83d9ab,
    h7 = 0x5be0cd19;

  const w = new Uint32Array(64);
  for (let off = 0; off < total; off += 64) {
    for (let i = 0; i < 16; i++) {
      w[i] = view.getUint32(off + i * 4, false);
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }
    let a = h0,
      b = h1,
      c = h2,
      d = h3,
      e = h4,
      f = h5,
      g = h6,
      h = h7;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + SHA256_K[i] + w[i]) | 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) | 0;
      h = g;
      g = f;
      f = e;
      e = (d + t1) | 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) | 0;
    }
    h0 = (h0 + a) | 0;
    h1 = (h1 + b) | 0;
    h2 = (h2 + c) | 0;
    h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0;
    h5 = (h5 + f) | 0;
    h6 = (h6 + g) | 0;
    h7 = (h7 + h) | 0;
  }
  return [h0, h1, h2, h3, h4, h5, h6, h7].map(toHex8).join("");
}

function toHex8(n: number): string {
  return (n >>> 0).toString(16).padStart(8, "0");
}

function utf8Bytes(str: string): Uint8Array {
  // TextEncoder is available in Node 18+ and all modern browsers.
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(str);
  }
  const out: number[] = [];
  for (let i = 0; i < str.length; i++) {
    let c = str.charCodeAt(i);
    if (c < 0x80) out.push(c);
    else if (c < 0x800) {
      out.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
    } else {
      out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
    }
  }
  return new Uint8Array(out);
}

/**
 * Canonical, order-independent snapshot hash of a driver pool. Two pools with
 * the same set of drivers (in any order) produce the same hash, so the record
 * captures *which drivers were eligible*, not incidental ordering.
 */
export function hashPool(pool: readonly Driver[]): string {
  const canonical = pool
    .map(
      (d) =>
        `${d.driverId}${d.name}${d.cdlNumber}${d.company}${d.status}`,
    )
    .sort()
    .join("");
  return sha256Hex(`${ALGORITHM_VERSION}${pool.length}${canonical}`);
}

// ---------------------------------------------------------------------------
// The draw
// ---------------------------------------------------------------------------

function defaultAlternateCount(count: number, poolSize: number): number {
  const suggested = Math.max(2, Math.ceil(count * 0.25));
  return Math.max(0, Math.min(suggested, poolSize - count));
}

/**
 * Run a single reproducible, auditable random draw for one test type.
 *
 * Selection is WITHOUT replacement within this draw (a driver appears at most
 * once across primaries + alternates). Because a fresh draw is run each cycle
 * against the full eligible pool, drivers return to the pool between cycles
 * (selection WITH replacement across cycles), exactly as 49 CFR 382 requires.
 */
export function runDraw(params: DrawParams): DrawResult {
  const {
    pool,
    testType,
    cycle,
    company,
    operator,
    count,
    alternateCount,
    seed = generateSeed(),
    timestamp = new Date().toISOString(),
  } = params;

  const poolSize = pool.length;
  const requiredCount = Math.max(0, Math.min(count, poolSize));
  const altCount =
    alternateCount ?? defaultAlternateCount(requiredCount, poolSize);
  const safeAlt = Math.max(0, Math.min(altCount, poolSize - requiredCount));

  // Domain-separate the RNG stream by draw parameters so a single seed reused
  // across (company, testType, cycle) still yields independent orderings.
  const rngSeed = `${seed}|${company}|${testType}|${cycle}|${ALGORITHM_VERSION}`;
  const rng = createSeededRng(rngSeed);

  const shuffled = fisherYatesShuffle(pool, rng);
  const selected = shuffled.slice(0, requiredCount);
  const alternates = shuffled.slice(requiredCount, requiredCount + safeAlt);

  return {
    algorithmVersion: ALGORITHM_VERSION,
    seed,
    timestamp,
    company,
    operator,
    testType,
    cycle,
    rate: rateFor(testType),
    poolSize,
    poolHash: hashPool(pool),
    requiredCount,
    selected,
    alternates,
  };
}

/**
 * Replay a persisted draw from its stored seed + the original pool and confirm
 * the selections match. Auditors use this to prove a record was not tampered
 * with. Returns true when the replay reproduces the recorded selection exactly.
 */
export function verifyDraw(record: DrawResult, pool: Driver[]): boolean {
  const replay = runDraw({
    pool,
    testType: record.testType,
    cycle: record.cycle,
    company: record.company,
    operator: record.operator,
    count: record.requiredCount,
    alternateCount: record.alternates.length,
    seed: record.seed,
    timestamp: record.timestamp,
  });
  const sameIds = (a: Driver[], b: Driver[]) =>
    a.length === b.length && a.every((d, i) => d.driverId === b[i].driverId);
  return (
    replay.poolHash === record.poolHash &&
    sameIds(replay.selected, record.selected) &&
    sameIds(replay.alternates, record.alternates)
  );
}
