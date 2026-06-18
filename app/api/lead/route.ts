import { NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { apiError, apiSuccess, ErrorCode } from "@/lib/api-response";
import { validateLeadSignup } from "@/lib/validation";
import { SIGNUP_DISCOUNT_CODE, SIGNUP_DISCOUNT_LABEL } from "@/lib/promotions";

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/** Best-effort notification email — never blocks the lead capture. */
async function notifyTeam(lead: {
  name: string;
  email: string;
  phone: string;
  businessName: string;
  interests: string[];
  marketingOptIn: boolean;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  const from =
    process.env.RESEND_FROM_EMAIL ||
    "Hutchrok Leads <onboarding@resend.dev>";
  const text = [
    "New marketing lead sign-up (10% off promo)",
    "",
    `Name: ${lead.name}`,
    `Email: ${lead.email}`,
    `Phone: ${lead.phone || "—"}`,
    `Business: ${lead.businessName || "—"}`,
    `Interested in: ${lead.interests.length ? lead.interests.join(", ") : "—"}`,
    `Marketing opt-in: ${lead.marketingOptIn ? "Yes" : "No"}`,
    `Discount code issued: ${SIGNUP_DISCOUNT_CODE}`,
  ].join("\n");

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: ["contact@hutchrok.com"],
        reply_to: lead.email,
        subject: `New marketing lead: ${lead.name}`,
        text,
      }),
    });
  } catch (e) {
    console.error("[api/lead] team notification failed:", e);
  }
}

/**
 * POST /api/lead
 *
 * Captures a marketing lead / new-account sign-up and issues the 10%-off
 * marketing-services welcome code. Public + rate limited.
 */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = rateLimit(`lead:${ip}`, { limit: 5, windowMs: 60_000 });
  if (!rl.allowed) {
    return apiError(
      ErrorCode.RATE_LIMITED,
      "Too many requests. Please wait a moment and try again.",
      429,
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError(ErrorCode.BAD_REQUEST, "Invalid JSON body.", 400);
  }

  const validation = validateLeadSignup(body);
  if (!validation.success) {
    return apiError(
      ErrorCode.VALIDATION_ERROR,
      "Please fix the highlighted fields.",
      400,
      validation.fieldErrors,
    );
  }

  const data = validation.data!;
  const supabase = getSupabaseServer();

  const message = [
    `Marketing lead — ${SIGNUP_DISCOUNT_LABEL} sign-up promo (code ${SIGNUP_DISCOUNT_CODE})`,
    `Interested in: ${data.interests.length ? data.interests.join(", ") : "—"}`,
    `Marketing opt-in: ${data.marketingOptIn ? "Yes" : "No"}`,
  ].join("\n");

  const { error } = await supabase.from("intake_submissions").insert({
    name: data.name,
    email: data.email,
    phone: data.phone || null,
    business_stage: "lead",
    service_needed: "marketing-lead",
    business_name: data.businessName || null,
    message,
  });

  if (error) {
    console.error("[api/lead] insert failed:", error.code, error.message);
    return apiError(
      ErrorCode.INTERNAL_ERROR,
      "Failed to save your sign-up. Please try again.",
      500,
    );
  }

  // Fire-and-forget; do not block or fail the request on email errors.
  await notifyTeam({
    name: data.name,
    email: data.email,
    phone: data.phone,
    businessName: data.businessName,
    interests: data.interests,
    marketingOptIn: data.marketingOptIn,
  });

  return apiSuccess(
    {
      message: "You're signed up.",
      discountCode: SIGNUP_DISCOUNT_CODE,
      discountLabel: SIGNUP_DISCOUNT_LABEL,
    },
    201,
  );
}
