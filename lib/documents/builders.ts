/**
 * Document generation — payload builders
 *
 * Each builder extracts data from a FilingCase + IntakeSubmissionJoin
 * and produces a typed document payload. These payloads can later be
 * fed into template renderers (HTML, PDF, DOCX, etc.).
 */

import type { FilingCase, IntakeSubmissionJoin, OwnerDetail } from "@/lib/types";
import type {
  DocumentMeta,
  Form205Payload,
  FilingCoverSheetPayload,
  VvlTrackingPayload,
  ComplianceChecklistPayload,
  ComplianceItem,
  HandoffSummaryPayload,
  DocumentBuilder,
} from "./types";

// ── Helpers ──

function buildMeta(
  kind: DocumentMeta["kind"],
  filing: FilingCase,
  version = 1,
): DocumentMeta {
  return {
    kind,
    caseId: filing.id,
    caseNumber: filing.case_number,
    generatedAt: new Date().toISOString(),
    generatedBy: filing.assigned_to ?? "system",
    version,
  };
}

// ── Form 205 Builder ──

export const form205Builder: DocumentBuilder<Form205Payload> = {
  kind: "form_205",
  buildPayload(filing, intake) {
    const owners = (intake.owner_details ?? []) as OwnerDetail[];
    return {
      meta: buildMeta("form_205", filing),
      entityName: intake.business_name ?? "",
      entityType: "llc",
      filingState: "TX",
      registeredAgent: {
        name: intake.registered_agent_preference === "self"
          ? intake.organizer_name ?? intake.name
          : "TBD — Hutchrok Coordinated",
        address: intake.principal_address ?? "",
      },
      organizer: {
        name: intake.organizer_name ?? intake.name,
        title: intake.organizer_title ?? "Organizer",
      },
      managementType: owners.some((o) => o.role === "Manager")
        ? "manager-managed"
        : "member-managed",
      purpose: intake.business_purpose ?? "The purpose for which the company is organized is the transaction of any and all lawful purposes.",
      principalAddress: intake.principal_address ?? "",
      mailingAddress: intake.mailing_address ?? null,
      owners,
      veteranFeeWaiver: intake.veteran_status === true && intake.vvl_status === "have_vvl",
    };
  },
};

// ── Filing Cover Sheet Builder ──

export const coverSheetBuilder: DocumentBuilder<FilingCoverSheetPayload> = {
  kind: "filing_cover_sheet",
  buildPayload(filing, intake) {
    return {
      meta: buildMeta("filing_cover_sheet", filing),
      applicantName: intake.name,
      applicantEmail: intake.email,
      applicantPhone: intake.phone,
      entityName: intake.business_name ?? "",
      caseStatus: filing.status,
      vvlStatus: intake.vvl_status ?? "unknown",
      filingNotes: filing.notes,
    };
  },
};

// ── VVL Tracking Builder ──

export const vvlTrackingBuilder: DocumentBuilder<VvlTrackingPayload> = {
  kind: "vvl_tracking",
  buildPayload(filing, intake) {
    return {
      meta: buildMeta("vvl_tracking", filing),
      applicantName: intake.name,
      veteranStatus: intake.veteran_status === true,
      vvlStatus: intake.vvl_status ?? "not_started",
      vvlReceivedDate: intake.vvl_status === "have_vvl" ? filing.updated_at : null,
      tvcNotes: null,
    };
  },
};

// ── Compliance Checklist Builder ──

const DEFAULT_CHECKLIST_ITEMS: Omit<ComplianceItem, "completed" | "completedAt" | "notes">[] = [
  { id: "eligibility_confirmed", label: "Eligibility confirmed", category: "pre-filing" },
  { id: "vvl_received", label: "VVL received and verified", category: "pre-filing" },
  { id: "intake_complete", label: "Intake form completed", category: "pre-filing" },
  { id: "business_name_cleared", label: "Business name availability checked", category: "pre-filing" },
  { id: "form_205_prepared", label: "Form 205 prepared", category: "filing" },
  { id: "form_205_reviewed", label: "Form 205 reviewed by operator", category: "filing" },
  { id: "submitted_to_sos", label: "Submitted to Texas SOS", category: "filing" },
  { id: "sos_accepted", label: "Accepted by Texas SOS", category: "filing" },
  { id: "formation_docs_delivered", label: "Formation documents delivered to client", category: "post-filing" },
  { id: "ein_guidance_sent", label: "EIN application guidance sent", category: "post-filing" },
  { id: "launch_services_discussed", label: "Launch services interest discussed", category: "post-filing" },
];

export const complianceChecklistBuilder: DocumentBuilder<ComplianceChecklistPayload> = {
  kind: "compliance_checklist",
  buildPayload(filing, _intake) {
    const statusIndex = [
      "LEAD", "ELIGIBILITY_PENDING", "VVL_PENDING", "READY_FOR_INTAKE",
      "IN_REVIEW", "READY_FOR_FILING", "SUBMITTED", "ACCEPTED", "COMPLETED",
    ].indexOf(filing.status);

    // Auto-check items based on current pipeline status
    const autoChecked = new Set<string>();
    if (statusIndex >= 1) autoChecked.add("eligibility_confirmed");
    if (statusIndex >= 3) autoChecked.add("vvl_received");
    if (statusIndex >= 4) autoChecked.add("intake_complete");
    if (statusIndex >= 5) autoChecked.add("form_205_prepared");
    if (statusIndex >= 5) autoChecked.add("form_205_reviewed");
    if (statusIndex >= 6) autoChecked.add("submitted_to_sos");
    if (statusIndex >= 7) autoChecked.add("sos_accepted");
    if (statusIndex >= 8) autoChecked.add("formation_docs_delivered");

    return {
      meta: buildMeta("compliance_checklist", filing),
      items: DEFAULT_CHECKLIST_ITEMS.map((item) => ({
        ...item,
        completed: autoChecked.has(item.id),
        completedAt: autoChecked.has(item.id) ? filing.updated_at : null,
        notes: null,
      })),
    };
  },
};

// ── Handoff Summary Builder ──

export const handoffSummaryBuilder: DocumentBuilder<HandoffSummaryPayload> = {
  kind: "handoff_summary",
  buildPayload(filing, intake) {
    return {
      meta: buildMeta("handoff_summary", filing),
      applicantName: intake.name,
      entityName: intake.business_name ?? "",
      filingDate: filing.status === "SUBMITTED" || filing.status === "ACCEPTED" || filing.status === "COMPLETED"
        ? filing.updated_at
        : null,
      acceptedDate: filing.status === "ACCEPTED" || filing.status === "COMPLETED"
        ? filing.updated_at
        : null,
      servicesInterested: [],
      recommendedNextService: null,
      handoffNotes: null,
    };
  },
};

// ── Builder registry ──

export const BUILDERS: Record<string, DocumentBuilder> = {
  form_205: form205Builder,
  filing_cover_sheet: coverSheetBuilder,
  vvl_tracking: vvlTrackingBuilder,
  compliance_checklist: complianceChecklistBuilder,
  handoff_summary: handoffSummaryBuilder,
};
