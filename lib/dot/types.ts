/**
 * lib/dot/types.ts
 * ----------------------------------------------------------------------------
 * Zod schemas + TypeScript types for the DOT random testing tool. All external
 * input (uploaded CSV rows, draw parameters) is validated here before it
 * reaches the selection engine.
 * ----------------------------------------------------------------------------
 */
import { z } from "zod";
import type { Cycle, DrawResult, TestType } from "@/lib/selection";
import { CYCLES } from "@/lib/selection";

/** Consortium (combined) pool key used when a draw spans all companies. */
export const CONSORTIUM_KEY = "__consortium__";
export const CONSORTIUM_LABEL = "Combined Consortium";

export const driverStatusSchema = z
  .string()
  .trim()
  .min(1)
  .transform((s) => s.toLowerCase());

/** A single validated driver row from an uploaded roster CSV. */
export const driverSchema = z.object({
  driverId: z.string().trim().min(1, "driver_id is required"),
  name: z.string().trim().min(1, "name is required"),
  cdlNumber: z.string().trim().min(1, "cdl_number is required"),
  company: z.string().trim().min(1, "company is required"),
  status: driverStatusSchema,
});
export type DriverInput = z.infer<typeof driverSchema>;

export const testTypeSchema = z.enum(["drug", "alcohol"]);
export const testSelectionSchema = z.enum(["drug", "alcohol", "both"]);
export type TestSelection = z.infer<typeof testSelectionSchema>;

export const cycleSchema = z.enum(
  CYCLES as unknown as [Cycle, ...Cycle[]],
);

/** Parameters an operator submits to run a draw. */
export const drawParamsSchema = z.object({
  company: z.string().trim().min(1),
  isConsortium: z.boolean().default(false),
  testSelection: testSelectionSchema,
  cycle: cycleSchema,
  year: z.number().int().min(2020).max(2100),
  operator: z.string().trim().min(1, "Operator name is required"),
  /** Optional manual override of the required count; defaults to the computed value. */
  overrideCount: z.number().int().min(0).optional(),
});
export type DrawParamsInput = z.infer<typeof drawParamsSchema>;

/** Expected CSV header columns (snake_case as delivered by roster exports). */
export const CSV_COLUMNS = [
  "driver_id",
  "name",
  "cdl_number",
  "company",
  "status",
] as const;

/** An immutable audit record: a DrawResult plus persistence metadata. */
export interface AuditRecord {
  id: string;
  createdAt: string; // ISO-8601, when the record was written
  year: number;
  testType: TestType;
  result: DrawResult;
}

export interface CompanyPool {
  company: string;
  drivers: DriverInput[];
  updatedAt: string;
}

/** Per-company, per-test-type YTD progress toward the annual required rate. */
export interface RateProgress {
  company: string;
  testType: TestType;
  rate: number;
  poolSize: number;
  requiredYtd: number;
  completedYtd: number;
  onTrack: boolean;
  percent: number; // 0..100 of required met
}
