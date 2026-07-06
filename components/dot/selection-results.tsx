"use client";

/** Displays the results of a completed draw with audit metadata + exports. */
import { useState } from "react";
import { GoldButton, GoldCheck, Panel } from "./brand";
import type { AuditRecord } from "@/lib/dot/types";
import type { Driver } from "@/lib/selection";
import {
  downloadBlob,
  recordToCsv,
  recordToPdf,
} from "@/lib/dot/export";

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function DriverTable({
  drivers,
  label,
}: {
  drivers: Driver[];
  label: string;
}) {
  if (drivers.length === 0) return null;
  return (
    <div className="overflow-hidden rounded-md border border-[#21396b]">
      <table className="w-full text-left text-sm">
        <thead className="bg-[#0a1a3f] text-xs uppercase tracking-wide text-[#c9d2e3]">
          <tr>
            <th className="px-3 py-2">{label}</th>
            <th className="px-3 py-2">Driver ID</th>
            <th className="px-3 py-2">Name</th>
            <th className="px-3 py-2">CDL #</th>
            <th className="px-3 py-2">Company</th>
          </tr>
        </thead>
        <tbody>
          {drivers.map((d, i) => (
            <tr
              key={d.driverId}
              className="border-t border-[#21396b] text-white"
            >
              <td className="px-3 py-2 font-semibold text-[#f5d67e]">
                {i + 1}
              </td>
              <td className="px-3 py-2">{d.driverId}</td>
              <td className="px-3 py-2">{d.name}</td>
              <td className="px-3 py-2">{d.cdlNumber}</td>
              <td className="px-3 py-2">{d.company}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RecordCard({ record }: { record: AuditRecord }) {
  const r = record.result;
  const [busy, setBusy] = useState(false);
  const base = `dot-selection_${slug(r.company)}_${r.cycle}-${record.year}_${r.testType}`;

  async function exportPdf() {
    setBusy(true);
    try {
      const bytes = await recordToPdf(record);
      downloadBlob(bytes, `${base}.pdf`, "application/pdf");
    } finally {
      setBusy(false);
    }
  }

  function exportCsv() {
    downloadBlob(recordToCsv(record), `${base}.csv`, "text/csv");
  }

  return (
    <Panel className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-[#122a54] px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-[#f5d67e]">
              {r.testType}
            </span>
            <h3 className="dot-serif text-lg font-bold text-white">
              {r.company}
            </h3>
          </div>
          <p className="mt-1 text-xs text-[#c9d2e3]">
            {r.cycle} {record.year} · {r.selected.length} of {r.poolSize}{" "}
            eligible selected ({(r.rate * 100).toFixed(0)}% min) · operator{" "}
            {r.operator}
          </p>
        </div>
        <div className="flex gap-2">
          <GoldButton variant="outline" onClick={exportCsv}>
            Export CSV
          </GoldButton>
          <GoldButton onClick={exportPdf} disabled={busy}>
            {busy ? "Building…" : "Export PDF"}
          </GoldButton>
        </div>
      </div>

      <DriverTable drivers={r.selected} label="Primary" />
      {r.alternates.length > 0 && (
        <div>
          <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[#c9d2e3]">
            Alternates
          </div>
          <DriverTable drivers={r.alternates} label="Alt" />
        </div>
      )}

      <details className="rounded-md border border-[#21396b] bg-[#0a1a3f] p-3 text-xs">
        <summary className="cursor-pointer font-semibold text-[#c9d2e3]">
          Audit metadata
        </summary>
        <dl className="mt-2 grid grid-cols-1 gap-1 text-[#c9d2e3] sm:grid-cols-2">
          <MetaItem k="Algorithm" v={r.algorithmVersion} />
          <MetaItem k="Timestamp (ISO-8601)" v={r.timestamp} />
          <MetaItem k="Seed" v={r.seed} mono />
          <MetaItem k="Pool SHA-256" v={r.poolHash} mono />
        </dl>
      </details>
    </Panel>
  );
}

function MetaItem({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] uppercase tracking-wide text-[#8a97b3]">
        {k}
      </dt>
      <dd
        className={`truncate text-white ${mono ? "font-mono text-[11px]" : ""}`}
        title={v}
      >
        {v}
      </dd>
    </div>
  );
}

export function SelectionResults({ records }: { records: AuditRecord[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <GoldCheck size={34} pop />
        <div>
          <h2 className="dot-serif text-2xl font-bold">
            <span className="dot-gold-text">Selection complete</span>
          </h2>
          <p className="text-sm text-[#c9d2e3]">
            {records.length} draw{records.length > 1 ? "s" : ""} logged to the
            immutable audit trail.
          </p>
        </div>
      </div>
      {records.map((rec) => (
        <RecordCard key={rec.id} record={rec} />
      ))}
    </div>
  );
}
