/**
 * Case lifecycle events — constants and types
 *
 * Central definition of all events that can occur during a filing case.
 * Used by the notification scaffolding, ops webhooks, and future
 * integrations (email, Teams, Power Automate, etc.).
 */

// ── Event names ──

export const CASE_EVENTS = {
  /** New case created from intake submission */
  CASE_CREATED: "case.created",
  /** Eligibility confirmed (quiz passed) */
  ELIGIBILITY_CONFIRMED: "case.eligibility_confirmed",
  /** Veteran Verification Letter received */
  VVL_RECEIVED: "case.vvl_received",
  /** Intake form completed with all required fields */
  INTAKE_COMPLETED: "case.intake_completed",
  /** Case moved to ready-for-filing status */
  READY_FOR_FILING: "case.ready_for_filing",
  /** Filing submitted to Texas SOS */
  CASE_SUBMITTED: "case.submitted",
  /** Filing accepted by Texas SOS */
  CASE_ACCEPTED: "case.accepted",
  /** Filing completed — formation documents delivered */
  CASE_COMPLETED: "case.completed",
  /** Launch services opportunity opened (post-filing handoff) */
  LAUNCH_SERVICES_OPENED: "case.launch_services_opened",
  /** Document uploaded to a case */
  DOCUMENT_UPLOADED: "case.document_uploaded",
  /** Status changed (generic, carries old + new status) */
  STATUS_CHANGED: "case.status_changed",
  /** Operator note added */
  NOTE_ADDED: "case.note_added",
} as const;

export type CaseEventName = (typeof CASE_EVENTS)[keyof typeof CASE_EVENTS];

// ── Event payload ──

export interface CaseEvent {
  /** The event name */
  event: CaseEventName;
  /** ISO 8601 timestamp */
  timestamp: string;
  /** Case ID */
  caseId: string;
  /** Case number (human-readable) */
  caseNumber: string;
  /** Arbitrary event-specific data */
  data: Record<string, unknown>;
}

// ── Event metadata for UI / logging ──

export const CASE_EVENT_LABELS: Record<CaseEventName, string> = {
  [CASE_EVENTS.CASE_CREATED]: "Case Created",
  [CASE_EVENTS.ELIGIBILITY_CONFIRMED]: "Eligibility Confirmed",
  [CASE_EVENTS.VVL_RECEIVED]: "VVL Received",
  [CASE_EVENTS.INTAKE_COMPLETED]: "Intake Completed",
  [CASE_EVENTS.READY_FOR_FILING]: "Ready for Filing",
  [CASE_EVENTS.CASE_SUBMITTED]: "Filed with SOS",
  [CASE_EVENTS.CASE_ACCEPTED]: "Accepted by SOS",
  [CASE_EVENTS.CASE_COMPLETED]: "Case Completed",
  [CASE_EVENTS.LAUNCH_SERVICES_OPENED]: "Launch Services Opportunity",
  [CASE_EVENTS.DOCUMENT_UPLOADED]: "Document Uploaded",
  [CASE_EVENTS.STATUS_CHANGED]: "Status Changed",
  [CASE_EVENTS.NOTE_ADDED]: "Note Added",
};

// ── Status → auto-emitted events mapping ──

/**
 * When a case transitions to a given status, these events should
 * be auto-emitted. Used by the notification dispatcher.
 */
export const STATUS_EVENT_MAP: Record<string, CaseEventName | null> = {
  LEAD: null,
  ELIGIBILITY_PENDING: CASE_EVENTS.ELIGIBILITY_CONFIRMED,
  VVL_PENDING: null,
  READY_FOR_INTAKE: CASE_EVENTS.VVL_RECEIVED,
  IN_REVIEW: CASE_EVENTS.INTAKE_COMPLETED,
  READY_FOR_FILING: CASE_EVENTS.READY_FOR_FILING,
  SUBMITTED: CASE_EVENTS.CASE_SUBMITTED,
  ACCEPTED: CASE_EVENTS.CASE_ACCEPTED,
  COMPLETED: CASE_EVENTS.CASE_COMPLETED,
};
