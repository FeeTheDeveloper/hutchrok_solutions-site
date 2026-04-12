import { NextRequest } from "next/server";
import { apiError, apiSuccess, ErrorCode } from "@/lib/api-response";
import { rateLimit } from "@/lib/rate-limit";
import { getSupabaseServer } from "@/lib/supabase/server";
import { sendPaidServiceRequestEmail } from "@/lib/email/send-paid-service-request";
import { validatePaidServiceRequest } from "@/lib/validation";

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = rateLimit(ip, { limit: 5, windowMs: 60_000 });

  if (!rl.allowed) {
    return apiError(
      ErrorCode.RATE_LIMITED,
      "Too many requests. Please wait a moment and try again.",
      429
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError(ErrorCode.BAD_REQUEST, "Invalid JSON body.", 400);
  }

  const validation = validatePaidServiceRequest(body);
  if (!validation.success) {
    return apiError(
      ErrorCode.VALIDATION_ERROR,
      "Please fix the highlighted fields.",
      400,
      validation.fieldErrors
    );
  }

  const data = validation.data!;
  const supabase = getSupabaseServer();

  const message = [
    `Business Name: ${data.businessName}`,
    `Selected Service: ${data.selectedService}`,
    "",
    "Project Details:",
    data.projectDetails,
  ].join("\n");

  const { error: intakeError } = await supabase.from("intake_submissions").insert({
    name: data.name,
    email: data.email,
    phone: data.phone,
    business_stage: "post-formation",
    service_needed: "paid-service",
    business_name: data.businessName,
    message,
  });

  if (intakeError) {
    console.error("[api/service-request] Supabase insert failed:", intakeError.message);
    return apiError(
      ErrorCode.INTERNAL_ERROR,
      "Failed to save your request. Please try again.",
      500
    );
  }

  try {
    await sendPaidServiceRequestEmail({
      name: data.name,
      email: data.email,
      phone: data.phone,
      businessName: data.businessName,
      selectedService: data.selectedService,
      projectDetails: data.projectDetails,
    });
  } catch (error) {
    console.error("[api/service-request] Email send failed:", error);
    return apiError(
      ErrorCode.INTERNAL_ERROR,
      "Your request was saved, but we could not deliver email to contact@hutchrok.com. Please email us directly at contact@hutchrok.com.",
      500
    );
  }

  return apiSuccess(
    {
      message: "Request submitted successfully.",
      destination: "contact@hutchrok.com",
    },
    201
  );
}
