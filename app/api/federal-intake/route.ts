import { NextRequest } from "next/server";
import { validateFederalIntake, scoreFederalReadiness } from "@/lib/federal-intake";
import { rateLimit } from "@/lib/rate-limit";
import { apiError, apiSuccess, ErrorCode } from "@/lib/api-response";

const isProd = process.env.NODE_ENV === "production";

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * POST /api/federal-intake
 *
 * Federal Contract Prep intake. Validates with the shared Zod schema and
 * computes the internal readiness score server-side. The score is used for
 * lead routing only and is NEVER included in the response.
 */
export async function POST(request: NextRequest) {
  try {
    // ── Rate limit (5 requests / 60s per IP) ──
    const ip = getClientIp(request);
    const rl = rateLimit(`federal-intake:${ip}`, { limit: 5, windowMs: 60_000 });
    if (!rl.allowed) {
      return apiError(
        ErrorCode.RATE_LIMITED,
        "Too many requests. Please wait a moment and try again.",
        429,
      );
    }

    // ── Parse body ──
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiError(ErrorCode.BAD_REQUEST, "Invalid JSON body.", 400);
    }

    // ── Validate ──
    const validation = validateFederalIntake(body);
    if (!validation.success) {
      return apiError(
        ErrorCode.VALIDATION_ERROR,
        "Please fix the highlighted fields.",
        400,
        validation.fieldErrors,
      );
    }

    const data = validation.data!;

    // Internal-only lead score — never returned to the client.
    const readinessScore = scoreFederalReadiness(data);

    // TODO(federal-intake-db): insert into `federal_intake_cases` once the
    // table exists (migration pending). Status enum starts at NEW, matching
    // the filing pipeline convention. Shape mirrors handleGovHousingIntake
    // in app/api/intake/route.ts:
    //
    //   const supabase = getSupabaseServer();
    //   const { data: row, error } = await supabase
    //     .from("federal_intake_cases")
    //     .insert({
    //       name: data.name,
    //       email: data.email,
    //       phone: data.phone,
    //       status: "NEW",
    //       readiness_score: readinessScore,   // internal column only
    //       detail: {
    //         legalEntityName: data.legalEntityName,
    //         stateOfFormation: data.stateOfFormation,
    //         entityType: data.entityType,
    //         einStatus: data.einStatus,       // status only — never the EIN
    //         revenueLines: data.revenueLines,
    //         employeeCount: data.employeeCount,
    //         annualReceiptsRange: data.annualReceiptsRange,
    //         veteranStatus: data.veteranStatus,
    //         samAttemptStatus: data.samAttemptStatus,
    //         samAttemptNotes: data.samAttemptNotes,
    //         contactConsent: data.contactConsent,
    //       },
    //     })
    //     .select("id")
    //     .single();

    // TODO(federal-intake-email): Resend notification to ceo@hutchrok.com,
    // following lib/email/send-paid-service-request.ts (plain-text summary,
    // reply_to = applicant). Include the readiness score in the internal
    // email body — it stays out of anything client-facing.

    if (!isProd) {
      console.log(
        "[api/federal-intake] Received intake:",
        data.legalEntityName,
        "score:",
        readinessScore,
      );
    }

    // No score, no internals — just an acknowledgement.
    return apiSuccess({ received: true }, 201);
  } catch (error) {
    console.error(
      "[api/federal-intake] Unhandled error:",
      error instanceof Error ? error.message : String(error),
    );
    return apiError(
      ErrorCode.INTERNAL_ERROR,
      "We couldn't submit your request right now. Please try again in a few minutes, or email contact@hutchrok.com.",
      503,
    );
  }
}
