/**
 * Audit logging — types and constants
 *
 * Lightweight internal audit trail for operator actions on cases.
 * Records who did what, when, and what changed.
 */

// ── Audit action types ──

export const AUDIT_ACTIONS = {
  STATUS_CHANGED: "status_changed",
  ASSIGNED: "assigned",
  DUE_DATE_CHANGED: "due_date_changed",
  NOTES_UPDATED: "notes_updated",
  HANDOFF_UPDATED: "handoff_updated",
  DOCUMENT_UPLOADED: "document_uploaded",
  DOCUMENT_DELETED: "document_deleted",
  CASE_CREATED: "case_created",
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

// ── Audit entry structure ──

export interface AuditEntry {
  /** Auto-generated UUID */
  id?: string;
  /** Filing case ID */
  case_id: string;
  /** The action that was performed */
  action: AuditAction;
  /** Who performed the action (operator identifier or "system") */
  actor: string;
  /** Previous value (for changes) */
  old_value: string | null;
  /** New value (for changes) */
  new_value: string | null;
  /** ISO timestamp */
  created_at?: string;
}

// ── Labels for display ──

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  [AUDIT_ACTIONS.STATUS_CHANGED]: "Status Changed",
  [AUDIT_ACTIONS.ASSIGNED]: "Assignment Changed",
  [AUDIT_ACTIONS.DUE_DATE_CHANGED]: "Due Date Changed",
  [AUDIT_ACTIONS.NOTES_UPDATED]: "Notes Updated",
  [AUDIT_ACTIONS.HANDOFF_UPDATED]: "Handoff Data Updated",
  [AUDIT_ACTIONS.DOCUMENT_UPLOADED]: "Document Uploaded",
  [AUDIT_ACTIONS.DOCUMENT_DELETED]: "Document Deleted",
  [AUDIT_ACTIONS.CASE_CREATED]: "Case Created",
};
