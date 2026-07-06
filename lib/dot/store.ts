/**
 * lib/dot/store.ts
 * ----------------------------------------------------------------------------
 * Data layer behind an interface. v1 ships a browser localStorage implementation
 * (no server, no env vars). A Supabase (or any server) implementation can be
 * dropped in later by implementing DotStore — the UI depends only on the
 * interface, so no UI refactor is required.
 * ----------------------------------------------------------------------------
 */
import type { AuditRecord, CompanyPool, DriverInput } from "./types";

export interface DotStore {
  listPools(): Promise<CompanyPool[]>;
  getPool(company: string): Promise<CompanyPool | null>;
  savePool(company: string, drivers: DriverInput[]): Promise<CompanyPool>;
  deletePool(company: string): Promise<void>;

  listRecords(): Promise<AuditRecord[]>;
  appendRecord(record: AuditRecord): Promise<void>;
}

const POOLS_KEY = "vetgang.dot.pools.v1";
const RECORDS_KEY = "vetgang.dot.records.v1";

function nowIso(): string {
  return new Date().toISOString();
}

/** Small random id without external deps; audit integrity comes from the seed/hash. */
export function newId(): string {
  const c = (globalThis as { crypto?: Crypto }).crypto;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  const bytes = new Uint8Array(16);
  (c ?? ({ getRandomValues: () => bytes } as unknown as Crypto)).getRandomValues(
    bytes,
  );
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * localStorage-backed store. All reads/writes are synchronous under the hood but
 * exposed as Promises to match the interface a network-backed store will use.
 */
export class LocalDotStore implements DotStore {
  private read<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  }

  private write<T>(key: string, value: T): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  async listPools(): Promise<CompanyPool[]> {
    return this.read<CompanyPool[]>(POOLS_KEY, []);
  }

  async getPool(company: string): Promise<CompanyPool | null> {
    const pools = await this.listPools();
    return pools.find((p) => p.company === company) ?? null;
  }

  async savePool(
    company: string,
    drivers: DriverInput[],
  ): Promise<CompanyPool> {
    const pools = await this.listPools();
    const pool: CompanyPool = { company, drivers, updatedAt: nowIso() };
    const idx = pools.findIndex((p) => p.company === company);
    if (idx >= 0) pools[idx] = pool;
    else pools.push(pool);
    pools.sort((a, b) => a.company.localeCompare(b.company));
    this.write(POOLS_KEY, pools);
    return pool;
  }

  async deletePool(company: string): Promise<void> {
    const pools = (await this.listPools()).filter(
      (p) => p.company !== company,
    );
    this.write(POOLS_KEY, pools);
  }

  async listRecords(): Promise<AuditRecord[]> {
    const records = this.read<AuditRecord[]>(RECORDS_KEY, []);
    return records.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  /** Append-only: existing records are never mutated or deleted. */
  async appendRecord(record: AuditRecord): Promise<void> {
    const records = this.read<AuditRecord[]>(RECORDS_KEY, []);
    records.push(record);
    this.write(RECORDS_KEY, records);
  }
}

/** Singleton used by the UI. Swap this factory to change backends. */
let _store: DotStore | null = null;
export function getStore(): DotStore {
  if (!_store) _store = new LocalDotStore();
  return _store;
}
