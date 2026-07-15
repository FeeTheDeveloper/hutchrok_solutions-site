import { z } from "zod";
import {
  FEDERAL_ENTITY_TYPES,
  EIN_STATUSES,
  EMPLOYEE_COUNTS,
  ANNUAL_RECEIPTS_RANGES,
  SAM_ATTEMPT_STATUSES,
} from "@/lib/consulting/federal-contract-prep";

/**
 * Federal Contract Prep intake — shared Zod schema (client + server) and
 * the server-side readiness score.
 *
 * PRIVACY GUARDRAIL: this schema must never grow fields for SSN, the EIN
 * number itself, bank details, or login credentials. EIN is captured as a
 * have / don't-have status only.
 */

const optionValues = <T extends readonly { value: string }[]>(options: T) =>
  options.map((o) => o.value) as [string, ...string[]];

export const federalIntakeSchema = z.object({
  // Contact
  name: z.string().trim().min(1, "Name is required.").max(200),
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Please enter a valid email address."),
  phone: z.string().trim().min(1, "Phone number is required.").max(30),

  // Entity
  legalEntityName: z
    .string()
    .trim()
    .min(1, "Legal entity name is required.")
    .max(300),
  stateOfFormation: z
    .string()
    .trim()
    .min(2, "State of formation is required.")
    .max(60),
  entityType: z.enum(optionValues(FEDERAL_ENTITY_TYPES), {
    message: "Select an entity type.",
  }),
  einStatus: z.enum(optionValues(EIN_STATUSES), {
    message: "Select your EIN status.",
  }),

  // Business profile
  revenueLines: z
    .string()
    .trim()
    .min(1, "Tell us what your business sells.")
    .max(2000),
  employeeCount: z.enum(optionValues(EMPLOYEE_COUNTS), {
    message: "Select an employee count.",
  }),
  annualReceiptsRange: z.enum(optionValues(ANNUAL_RECEIPTS_RANGES), {
    message: "Select an annual receipts range.",
  }),
  veteranStatus: z.boolean(),

  // SAM.gov history
  samAttemptStatus: z.enum(optionValues(SAM_ATTEMPT_STATUSES), {
    message: "Select your SAM.gov status.",
  }),
  samAttemptNotes: z.string().trim().max(3000).optional().default(""),

  // Consent (TCPA-style)
  contactConsent: z.literal(true, {
    message: "Consent is required so we can contact you about your request.",
  }),
});

export type FederalIntakeInput = z.infer<typeof federalIntakeSchema>;

/** Flat field→message error map compatible with the existing UI pattern. */
export function validateFederalIntake(data: unknown): {
  success: boolean;
  data?: FederalIntakeInput;
  fieldErrors?: Record<string, string>;
} {
  const result = federalIntakeSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }

  const fieldErrors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    if (key && !fieldErrors[String(key)]) {
      fieldErrors[String(key)] = issue.message;
    }
  }
  return { success: false, fieldErrors };
}

/**
 * Server-side readiness score, 0–100.
 *
 * INTERNAL ONLY — used for lead routing and never returned to the client
 * or exposed in any API response.
 *
 * +25 has an EIN · +25 entity formed · +25 receipts documented ·
 * +25 no stalled SAM.gov attempt
 */
export function scoreFederalReadiness(
  d: Pick<
    FederalIntakeInput,
    "einStatus" | "entityType" | "annualReceiptsRange" | "samAttemptStatus"
  >,
): number {
  let score = 0;
  if (d.einStatus === "have") score += 25;
  if (d.entityType !== "not_formed") score += 25;
  if (d.annualReceiptsRange !== "not_documented") score += 25;
  if (d.samAttemptStatus !== "stalled") score += 25;
  return score;
}
