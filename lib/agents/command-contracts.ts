import { z } from "zod";

export const commandAgentTypeSchema = z.enum([
  "case_action_planner",
  "service_router",
  "compliance_review",
  "client_success_draft",
  "executive_brief",
]);

export type CommandAgentType = z.infer<typeof commandAgentTypeSchema>;

export const agentSubjectTypeSchema = z.enum([
  "filing_case",
  "intake_submission",
  "internal_project",
  "corporate_record",
  "pipeline_snapshot",
]);

export type AgentSubjectType = z.infer<typeof agentSubjectTypeSchema>;

export const agentPrioritySchema = z.enum(["p0", "p1", "p2", "p3"]);
export type AgentPriority = z.infer<typeof agentPrioritySchema>;

export const commandTaskInputSchema = z
  .object({
    agentType: commandAgentTypeSchema,
    subjectType: agentSubjectTypeSchema,
    subjectId: z.string().uuid().optional(),
    objective: z.string().trim().min(10).max(4000),
    context: z.unknown().optional().default({}),
    priority: agentPrioritySchema.optional().default("p2"),
    idempotencyKey: z.string().trim().min(1).max(240).optional(),
  })
  .superRefine((input, ctx) => {
    const requiresSubjectId =
      input.subjectType === "filing_case" ||
      input.subjectType === "intake_submission";

    if (requiresSubjectId && !input.subjectId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["subjectId"],
        message: `${input.subjectType} tasks require a subjectId.`,
      });
    }

    if (
      input.agentType === "case_action_planner" &&
      input.subjectType !== "filing_case"
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["subjectType"],
        message: "case_action_planner requires subjectType filing_case.",
      });
    }

    if (
      input.agentType === "service_router" &&
      !["intake_submission", "internal_project"].includes(input.subjectType)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["subjectType"],
        message:
          "service_router requires intake_submission or internal_project.",
      });
    }

    if (
      input.agentType === "client_success_draft" &&
      !["filing_case", "intake_submission"].includes(input.subjectType)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["subjectType"],
        message:
          "client_success_draft requires filing_case or intake_submission.",
      });
    }

    if (
      input.agentType === "executive_brief" &&
      !["pipeline_snapshot", "internal_project"].includes(input.subjectType)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["subjectType"],
        message:
          "executive_brief requires pipeline_snapshot or internal_project.",
      });
    }
  });

export type CommandTaskInput = z.infer<typeof commandTaskInputSchema>;

const recommendedActionSchema = z.object({
  title: z.string().trim().min(1).max(180),
  description: z.string().trim().min(1).max(1200),
  owner: z.enum([
    "operator",
    "filing",
    "client_success",
    "technology",
    "marketing",
    "finance",
    "executive",
    "external_professional",
  ]),
  priority: agentPrioritySchema,
  requiresApproval: z.boolean(),
  dueInDays: z.number().int().min(0).max(365).nullable(),
});

const blockerSchema = z.object({
  severity: z.enum(["info", "warning", "blocker"]),
  issue: z.string().trim().min(1).max(800),
  resolution: z.string().trim().min(1).max(1200),
});

export const commandOutputSchema = z.object({
  agentType: commandAgentTypeSchema,
  summary: z.string().trim().min(1).max(2200),
  riskLevel: z.enum(["low", "medium", "high", "critical"]),
  confidence: z.enum(["low", "medium", "high"]),
  division: z.enum([
    "veteran_business_launch",
    "business_consulting_operations",
    "technology_automation",
    "branding_marketing",
    "business_credit_readiness",
    "government_contracting",
    "government_housing",
    "executive_operations",
    "unassigned",
  ]),
  factsUsed: z.array(z.string().trim().min(1).max(600)).max(25),
  assumptions: z.array(z.string().trim().min(1).max(600)).max(25),
  blockers: z.array(blockerSchema).max(25),
  recommendedActions: z.array(recommendedActionSchema).min(1).max(25),
  draft: z.string().trim().max(5000).nullable(),
  approvalRequired: z.boolean(),
  prohibitedActions: z.array(z.string().trim().min(1).max(500)).max(15),
});

export type CommandOutput = z.infer<typeof commandOutputSchema>;

export const taskApprovalSchema = z.object({
  action: z.enum(["approve", "reject", "cancel"]),
  note: z.string().trim().max(2000).optional(),
});

export type TaskApprovalInput = z.infer<typeof taskApprovalSchema>;
