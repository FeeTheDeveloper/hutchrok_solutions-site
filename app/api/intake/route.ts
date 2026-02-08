import { NextRequest, NextResponse } from "next/server";
import type { IntakeFormData } from "@/lib/types";
import { getSupabaseServer } from "@/lib/supabase/server";

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

export async function POST(request: NextRequest) {
  try {
    const body: IntakeFormData = await request.json();

    // ── Validate required fields ──
    const errors: Record<string, string> = {};

    if (!body.name?.trim()) errors.name = "Name is required.";
    if (!body.email?.trim()) {
      errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      errors.email = "Please enter a valid email address.";
    }
    if (!body.phone?.trim()) errors.phone = "Phone number is required.";
    if (!body.businessStage)
      errors.businessStage = "Business stage is required.";
    if (!body.serviceNeeded)
      errors.serviceNeeded = "Service selection is required.";

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ ok: false, errors }, { status: 400 });
    }

    // ── Persist to Supabase ──
    const supabase = getSupabaseServer();

    // 1. Insert intake submission
    const { data: intake, error: intakeError } = await supabase
      .from("intake_submissions")
      .insert({
        name: body.name.trim(),
        email: body.email.trim(),
        phone: body.phone.trim(),
        business_stage: body.businessStage,
        service_needed: body.serviceNeeded,
        message: body.message?.trim() || null,
      })
      .select("id")
      .single();

    if (intakeError || !intake) {
      console.error("[api/intake] Supabase insert error:", intakeError);
      return NextResponse.json(
        { ok: false, errors: { form: "Failed to save submission." } },
        { status: 500 }
      );
    }

    // 2. Create filing case linked to the intake
    const caseNumber = await generateCaseNumber(supabase);

    const { data: filingCase, error: caseError } = await supabase
      .from("filing_cases")
      .insert({
        intake_id: intake.id,
        case_number: caseNumber,
        status: "NEW",
      })
      .select("id, case_number")
      .single();

    if (caseError || !filingCase) {
      console.error("[api/intake] Case creation error:", caseError);
      // Intake was saved; return partial success
      return NextResponse.json(
        { ok: true, intakeId: intake.id, caseNumber: null, caseId: null },
        { status: 201 }
      );
    }

    console.log("[api/intake] Created case:", filingCase.case_number);

    return NextResponse.json(
      {
        ok: true,
        caseNumber: filingCase.case_number,
        caseId: filingCase.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[api/intake] Error:", error);
    return NextResponse.json(
      { ok: false, errors: { form: "Invalid request." } },
      { status: 400 }
    );
  }
}
