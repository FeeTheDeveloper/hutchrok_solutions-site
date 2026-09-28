import { NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { apiError, apiSuccess, ErrorCode } from "@/lib/api-response";
import { validateContactMessage } from "@/lib/validation";
import { emailFrom, isEmailEnabled, TEAM_INBOX } from "@/lib/email/config";
import { emitSiteSignal } from "@/lib/os/bridge";

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/** Fallback when Hutchrok OS is not connected: notify the team inbox directly. */
async function notifyTeamDirectly(msg: {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}) {
  if (!isEmailEnabled()) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: emailFrom(),
        to: [TEAM_INBOX],
        reply_to: msg.email,
        subject: `Website message: ${msg.subject}`,
        text: [
          `From: ${msg.name} <${msg.email}>`,
          `Phone: ${msg.phone || "—"}`,
          "",
          msg.message,
        ].join("\n"),
      }),
    });
  } catch (e) {
    console.error("[api/contact] team notification failed:", e);
  }
}

/**
 * POST /api/contact
 *
 * General "Send us a message" form. Persists the message, then hands it to
 * Hutchrok OS, which acknowledges the sender from the OS mailbox, routes it
 * to the right desk, and drafts a reply for operator approval.
 * Public + rate limited + honeypot.
 */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = rateLimit(`contact:${ip}`, { limit: 5, windowMs: 60_000 });
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

  const validation = validateContactMessage(body);
  if (!validation.success) {
    // Honeypot hits get a quiet success so bots learn nothing.
    if (validation.fieldErrors?.website) {
      return apiSuccess({ message: "Message received." }, 201);
    }
    return apiError(
      ErrorCode.VALIDATION_ERROR,
      "Please fix the highlighted fields.",
      400,
      validation.fieldErrors,
    );
  }

  const data = validation.data!;
  const supabase = getSupabaseServer();
  const { error } = await supabase.from("intake_submissions").insert({
    name: data.name,
    email: data.email,
    phone: data.phone || "",
    business_stage: "contact",
    service_needed: "contact-message",
    message: `${data.subject}\n\n${data.message}`,
  });

  if (error) {
    console.error("[api/contact] insert failed:", error.code, error.message);
    return apiError(
      ErrorCode.INTERNAL_ERROR,
      "We couldn't send your message right now. Please try again, or email contact@hutchrok.com.",
      500,
    );
  }

  const deliveredToOs = await emitSiteSignal({
    type: "contact.submitted",
    contact: { name: data.name, email: data.email, ...(data.phone ? { phone: data.phone } : {}) },
    subject: data.subject,
    message: data.message,
    data: { page: "/contact" },
  });
  if (!deliveredToOs) {
    await notifyTeamDirectly(data);
  }

  return apiSuccess({ message: "Message received." }, 201);
}
