import { NextRequest } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { apiError, apiSuccess, ErrorCode } from "@/lib/api-response";
import { unsubscribeByToken, upsertNewsletterContact } from "@/lib/newsletter";
import { emitSiteSignal } from "@/lib/os/bridge";

const subscribeSchema = z.object({
  email: z.string().trim().email("Enter a valid email.").max(320),
  name: z.string().trim().max(200).optional().default(""),
  isVeteran: z.boolean().optional(),
  interests: z.array(z.string().max(100)).max(20).optional().default([]),
  // Explicit opt-in is required; the form checkbox must be ticked.
  consent: z.literal(true, { message: "Please confirm you want to receive emails." }),
  source: z.string().trim().max(60).optional().default("newsletter"),
});

function ip(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

/** POST /api/newsletter — public, rate-limited newsletter subscribe. */
export async function POST(request: NextRequest) {
  const rl = rateLimit(`newsletter:${ip(request)}`, { limit: 5, windowMs: 60_000 });
  if (!rl.allowed) {
    return apiError(ErrorCode.RATE_LIMITED, "Too many requests. Try again shortly.", 429);
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError(ErrorCode.BAD_REQUEST, "Invalid JSON body.", 400);
  }
  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const k = String(issue.path[0] ?? "form");
      fields[k] ??= issue.message;
    }
    return apiError(ErrorCode.VALIDATION_ERROR, "Please fix the highlighted fields.", 400, fields);
  }
  const d = parsed.data;
  try {
    await upsertNewsletterContact({
      email: d.email,
      name: d.name,
      isVeteran: d.isVeteran,
      interests: d.interests,
      source: d.source,
      tags: ["newsletter", ...(d.isVeteran ? ["veteran"] : [])],
      consent: true,
    });
  } catch (e) {
    console.error("[api/newsletter] upsert failed:", e instanceof Error ? e.message : e);
    return apiError(ErrorCode.INTERNAL_ERROR, "Could not subscribe you. Please try again.", 500);
  }
  await emitSiteSignal({
    type: "newsletter.subscribed",
    contact: { name: d.name, email: d.email },
    data: { source: d.source, isVeteran: d.isVeteran ?? null, interests: d.interests },
  }).catch(() => undefined);
  return apiSuccess({ message: "You're subscribed." }, 201);
}

/** GET /api/newsletter?unsubscribe=<token> — one-click unsubscribe. */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("unsubscribe") ?? "";
  if (!z.string().uuid().safeParse(token).success) {
    return apiError(ErrorCode.BAD_REQUEST, "Invalid unsubscribe link.", 400);
  }
  try {
    const ok = await unsubscribeByToken(token);
    if (!ok) return apiError(ErrorCode.NOT_FOUND, "Subscription not found.", 404);
    return apiSuccess({ message: "You've been unsubscribed." });
  } catch (e) {
    console.error("[api/newsletter] unsubscribe failed:", e instanceof Error ? e.message : e);
    return apiError(ErrorCode.INTERNAL_ERROR, "Unsubscribe failed. Email contact@hutchrok.com.", 500);
  }
}
