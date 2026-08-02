import { z } from "zod";

export const agentTypeSchema = z.enum([
  "intake_triage",
  "case_action_planner",
  "service_router",
  "compliance_review",
  "client_success_draft",
  "executive_brief",
]);
export type AgentType = z.infer<typeof agentTypeSchema>;

export const taskStatusSchema = z.enum([
  "queued", "running", "completed", "failed", "waiting_approval",
  "approved", "rejected", "cancelled",
]);
export type TaskStatus = z.infer<typeof taskStatusSchema>;

export const prioritySchema = z.enum(["p0", "p1", "p2", "p3"]);
export type Priority = z.infer<typeof prioritySchema>;
export const approvalStatusSchema = z.enum(["not_required", "pending", "approved", "rejected"]);
export type ApprovalStatus = z.infer<typeof approvalStatusSchema>;

export const subjectTypeSchema = z.enum([
  "filing_case", "intake_submission", "internal_project", "corporate_record", "pipeline_snapshot",
]);
export type SubjectType = z.infer<typeof subjectTypeSchema>;

export const agentExecutionRequestSchema = z.object({
  agentType: agentTypeSchema.exclude(["intake_triage"]),
  subjectType: subjectTypeSchema,
  subjectId: z.string().uuid(),
  priority: prioritySchema.default("p2"),
  idempotencyKey: z.string().trim().min(1).max(240),
  input: z.record(z.string(), z.unknown()).default({}),
}).superRefine((value, ctx) => {
  if (value.agentType === "case_action_planner" && value.subjectType !== "filing_case") {
    ctx.addIssue({ code: "custom", path: ["subjectType"], message: "case_action_planner requires filing_case" });
  }
  if (value.agentType === "service_router" && !["filing_case", "intake_submission"].includes(value.subjectType)) {
    ctx.addIssue({ code: "custom", path: ["subjectType"], message: "service_router requires a case or intake" });
  }
});
export type AgentExecutionRequest = z.infer<typeof agentExecutionRequestSchema>;

export const caseActionPlannerOutputSchema = z.object({
  executiveSummary: z.string().min(1).max(2200),
  currentStage: z.string().min(1).max(200),
  blockers: z.array(z.string().max(800)).max(25),
  missingInformation: z.array(z.string().max(800)).max(25),
  recommendedActions: z.array(z.string().max(1200)).min(1).max(25),
  recommendedPriority: prioritySchema,
  suggestedOwner: z.string().min(1).max(200),
  suggestedDueDate: z.string().date().nullable(),
  humanApprovalRequired: z.boolean(),
  riskLevel: z.enum(["low", "medium", "high", "critical"]),
  reasoningSummary: z.string().min(1).max(2200),
});
export type CaseActionPlannerOutput = z.infer<typeof caseActionPlannerOutputSchema>;

export const serviceRouterOutputSchema = z.object({
  recommendedDivision: z.enum([
    "veteran_formation", "government_housing", "technology_automation",
    "branding_marketing", "business_credit_readiness", "government_contracting", "general_consulting",
  ]),
  recommendedServiceSlug: z.string().min(1).max(120).nullable(),
  recommendationSummary: z.string().min(1).max(2200),
  qualificationQuestions: z.array(z.string().max(600)).max(15),
  urgency: z.enum(["low", "normal", "high", "urgent"]),
  estimatedComplexity: z.enum(["low", "medium", "high"]),
  humanReviewRequired: z.boolean(),
  upsellAllowed: z.boolean(),
  routingNotes: z.array(z.string().max(800)).max(15),
});
export type ServiceRouterOutput = z.infer<typeof serviceRouterOutputSchema>;

export const structuredErrorResultSchema = z.object({
  code: z.string(), message: z.string(), retryable: z.boolean(),
});
export type StructuredErrorResult = z.infer<typeof structuredErrorResultSchema>;
export const redactedInputSchema = z.record(z.string(), z.unknown());
export type RedactedInput = z.infer<typeof redactedInputSchema>;

export const agentExecutionResultSchema = z.object({
  taskId: z.string().uuid(), reused: z.boolean(), status: taskStatusSchema,
});
export type AgentExecutionResult = z.infer<typeof agentExecutionResultSchema>;

export interface AgentTaskRecord {
  id: string; agentType: AgentType; subjectType: SubjectType; subjectId: string | null;
  idempotencyKey: string | null; status: TaskStatus; priority: Priority; input: unknown;
  output: unknown; requiresApproval: boolean; approvalStatus: ApprovalStatus;
  requestedBy: string; model: string | null; agentVersion: string | null;
  traceId: string | null; durationMs: number | null; errorCode: string | null;
  errorMessage: string | null; createdAt: string; updatedAt: string;
}

export const taskDecisionSchema = z.object({
  action: z.enum(["approve", "reject", "cancel"]),
  note: z.string().trim().max(2000).optional(),
});

export const taskListQuerySchema = z.object({
  status: taskStatusSchema.optional(), agentType: agentTypeSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});
