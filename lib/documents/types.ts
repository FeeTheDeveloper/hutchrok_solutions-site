/**
 * Document generation — type definitions
 *
 * Defines the data shapes for all documents Hutchrok may generate
 * as part of a veteran LLC filing case. These types serve as the
 * contract between intake data and document builders/templates.
 */

import type { FilingCase, IntakeSubmissionJoin, OwnerDetail } from "@/lib/types";

// ── Document kinds ──

export const DOCUMENT_KINDS = [
  "form_205",
  "filing_cover_sheet",
  "vvl_tracking",
  "compliance_checklist",
  "handoff_summary",
] as const;

export type DocumentKind = (typeof DOCUMENT_KINDS)[number];

export const DOCUMENT_KIND_LABELS: Record<DocumentKind, string> = {
  form_205: "Certificate of Formation (Form 205)",
  filing_cover_sheet: "Filing Cover Sheet",
  vvl_tracking: "VVL Tracking Sheet",
  compliance_checklist: "Compliance Checklist",
  handoff_summary: "Post-Filing Handoff Summary",
};

// ── Shared document metadata ──

export interface DocumentMeta {
  kind: DocumentKind;
  caseId: string;
  caseNumber: string;
  generatedAt: string;
  generatedBy: string;
  version: number;
}

// ── Form 205 payload ──

export interface Form205Payload {
  meta: DocumentMeta;
  entityName: string;
  entityType: "llc";
  filingState: "TX";
  /** Registered agent information */
  registeredAgent: {
    name: string;
    address: string;
  };
  /** Organizer who signs the formation document */
  organizer: {
    name: string;
    title: string;
  };
  /** Governing authority / management structure */
  managementType: "member-managed" | "manager-managed";
  /** Purpose of the LLC */
  purpose: string;
  /** Business address */
  principalAddress: string;
  /** Mailing address (if different) */
  mailingAddress: string | null;
  /** Owners / members */
  owners: OwnerDetail[];
  /** Whether TVC VVL fee waiver applies */
  veteranFeeWaiver: boolean;
}

// ── Filing cover sheet payload ──

export interface FilingCoverSheetPayload {
  meta: DocumentMeta;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  entityName: string;
  caseStatus: string;
  vvlStatus: string;
  filingNotes: string | null;
}

// ── VVL tracking sheet payload ──

export interface VvlTrackingPayload {
  meta: DocumentMeta;
  applicantName: string;
  veteranStatus: boolean;
  vvlStatus: string;
  vvlReceivedDate: string | null;
  tvcNotes: string | null;
}

// ── Compliance checklist payload ──

export interface ComplianceChecklistPayload {
  meta: DocumentMeta;
  items: ComplianceItem[];
}

export interface ComplianceItem {
  id: string;
  label: string;
  category: "pre-filing" | "filing" | "post-filing";
  completed: boolean;
  completedAt: string | null;
  notes: string | null;
}

// ── Post-filing handoff summary payload ──

export interface HandoffSummaryPayload {
  meta: DocumentMeta;
  applicantName: string;
  entityName: string;
  filingDate: string | null;
  acceptedDate: string | null;
  servicesInterested: string[];
  recommendedNextService: string | null;
  handoffNotes: string | null;
}

// ── Union type for all payloads ──

export type DocumentPayload =
  | Form205Payload
  | FilingCoverSheetPayload
  | VvlTrackingPayload
  | ComplianceChecklistPayload
  | HandoffSummaryPayload;

// ── Builder interface (for future document generators) ──

export interface DocumentBuilder<T extends DocumentPayload = DocumentPayload> {
  kind: DocumentKind;
  /** Build the payload from a filing case + intake data */
  buildPayload(filingCase: FilingCase, intake: IntakeSubmissionJoin): T;
}
