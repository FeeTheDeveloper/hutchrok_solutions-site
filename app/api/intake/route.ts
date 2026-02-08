import { NextRequest, NextResponse } from "next/server";
import type { IntakeFormData } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body: IntakeFormData = await request.json();

    // Validate required fields
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
      return NextResponse.json(
        { ok: false, errors },
        { status: 400 }
      );
    }

    // ── STUB: Log the intake submission ──
    // In production, this would:
    // 1. Save to database (e.g., Prisma + PostgreSQL)
    // 2. Send notification email (e.g., Resend, SendGrid)
    // 3. Create CRM entry (e.g., HubSpot, Salesforce)
    // 4. Trigger workflow (e.g., Zapier, n8n)
    console.log("[api/intake] New submission:", {
      name: body.name,
      email: body.email,
      phone: body.phone,
      businessStage: body.businessStage,
      serviceNeeded: body.serviceNeeded,
      message: body.message || "(no message)",
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/intake] Error:", error);
    return NextResponse.json(
      { ok: false, errors: { form: "Invalid request." } },
      { status: 400 }
    );
  }
}
