import { z } from "zod";

/**
 * Shared Zod schema for intake form validation.
 * Used on both server (API route) and client (intake-form component).
 */
export const intakeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(200, "Name must be under 200 characters."),
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Please enter a valid email address."),
  phone: z
    .string()
    .trim()
    .min(1, "Phone number is required.")
    .max(30, "Phone number is too long."),
  businessStage: z
    .string()
    .min(1, "Business stage is required."),
  serviceNeeded: z
    .string()
    .min(1, "Service selection is required."),
  message: z
    .string()
    .max(5000, "Message must be under 5,000 characters.")
    .optional()
    .default(""),
});

export type IntakeInput = z.infer<typeof intakeSchema>;

/**
 * Validate intake data and return a flat field→message error map
 * compatible with the existing UI error display.
 */
export function validateIntake(data: unknown): {
  success: boolean;
  data?: IntakeInput;
  fieldErrors?: Record<string, string>;
} {
  const result = intakeSchema.safeParse(data);
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

// ── Veteran Filing Intake Schema (Phase 2) ──

const ownerDetailSchema = z.object({
  name: z.string().trim().min(1, "Owner name is required.").max(200),
  role: z.string().trim().min(1, "Role is required.").max(100),
});

const entityTypeEnum = z.enum(["llc", "dba", "nonprofit"], {
  message: "Entity type is required.",
});

const branchOfServiceEnum = z.enum(
  ["army", "navy", "air_force", "marines", "coast_guard", "space_force", "other"],
  { message: "Branch of service is required." },
);

/** Base object schema — no refinements, used for .pick() on step schemas */
const veteranIntakeBaseSchema = z.object({
  // Step 0: Contact + Veteran Details
  name: z.string().trim().min(1, "Full legal name is required.").max(200),
  email: z.string().trim().min(1, "Email is required.").email("Enter a valid email."),
  phone: z.string().trim().min(1, "Phone number is required.").max(30),
  veteranStatus: z.literal(true, {
    message: "Veteran status must be confirmed.",
  }),
  vvlStatus: z.enum(["have_vvl", "applied", "not_started"], {
    message: "VVL status is required.",
  }),
  branchOfService: branchOfServiceEnum.optional(),
  yearsOfService: z
    .number({ message: "Years of service is required." })
    .min(0, "Years of service cannot be negative.")
    .max(50, "Years of service seems too high.")
    .optional(),
  notes: z.string().max(5000).optional().default(""),

  // Step 1: Business + Entity-specific
  businessName: z.string().trim().min(1, "Business name is required.").max(300),
  entityType: entityTypeEnum,
  dbaName: z.string().trim().max(300).optional(),
  nonprofitPurpose: z.string().trim().max(2000).optional(),
  businessPurpose: z.string().trim().min(1, "Business purpose is required.").max(1000),
  principalAddress: z.string().trim().min(1, "Principal address is required.").max(500),
  mailingAddress: z.string().max(500).optional().default(""),
  texasConfirmed: z.literal(true, {
    message: "Texas formation must be confirmed.",
  }),
  launchTimeline: z.enum(["asap", "1_3_months", "3_6_months", "6_plus_months", "not_sure"], {
    message: "Launch timeline is required.",
  }),

  // Step 2: Ownership + Filing
  allOwnersVeterans: z.boolean(),
  fullyVeteranOwned: z.boolean(),
  ownerDetails: z
    .array(ownerDetailSchema)
    .min(1, "At least one owner is required.")
    .max(10),
  organizerName: z.string().trim().min(1, "Organizer name is required.").max(200),
  organizerTitle: z.string().trim().max(200).optional().default(""),
  registeredAgentPreference: z.enum(["self", "hutchrok", "other"], {
    message: "Registered agent preference is required.",
  }),
  operatorReviewConfirmed: z.literal(true, {
    message: "Review confirmation is required.",
  }),

  // Context
  eligibilityAnswers: z.record(z.string(), z.boolean().nullable()).nullable().optional(),
});

/** Full veteran intake schema with conditional validation */
export const veteranIntakeSchema = veteranIntakeBaseSchema.superRefine((data, ctx) => {
  // Veteran-conditional: require service details
  if (data.veteranStatus === true) {
    if (!data.branchOfService) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Branch of service is required for veterans.",
        path: ["branchOfService"],
      });
    }
    if (data.yearsOfService === undefined || data.yearsOfService === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Years of service is required for veterans.",
        path: ["yearsOfService"],
      });
    }
  }

  // Entity-conditional: DBA → dbaName
  if (data.entityType === "dba") {
    if (!data.dbaName || data.dbaName.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "DBA name is required for DBA entities.",
        path: ["dbaName"],
      });
    }
  }

  // Entity-conditional: nonprofit → nonprofitPurpose
  if (data.entityType === "nonprofit") {
    if (!data.nonprofitPurpose || data.nonprofitPurpose.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Nonprofit purpose is required for nonprofit entities.",
        path: ["nonprofitPurpose"],
      });
    }
  }
});

export type VeteranIntakeInput = z.infer<typeof veteranIntakeSchema>;

/** Step-level schemas for client-side progressive validation */
export const veteranIntakeStepSchemas = [
  // Step 0: Contact + Veteran Details
  veteranIntakeBaseSchema
    .pick({
      name: true,
      email: true,
      phone: true,
      veteranStatus: true,
      vvlStatus: true,
      branchOfService: true,
      yearsOfService: true,
      notes: true,
    })
    .superRefine((data, ctx) => {
      if (data.veteranStatus === true) {
        if (!data.branchOfService) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Branch of service is required for veterans.",
            path: ["branchOfService"],
          });
        }
        if (data.yearsOfService === undefined || data.yearsOfService === null) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Years of service is required for veterans.",
            path: ["yearsOfService"],
          });
        }
      }
    }),

  // Step 1: Business + Entity-specific
  veteranIntakeBaseSchema
    .pick({
      businessName: true,
      entityType: true,
      dbaName: true,
      nonprofitPurpose: true,
      businessPurpose: true,
      principalAddress: true,
      mailingAddress: true,
      texasConfirmed: true,
      launchTimeline: true,
    })
    .superRefine((data, ctx) => {
      if (data.entityType === "dba" && (!data.dbaName || data.dbaName.trim().length === 0)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "DBA name is required for DBA entities.",
          path: ["dbaName"],
        });
      }
      if (
        data.entityType === "nonprofit" &&
        (!data.nonprofitPurpose || data.nonprofitPurpose.trim().length === 0)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Nonprofit purpose is required for nonprofit entities.",
          path: ["nonprofitPurpose"],
        });
      }
    }),

  // Step 2: Ownership + Filing
  veteranIntakeBaseSchema.pick({
    allOwnersVeterans: true,
    fullyVeteranOwned: true,
    ownerDetails: true,
    organizerName: true,
    organizerTitle: true,
    registeredAgentPreference: true,
    operatorReviewConfirmed: true,
  }),
];

/** Full veteran intake validation */
export function validateVeteranIntake(data: unknown): {
  success: boolean;
  data?: VeteranIntakeInput;
  fieldErrors?: Record<string, string>;
} {
  const result = veteranIntakeSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const fieldErrors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join(".");
    if (!fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }
  return { success: false, fieldErrors };
}

/** Step-level validation for multi-step form */
export function validateVeteranIntakeStep(
  step: number,
  data: unknown
): { success: boolean; fieldErrors?: Record<string, string> } {
  if (step < 0 || step >= veteranIntakeStepSchemas.length) {
    return { success: true };
  }
  const result = veteranIntakeStepSchemas[step].safeParse(data);
  if (result.success) return { success: true };
  const fieldErrors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join(".");
    if (!fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }
  return { success: false, fieldErrors };
}
