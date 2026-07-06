"use client";

/** Immutable audit trail with per-record and bulk export. */
import { useMemo, useState } from "react";
import { useDot } from "./provider";
import { GoldButton, Panel } from "./brand";
import { downloadBlob, recordsToCsv, recordToCsv, recordToPdf } from "@/lib/dot/export";
import { RATE_YEAR } from "@/lib/dot/tracker";

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function AuditWorkspace() {
  const { ready, records } = useDot();
  const [filter, setFilter] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return records;
    return records.filter(
      (r) =>
        r.result.company.toLowerCase().includes(q) ||
        r.result.operator.toLowerCase().includes(q) ||
        r.testType.includes(q) ||
        r.result.cycle.toLowerCase().includes(q),
    );
  }, [records, filter]);

  async function exportPdf(id: string) {
    const rec = records.find((r) => r.id === id);
    if (!rec) return;
    setBusyId(id);
    try {
      const bytes = await recordToPdf(rec);
      const base = `dot-selection_${slug(rec.result.company)}_${rec.result.cycle}-${rec.year}_${rec.testType}`;
      downloadBlob(bytes, `${base}.pdf`, "application/pdf");
    } finally {
      setBusyId(null);
    }
  }

  if (!ready) return <p className="text-[#c9d2e3]">Loading…</p>;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="dot-serif text-xl font-bold text-white">
            Audit Trail
          </h2>
          <p className="text-sm text-[#c9d2e3]">
            Immutable, append-only record of every draw. {records.length} total.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter company / operator / cycle"
            className="w-64 rounded-md border border-[#21396b] bg-[#0a1a3f] px-3 py-2 text-sm text-white outline-none focus:border-[#d4af37]"
          />
          <GoldButton
            variant="outline"
            disabled={records.length === 0}
            onClick={() =>
              downloadBlob(
                recordsToCsv(records),
                `dot-audit-trail_${RATE_YEAR}.csv`,
                "text/csv",
              )
            }
          >
            Export all (CSV)
          </GoldButton>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Panel className="text-center text-sm text-[#c9d2e3]">
          No draws recorded yet.
        </Panel>
      ) : (
        <div className="overflow-hidden rounded-md border border-[#21396b]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#122a54] text-xs uppercase tracking-wide text-[#c9d2e3]">
              <tr>
                <th className="px-3 py-2.5">Timestamp</th>
                <th className="px-3 py-2.5">Company</th>
                <th className="px-3 py-2.5">Type</th>
                <th className="px-3 py-2.5">Cycle</th>
                <th className="px-3 py-2.5">Selected</th>
                <th className="px-3 py-2.5">Operator</th>
                <th className="px-3 py-2.5">Seed</th>
                <th className="px-3 py-2.5 text-right">Export</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((rec) => (
                <tr
                  key={rec.id}
                  className="border-t border-[#21396b] align-top text-white"
                >
                  <td className="px-3 py-2.5 text-xs text-[#c9d2e3]">
                    {rec.result.timestamp.replace("T", " ").slice(0, 19)}
                  </td>
                  <td className="px-3 py-2.5">{rec.result.company}</td>
                  <td className="px-3 py-2.5">
                    <span className="rounded bg-[#0a1a3f] px-1.5 py-0.5 text-xs font-semibold uppercase text-[#f5d67e]">
                      {rec.testType}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    {rec.result.cycle} {rec.year}
                  </td>
                  <td className="px-3 py-2.5">
                    {rec.result.selected.length}
                    <span className="text-[#8a97b3]">
                      {" "}
                      / {rec.result.poolSize}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">{rec.result.operator}</td>
                  <td
                    className="max-w-[120px] truncate px-3 py-2.5 font-mono text-[11px] text-[#8a97b3]"
                    title={rec.result.seed}
                  >
                    {rec.result.seed.slice(0, 12)}…
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => {
                          const base = `dot-selection_${slug(rec.result.company)}_${rec.result.cycle}-${rec.year}_${rec.testType}`;
                          downloadBlob(
                            recordToCsv(rec),
                            `${base}.csv`,
                            "text/csv",
                          );
                        }}
                        className="dot-btn-outline rounded px-2 py-1 text-xs"
                      >
                        CSV
                      </button>
                      <button
                        onClick={() => exportPdf(rec.id)}
                        disabled={busyId === rec.id}
                        className="dot-btn-gold rounded px-2 py-1 text-xs disabled:opacity-50"
                      >
                        {busyId === rec.id ? "…" : "PDF"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
