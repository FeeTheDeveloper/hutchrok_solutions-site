"use client";

/**
 * The operator draw workflow:
 *   1. Upload & validate a roster CSV (client-side only — no PII leaves browser)
 *   2. Preview / save the pool
 *   3. Pick company (or consortium), test type, cycle
 *   4. Run the secure draw and review selected + alternate drivers
 */
import { useMemo, useRef, useState } from "react";
import { useDot } from "./provider";
import {
  Field,
  GoldButton,
  GoldCheck,
  Panel,
  selectClass,
} from "./brand";
import { parseRosterCsv, eligibleDrivers, type CsvParseResult } from "@/lib/dot/csv";
import {
  CONSORTIUM_KEY,
  CONSORTIUM_LABEL,
  drawParamsSchema,
  type AuditRecord,
  type DriverInput,
  type TestSelection,
} from "@/lib/dot/types";
import { buildDraw, requiredCountFor, testTypesFor } from "@/lib/dot/draw";
import { CYCLES, type Cycle } from "@/lib/selection";
import { currentCycle, RATE_YEAR } from "@/lib/dot/tracker";
import { SelectionResults } from "./selection-results";

type Stage = "roster" | "configure";

export function DrawWorkspace() {
  const { pools, savePool, appendRecords } = useDot();

  // Roster upload state
  const [parsed, setParsed] = useState<CsvParseResult | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Draw config state
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [testSelection, setTestSelection] = useState<TestSelection>("both");
  const [cycle, setCycle] = useState<Cycle>(currentCycle());
  const [operator, setOperator] = useState("");
  const [override, setOverride] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);
  const [justDrew, setJustDrew] = useState<AuditRecord[] | null>(null);

  const stage: Stage = pools.length > 0 ? "configure" : "roster";

  async function handleFile(file: File) {
    setFileName(file.name);
    const text = await file.text();
    const result = parseRosterCsv(text);
    setParsed(result);
    // Infer company name from the roster if consistent.
    const companies = new Set(result.drivers.map((d) => d.company));
    if (companies.size === 1) setCompanyName([...companies][0]);
  }

  async function handleSavePool() {
    if (!parsed || parsed.drivers.length === 0) return;
    const name = companyName.trim() || "Unnamed Company";
    await savePool(name, parsed.drivers);
    setParsed(null);
    setFileName("");
    setCompanyName("");
    if (fileRef.current) fileRef.current.value = "";
    setSelectedCompany(name);
  }

  // ---- Pool resolution for the configured draw ----
  const activePool: DriverInput[] = useMemo(() => {
    if (selectedCompany === CONSORTIUM_KEY) {
      return pools.flatMap((p) => p.drivers);
    }
    return pools.find((p) => p.company === selectedCompany)?.drivers ?? [];
  }, [pools, selectedCompany]);

  const eligible = useMemo(() => eligibleDrivers(activePool), [activePool]);

  const drawLabel =
    selectedCompany === CONSORTIUM_KEY ? CONSORTIUM_LABEL : selectedCompany;

  const preview = useMemo(() => {
    if (eligible.length === 0) return null;
    return testTypesFor(testSelection).map((t) => ({
      testType: t,
      count: requiredCountFor(
        eligible.length,
        t,
        override ? Number(override) : undefined,
      ),
    }));
  }, [eligible.length, testSelection, override]);

  async function handleRunDraw() {
    setFormError(null);
    const candidate = {
      company: drawLabel,
      isConsortium: selectedCompany === CONSORTIUM_KEY,
      testSelection,
      cycle,
      year: RATE_YEAR,
      operator,
      overrideCount: override ? Number(override) : undefined,
    };
    const validated = drawParamsSchema.safeParse(candidate);
    if (!validated.success) {
      setFormError(validated.error.issues.map((i) => i.message).join("; "));
      return;
    }
    if (!selectedCompany) {
      setFormError("Select a company or the consortium pool.");
      return;
    }
    if (eligible.length === 0) {
      setFormError("The selected pool has no active drivers.");
      return;
    }
    const { records } = buildDraw(validated.data, eligible);
    await appendRecords(records);
    setJustDrew(records);
    // Scroll results into view on next paint.
    requestAnimationFrame(() => {
      document
        .getElementById("dot-results")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <div className="space-y-6">
      {/* ---------------- Roster upload ---------------- */}
      <Panel>
        <h2 className="dot-serif mb-1 text-xl font-bold text-white">
          Roster Upload
        </h2>
        <p className="mb-4 text-sm text-[#c9d2e3]">
          CSV columns: <code className="text-[#f5d67e]">driver_id, name,
          cdl_number, company, status</code>. Parsed entirely in your browser —
          no driver PII is transmitted.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
            }}
            className="block text-sm text-[#c9d2e3] file:mr-3 file:rounded-md file:border-0 file:bg-[#122a54] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-[#f5d67e] hover:file:bg-[#1a3468]"
          />
          {fileName && (
            <span className="text-xs text-[#8a97b3]">{fileName}</span>
          )}
        </div>

        {parsed && <RosterPreview parsed={parsed} />}

        {parsed && parsed.drivers.length > 0 && (
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <Field label="Company / Pool name">
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Hutchrok Freight LLC"
                className={selectClass + " min-w-[240px]"}
              />
            </Field>
            <GoldButton onClick={handleSavePool}>
              Save pool ({parsed.drivers.length} drivers)
            </GoldButton>
          </div>
        )}
      </Panel>

      {/* ---------------- Draw configuration ---------------- */}
      {stage === "configure" && (
        <Panel>
          <h2 className="dot-serif mb-4 text-xl font-bold text-white">
            Configure Draw
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Company / Pool">
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className={selectClass}
              >
                <option value="">Select…</option>
                {pools.map((p) => (
                  <option key={p.company} value={p.company}>
                    {p.company}
                  </option>
                ))}
                <option value={CONSORTIUM_KEY}>★ {CONSORTIUM_LABEL}</option>
              </select>
            </Field>

            <Field label="Test type">
              <select
                value={testSelection}
                onChange={(e) =>
                  setTestSelection(e.target.value as TestSelection)
                }
                className={selectClass}
              >
                <option value="both">Drug + Alcohol</option>
                <option value="drug">Drug only (50%)</option>
                <option value="alcohol">Alcohol only (10%)</option>
              </select>
            </Field>

            <Field label={`Cycle (${RATE_YEAR})`}>
              <select
                value={cycle}
                onChange={(e) => setCycle(e.target.value as Cycle)}
                className={selectClass}
              >
                {CYCLES.map((c) => (
                  <option key={c} value={c}>
                    {c} {RATE_YEAR}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Operator">
              <input
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                placeholder="Your name / DER"
                className={selectClass}
              />
            </Field>
          </div>

          <div className="mt-4 flex flex-wrap items-end gap-4">
            <Field label="Override count (optional)">
              <input
                value={override}
                onChange={(e) =>
                  setOverride(e.target.value.replace(/[^0-9]/g, ""))
                }
                placeholder="auto"
                className={selectClass + " w-32"}
              />
            </Field>

            {selectedCompany && (
              <div className="rounded-md border border-[#21396b] bg-[#0a1a3f] px-4 py-2 text-sm">
                <span className="text-[#c9d2e3]">Eligible pool: </span>
                <span className="font-semibold text-white">
                  {eligible.length}
                </span>
                {preview && (
                  <span className="ml-3 text-[#c9d2e3]">
                    Will select{" "}
                    {preview
                      .map((p) => `${p.count} ${p.testType}`)
                      .join(" + ")}
                  </span>
                )}
              </div>
            )}
          </div>

          {formError && (
            <p className="mt-3 text-sm text-[#ff6b6b]">{formError}</p>
          )}

          <div className="mt-5 flex items-center gap-3">
            <GoldButton
              onClick={handleRunDraw}
              disabled={!selectedCompany || eligible.length === 0}
            >
              <GoldCheck size={18} /> Run secure random draw
            </GoldButton>
            <span className="text-xs text-[#8a97b3]">
              Cryptographic seed · Fisher–Yates · fully auditable
            </span>
          </div>
        </Panel>
      )}

      {/* ---------------- Results ---------------- */}
      {justDrew && (
        <div id="dot-results">
          <SelectionResults records={justDrew} />
        </div>
      )}
    </div>
  );
}

function RosterPreview({ parsed }: { parsed: CsvParseResult }) {
  const activeCount = eligibleDrivers(parsed.drivers).length;
  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-wrap gap-4 text-sm">
        <Badge label="Valid rows" value={parsed.drivers.length} tone="ok" />
        <Badge label="Active/eligible" value={activeCount} tone="ok" />
        <Badge
          label="Duplicates removed"
          value={parsed.duplicatesRemoved}
          tone={parsed.duplicatesRemoved ? "warn" : "muted"}
        />
        <Badge
          label="Errors"
          value={parsed.errors.length}
          tone={parsed.errors.length ? "err" : "muted"}
        />
      </div>

      {parsed.errors.length > 0 && (
        <div className="max-h-32 overflow-y-auto rounded-md border border-[#ff6b6b]/30 bg-[#ff6b6b]/5 p-3 text-xs text-[#ffb3b3]">
          {parsed.errors.slice(0, 20).map((e, i) => (
            <div key={i}>
              Row {e.row}: {e.message}
            </div>
          ))}
          {parsed.errors.length > 20 && (
            <div>…and {parsed.errors.length - 20} more</div>
          )}
        </div>
      )}

      {parsed.drivers.length > 0 && (
        <div className="max-h-56 overflow-auto rounded-md border border-[#21396b]">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-[#122a54] text-[#c9d2e3]">
              <tr>
                {["driver_id", "name", "cdl_number", "company", "status"].map(
                  (h) => (
                    <th key={h} className="px-3 py-2 font-semibold">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {parsed.drivers.slice(0, 50).map((d) => (
                <tr
                  key={d.driverId}
                  className="border-t border-[#21396b] text-white"
                >
                  <td className="px-3 py-1.5">{d.driverId}</td>
                  <td className="px-3 py-1.5">{d.name}</td>
                  <td className="px-3 py-1.5">{d.cdlNumber}</td>
                  <td className="px-3 py-1.5">{d.company}</td>
                  <td className="px-3 py-1.5">
                    <span
                      className={
                        d.status === "active"
                          ? "text-[#3ec98a]"
                          : "text-[#8a97b3]"
                      }
                    >
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {parsed.drivers.length > 50 && (
            <div className="bg-[#122a54] px-3 py-1.5 text-[11px] text-[#8a97b3]">
              Showing first 50 of {parsed.drivers.length}.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Badge({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "ok" | "warn" | "err" | "muted";
}) {
  const color =
    tone === "ok"
      ? "text-[#3ec98a]"
      : tone === "warn"
        ? "text-[#f5d67e]"
        : tone === "err"
          ? "text-[#ff6b6b]"
          : "text-[#c9d2e3]";
  return (
    <span className="text-[#c9d2e3]">
      {label}: <span className={`font-bold ${color}`}>{value}</span>
    </span>
  );
}
