/**
 * Intake triage agent (OpenAI Agents SDK)
 *
 * Reviews a newly-created veteran filing intake and produces a short,
 * staff-facing triage note: eligibility flags + recommended next steps.
 * Output is never shown or sent to the applicant — it's an internal aid
 * for the operator who picks up the case next.
 *
 * Self-disables (returns null) when OPENAI_API_KEY is not configured, and
 * never throws — triage is a best-effort assist, not a gate on intake
 * processing.
 */

import { Agent, run, setDefaultOpenAIKey } from "@openai/agents";
import { z } from "zod";
import type { getSupabaseServer } from "@/lib/supabase/server";

const TriageOutputSchema = z.object({
  eligibilitySummary: z
    .string()
    .describe("One or two sentence summary of the case's eligibility standing."),
  flags: z.array(
    z.object({
      severity: z.enum(["info", "warning", "blocker"]),
      issue: z.string(),
    }),
  ),
  recommendedNextSteps: z.array(z.string()),
});

export type IntakeTriageResult = z.infer<typeof TriageOutputSchema>;

const INSTRUCTIONS = `
You are a staff-facing triage assistant for Hutchrok Solutions Group, which
helps Texas veterans form business entities for free through the Texas
Veteran-Owned Business (VVL) program.

Review a new intake submission and produce a short, factual triage report for
the human operator who reviews this case next. You never contact the
applicant directly and your output is never shown or sent to them — it is an
internal note only.

Flag concrete eligibility risks such as:
- veteranStatus is true but fullyVeteranOwned is false (the TVC fee waiver
  requires the entity to be fully veteran-owned, so this likely disqualifies
  it from the free program even though the applicant is a veteran).
- vvlStatus is "not_started" (no Veteran Verification Letter on file yet —
  filing cannot proceed to submission without one).
- Missing or inconsistent ownerDetails (no owners listed, or roles that
  don't make sense for the stated entity type).
- entityType is not "llc" while the case still looks like it's on the free
  VVL LLC track (other entity types fall outside the current fee-waiver
  program scope).
- businessPurpose, principalAddress, or other free-text fields that look
  incomplete or like placeholder text (e.g. "N/A", "test", a few characters).

Do not invent facts not present in the data. If nothing is concerning, say so
plainly in eligibilitySummary and leave flags empty. Be concise — this is
read by a busy operator between cases.
`.trim();

function buildAgent(): Agent<undefined, typeof TriageOutputSchema> {
  return new Agent({
    name: "Intake Triage",
    instructions: INSTRUCTIONS,
    model: process.env.OPENAI_TRIAGE_MODEL || "gpt-4.1-mini",
    outputType: TriageOutputSchema,
  });
}

/** Whether the triage agent is configured to run. */
export function isTriageEnabled(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

export interface TriageIntakeInput {
  caseNumber: string;
  name: string;
  businessName: string | null;
  entityType: string | null;
  veteranStatus: boolean | null;
  vvlStatus: string | null;
  allOwnersVeterans: boolean | null;
  fullyVeteranOwned: boolean | null;
  ownerDetails: unknown;
  businessPurpose: string | null;
  principalAddress: string | null;
  launchTimeline: string | null;
}

/**
 * Run the triage agent over a new intake.
 * Returns null (never throws) if OPENAI_API_KEY is absent or the run fails.
 */
export async function runIntakeTriage(
  input: TriageIntakeInput,
): Promise<IntakeTriageResult | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    setDefaultOpenAIKey(apiKey);
    const agent = buildAgent();
    const result = await run(
      agent,
      `New intake for case ${input.caseNumber}:\n${JSON.stringify(input, null, 2)}`,
    );
    return result.finalOutput ?? null;
  } catch (err) {
    console.error("[intake-triage] agent run failed:", err);
    return null;
  }
}

/**
 * Persist a triage result to the audit log, tied to the case.
 * Best-effort — logs and swallows errors rather than throwing.
 */
export async function persistIntakeTriage(
  supabase: ReturnType<typeof getSupabaseServer>,
  caseId: string,
  result: IntakeTriageResult,
): Promise<void> {
  const { error } = await supabase.from("audit_log").insert({
    case_id: caseId,
    action: "ai_triage",
    actor: "ai-agent",
    new_value: JSON.stringify(result),
  });
  if (error) {
    console.error("[intake-triage] failed to persist triage note:", error.message);
  }
}
