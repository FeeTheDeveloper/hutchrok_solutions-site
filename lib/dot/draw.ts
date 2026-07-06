/**
 * lib/dot/draw.ts
 * ----------------------------------------------------------------------------
 * Orchestrates a validated operator request into one or more auditable draw
 * records. Keeps the pure selection engine (lib/selection.ts) free of app types.
 * ----------------------------------------------------------------------------
 */
import {
  cycleRequiredCount,
  rateFor,
  runDraw,
  type Driver,
  type TestType,
} from "@/lib/selection";
import type { AuditRecord, DrawParamsInput, DriverInput } from "./types";
import { newId } from "./store";

/** The test types a selection request expands into. */
export function testTypesFor(sel: DrawParamsInput["testSelection"]): TestType[] {
  if (sel === "both") return ["drug", "alcohol"];
  return [sel];
}

/**
 * Compute the number of selections for a given test type this cycle. Uses the
 * operator override when provided, otherwise the evenly-paced cycle requirement.
 */
export function requiredCountFor(
  poolSize: number,
  testType: TestType,
  override?: number,
): number {
  if (typeof override === "number") return Math.min(override, poolSize);
  return Math.min(cycleRequiredCount(poolSize, rateFor(testType)), poolSize);
}

export interface BuildDrawResult {
  records: AuditRecord[];
}

/**
 * Run the draw(s) for a validated request against an eligible pool and return
 * immutable audit records ready to persist. Each test type gets an independent
 * draw (and its own record) so drug and alcohol selections are separate, as the
 * regulation treats them.
 */
export function buildDraw(
  params: DrawParamsInput,
  eligible: DriverInput[],
): BuildDrawResult {
  const pool: Driver[] = eligible.map((d) => ({ ...d }));
  const createdAt = new Date().toISOString();
  const testTypes = testTypesFor(params.testSelection);

  const records: AuditRecord[] = testTypes.map((testType) => {
    const count = requiredCountFor(
      pool.length,
      testType,
      params.overrideCount,
    );
    const result = runDraw({
      pool,
      testType,
      cycle: params.cycle,
      company: params.company,
      operator: params.operator,
      count,
    });
    return {
      id: newId(),
      createdAt,
      year: params.year,
      testType,
      result,
    };
  });

  return { records };
}
