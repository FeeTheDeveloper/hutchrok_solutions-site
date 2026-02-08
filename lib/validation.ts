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
