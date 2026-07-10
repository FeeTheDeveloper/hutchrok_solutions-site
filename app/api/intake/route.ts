import { NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import {
  validateIntake,
  validateVeteranIntake,
  validateGovHousingIntake,
} from "@/lib/validation";
import { routeGovHousingIntake } from "@/lib/consulting/gov-housing";
import { rateLimit } from "@/lib/rate-limit";
import { apiError, apiSuccess, ErrorCode } from "@/lib/api-response";

const isProd = process.env.NODE_ENV === "production";

/**
 * Generate a unique case number: HSG-YYYY-XXXX
 * Uses random 4-digit suffix with collision retry.
 */
async function generateCaseNumber(
  supabase: ReturnType<typeof getSupabaseServer>
): Promise<string> {
  const year = new Date().getFullYear();
  const maxAttempts = 10;

  for (let i = 0; i < maxAttempts; i++) {
    const seq = String(Math.floor(1000 + Math.random() * 9000)); // 1000–9999
    const caseNumber = `HSG-${year}-${seq}`;

    const { data } = await supabase
      .from("filing_cases")
      .select("id")
      .eq("case_number", caseNumber)
      .maybeSingle();

    if (!data) return caseNumber;
  }

  // Fallback: timestamp-based to guarantee uniqueness
  const ts = Date.now().toString(36).toUpperCase();
  return `HSG-${year}-${ts}`;
}

/**
 * Extract client IP for rate limiting.
 */
function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(request: NextRequest) {
  try {
    // ── Rate limit (5 requests / 60s per IP) ──
    const ip = getClientIp(request);
    const rl = rateLimit(ip, { limit: 5, windowMs: 60_000 });

    if (!rl.allowed) {
      return apiError(
        ErrorCode.RATE_LIMITED,
        "Too many requests. Please wait a moment and try again.",
        429
      );
    }

    // ── Parse body ──
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiError(ErrorCode.BAD_REQUEST, "Invalid JSON body.", 400);
    }

    // ── Detect intake type and validate ──
    const asObject =
      body !== null && typeof body === "object"
        ? (body as Record<string, unknown>)
        : {};

    // Gov-housing consulting is checked first — it also carries a
    // `veteranStatus` field, so it must win over the veteran-filing branch.
    const isGovHousing = asObject.formType === "gov-housing-consulting";
    const isVeteranIntake = "veteranStatus" in asObject;

    const supabase = getSupabaseServer();

    if (isGovHousing) {
      return handleGovHousingIntake(body, supabase);
    }
    if (isVeteranIntake) {
      return handleVeteranIntake(body, supabase);
    }
    return handleLegacyIntake(body, supabase);
  } catch (error) {
    // Log the message (not the full object/stack) even in prod — this is
    // almost always our own config error (e.g. "Missing required environment
    // variable: SUPABASE_ANON_KEY"), which is safe to surface and essential
    // for diagnosing a broken deployment.
    console.error(
      "[api/intake] Unhandled error:",
      error instanceof Error ? error.message : String(error),
    );
    // A thrown error here is almost always infrastructure (database
    // unreachable / missing config), not bad user input — so don't tell the
    // applicant their submission is "invalid". Give them a real path forward.
    return apiError(
      ErrorCode.INTERNAL_ERROR,
      "We couldn't submit your application right now. Please try again in a few minutes. If this keeps happening, email us at contact@hutchrok.com and we'll help you finish.",
      503
    );
  }
}

// ── Veteran filing intake path ──

async function handleVeteranIntake(
  body: unknown,
  supabase: ReturnType<typeof getSupabaseServer>
) {
  const validation = validateVeteranIntake(body);
  if (!validation.success) {
    return apiError(
      ErrorCode.VALIDATION_ERROR,
      "Please fix the highlighted fields.",
      400,
      validation.fieldErrors
    );
  }

  const data = validation.data!;

  // 1. Insert intake submission with veteran-specific fields
  const { data: intake, error: intakeError } = await supabase
    .from("intake_submissions")
    .insert({
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.notes || null,
      // Legacy fields populated for backward compatibility
      business_stage: "veteran-filing",
      service_needed: "formation",
      // Veteran fields
      veteran_status: data.veteranStatus,
      vvl_status: data.vvlStatus,
      branch_of_service: data.branchOfService || null,
      years_of_service: data.yearsOfService ?? null,
      business_name: data.businessName,
      entity_type: data.entityType,
      dba_name: data.dbaName || null,
      nonprofit_purpose: data.nonprofitPurpose || null,
      business_purpose: data.businessPurpose,
      principal_address: data.principalAddress,
      mailing_address: data.mailingAddress || null,
      texas_confirmed: data.texasConfirmed,
      launch_timeline: data.launchTimeline,
      all_owners_veterans: data.allOwnersVeterans,
      fully_veteran_owned: data.fullyVeteranOwned,
      owner_details: data.ownerDetails,
      organizer_name: data.organizerName,
      organizer_title: data.organizerTitle || null,
      registered_agent_preference: data.registeredAgentPreference,
      operator_review_confirmed: data.operatorReviewConfirmed,
      eligibility_answers: data.eligibilityAnswers || null,
    })
    .select("id")
    .single();

  if (intakeError || !intake) {
    console.error(
      "[api/intake] Veteran intake insert error:",
      intakeError?.code,
      intakeError?.message
    );
    return apiError(
      ErrorCode.INTERNAL_ERROR,
      "We couldn't save your application right now. Please try again in a few minutes, or email contact@hutchrok.com.",
      503
    );
  }

  // 2. Create filing case linked to the intake
  const caseNumber = await generateCaseNumber(supabase);

  const { data: filingCase, error: caseError } = await supabase
    .from("filing_cases")
    .insert({
      intake_id: intake.id,
      case_number: caseNumber,
      status: "LEAD",
    })
    .select("id, case_number")
    .single();

  if (caseError || !filingCase) {
    console.error(
      "[api/intake] Case creation error:",
      caseError?.code,
      caseError?.message
    );
    return apiSuccess(
      { intakeId: intake.id, caseNumber: null, caseId: null },
      201
    );
  }

  if (!isProd) {
    console.log("[api/intake] Created veteran case:", filingCase.case_number);
  }

  return apiSuccess(
    {
      caseNumber: filingCase.case_number,
      caseId: filingCase.id,
    },
    201
  );
}

// ── Gov-Housing Consulting intake path ──

async function handleGovHousingIntake(
  body: unknown,
  supabase: ReturnType<typeof getSupabaseServer>
) {
  const validation = validateGovHousingIntake(body);
  if (!validation.success) {
    return apiError(
      ErrorCode.VALIDATION_ERROR,
      "Please fix the highlighted fields.",
      400,
      validation.fieldErrors
    );
  }

  const data = validation.data!;
  const routing = routeGovHousingIntake({
    occupancy: data.occupancy,
    condition: data.condition,
    knowsPHA: data.knowsPHA,
    interestScope: data.interestScope,
  });

  // Everything beyond core contact goes into the structured detail blob.
  const intakeDetail = {
    titleHolding: data.titleHolding,
    veteranStatus: data.veteranStatus,
    propertyAddress: data.propertyAddress,
    propertyCity: data.propertyCity,
    propertyZip: data.propertyZip,
    propertyType: data.propertyType,
    unitsAvailable: data.unitsAvailable ?? null,
    bedrooms: data.bedrooms,
    bathrooms: data.bathrooms,
    yearBuilt: data.yearBuilt ?? null,
    condition: data.condition,
    occupancy: data.occupancy,
    targetRent: data.targetRent ?? null,
    section8Before: data.section8Before,
    registeredWithPHA: data.registeredWithPHA,
    knowsPHA: data.knowsPHA,
    phaName: data.phaName,
    placementTimeline: data.placementTimeline,
    interestScope: data.interestScope,
    samStatus: data.samStatus ?? null,
    uei: data.uei,
    govContractExperience: data.govContractExperience,
    successOutcome: data.successOutcome,
    budgetAuthorityConfirmed: data.budgetAuthorityConfirmed,
    preferredChannel: data.preferredChannel,
    routing,
  };

  const { data: intake, error: intakeError } = await supabase
    .from("intake_submissions")
    .insert({
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: `Gov-Housing Consulting — ${routing.label}. Success in 12 months: ${data.successOutcome}`,
      business_stage: "consulting",
      service_needed: "gov-housing-consulting",
      veteran_status: data.veteranStatus,
      intake_detail: intakeDetail,
    })
    .select("id")
    .single();

  if (intakeError || !intake) {
    console.error(
      "[api/intake] Gov-housing insert error:",
      intakeError?.code,
      intakeError?.message
    );
    return apiError(
      ErrorCode.INTERNAL_ERROR,
      "We couldn't save your request right now. Please try again in a few minutes, or email contact@hutchrok.com.",
      503
    );
  }

  const caseNumber = await generateCaseNumber(supabase);
  const { data: filingCase, error: caseError } = await supabase
    .from("filing_cases")
    .insert({ intake_id: intake.id, case_number: caseNumber, status: "LEAD" })
    .select("id, case_number")
    .single();

  if (caseError || !filingCase) {
    console.error(
      "[api/intake] Gov-housing case creation error:",
      caseError?.code,
      caseError?.message
    );
    return apiSuccess(
      { intakeId: intake.id, caseNumber: null, caseId: null, pathway: routing.pathway },
      201
    );
  }

  return apiSuccess(
    {
      caseNumber: filingCase.case_number,
      caseId: filingCase.id,
      pathway: routing.pathway,
    },
    201
  );
}

// ── Legacy intake path (preserved for backward compatibility) ──

async function handleLegacyIntake(
  body: unknown,
  supabase: ReturnType<typeof getSupabaseServer>
) {
  const validation = validateIntake(body);
  if (!validation.success) {
    return apiError(
      ErrorCode.VALIDATION_ERROR,
      "Please fix the highlighted fields.",
      400,
      validation.fieldErrors
    );
  }

  const data = validation.data!;

  const { data: intake, error: intakeError } = await supabase
    .from("intake_submissions")
    .insert({
      name: data.name,
      email: data.email,
      phone: data.phone,
      business_stage: data.businessStage,
      service_needed: data.serviceNeeded,
      message: data.message || null,
    })
    .select("id")
    .single();

  if (intakeError || !intake) {
    console.error(
      "[api/intake] Supabase insert error:",
      intakeError?.code,
      intakeError?.message
    );
    return apiError(
      ErrorCode.INTERNAL_ERROR,
      "We couldn't save your submission right now. Please try again in a few minutes, or email contact@hutchrok.com.",
      503
    );
  }

  const caseNumber = await generateCaseNumber(supabase);

  const { data: filingCase, error: caseError } = await supabase
    .from("filing_cases")
    .insert({
      intake_id: intake.id,
      case_number: caseNumber,
      status: "LEAD",
    })
    .select("id, case_number")
    .single();

  if (caseError || !filingCase) {
    console.error(
      "[api/intake] Case creation error:",
      caseError?.code,
      caseError?.message
    );
    return apiSuccess(
      { intakeId: intake.id, caseNumber: null, caseId: null },
      201
    );
  }

  if (!isProd) {
    console.log("[api/intake] Created case:", filingCase.case_number);
  }

  return apiSuccess(
    {
      caseNumber: filingCase.case_number,
      caseId: filingCase.id,
    },
    201
  );
}
