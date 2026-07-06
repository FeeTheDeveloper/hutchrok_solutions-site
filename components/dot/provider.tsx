"use client";

/**
 * DotProvider — client-side application state for the DOT tool. Loads pools and
 * audit records from the data-layer store (localStorage in v1) and exposes
 * actions to mutate them. All child views read from this context, so swapping
 * the store implementation requires no changes here.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getStore } from "@/lib/dot/store";
import type { AuditRecord, CompanyPool, DriverInput } from "@/lib/dot/types";

interface DotContextValue {
  ready: boolean;
  pools: CompanyPool[];
  records: AuditRecord[];
  selectedCompany: string | null;
  setSelectedCompany: (company: string | null) => void;
  savePool: (company: string, drivers: DriverInput[]) => Promise<void>;
  deletePool: (company: string) => Promise<void>;
  appendRecords: (records: AuditRecord[]) => Promise<void>;
  refresh: () => Promise<void>;
}

const DotContext = createContext<DotContextValue | null>(null);

export function DotProvider({ children }: { children: React.ReactNode }) {
  const store = useMemo(() => getStore(), []);
  const [ready, setReady] = useState(false);
  const [pools, setPools] = useState<CompanyPool[]>([]);
  const [records, setRecords] = useState<AuditRecord[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [p, r] = await Promise.all([store.listPools(), store.listRecords()]);
    setPools(p);
    setRecords(r);
    setReady(true);
  }, [store]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const savePool = useCallback(
    async (company: string, drivers: DriverInput[]) => {
      await store.savePool(company, drivers);
      await refresh();
    },
    [store, refresh],
  );

  const deletePool = useCallback(
    async (company: string) => {
      await store.deletePool(company);
      setSelectedCompany((cur) => (cur === company ? null : cur));
      await refresh();
    },
    [store, refresh],
  );

  const appendRecords = useCallback(
    async (recs: AuditRecord[]) => {
      for (const rec of recs) await store.appendRecord(rec);
      await refresh();
    },
    [store, refresh],
  );

  const value: DotContextValue = {
    ready,
    pools,
    records,
    selectedCompany,
    setSelectedCompany,
    savePool,
    deletePool,
    appendRecords,
    refresh,
  };

  return <DotContext.Provider value={value}>{children}</DotContext.Provider>;
}

export function useDot(): DotContextValue {
  const ctx = useContext(DotContext);
  if (!ctx) throw new Error("useDot must be used within a DotProvider");
  return ctx;
}
