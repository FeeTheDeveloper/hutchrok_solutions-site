/**
 * Audit logger — records operator actions to the audit_log table.
 *
 * Fire-and-forget: never throws, never blocks the response.
 * If the audit_log table doesn't exist yet, logs a warning once and
 * falls back to console logging.
 */

import { getSupabaseServer } from "@/lib/supabase/server";
import { AUDIT_ACTIONS, type AuditAction, type AuditEntry } from "./types";

let _tableWarned = false;

/**
 * Record a single audit entry.
 * Fire-and-forget — never throws.
 */
export async function recordAudit(entry: Omit<AuditEntry, "id" | "created_at">): Promise<void> {
  try {
    const supabase = getSupabaseServer();
    const { error } = await supabase.from("audit_log").insert({
      case_id: entry.case_id,
      action: entry.action,
      actor: entry.actor,
      old_value: entry.old_value,
      new_value: entry.new_value,
    });

    if (error) {
      // Table may not exist yet — warn once, then just console-log
      if (!_tableWarned) {
        console.warn(
          "[audit] audit_log table not available yet. Run migration-006-audit-log.sql. " +
            "Falling back to console logging.",
        );
        _tableWarned = true;
      }
      console.info(
        `[audit] ${entry.action} | case=${entry.case_id} | actor=${entry.actor} | ` +
          `old=${entry.old_value ?? "–"} → new=${entry.new_value ?? "–"}`,
      );
    }
  } catch {
    // Never throw — audit is best-effort
    console.info(
      `[audit] ${entry.action} | case=${entry.case_id} | actor=${entry.actor} | ` +
        `old=${entry.old_value ?? "–"} → new=${entry.new_value ?? "–"}`,
    );
  }
}

/**
 * Record all field-level changes from a case update in one batch.
 * Compares old values to new values and creates audit entries for each change.
 */
export async function recordCaseUpdate(
  caseId: string,
  actor: string,
  oldValues: Record<string, unknown>,
  newValues: Record<string, unknown>,
): Promise<void> {
  const entries: Omit<AuditEntry, "id" | "created_at">[] = [];

  // Status change
  if (newValues.status && newValues.status !== oldValues.status) {
    entries.push({
      case_id: caseId,
      action: AUDIT_ACTIONS.STATUS_CHANGED,
      actor,
      old_value: (oldValues.status as string) ?? null,
      new_value: newValues.status as string,
    });
  }

  // Assignment change
  if (newValues.assigned_to !== undefined && newValues.assigned_to !== oldValues.assigned_to) {
    entries.push({
      case_id: caseId,
      action: AUDIT_ACTIONS.ASSIGNED,
      actor,
      old_value: (oldValues.assigned_to as string) ?? null,
      new_value: (newValues.assigned_to as string) ?? null,
    });
  }

  // Due date change
  if (newValues.due_date !== undefined && newValues.due_date !== oldValues.due_date) {
    entries.push({
      case_id: caseId,
      action: AUDIT_ACTIONS.DUE_DATE_CHANGED,
      actor,
      old_value: (oldValues.due_date as string) ?? null,
      new_value: (newValues.due_date as string) ?? null,
    });
  }

  // Notes change
  if (newValues.notes !== undefined && newValues.notes !== oldValues.notes) {
    entries.push({
      case_id: caseId,
      action: AUDIT_ACTIONS.NOTES_UPDATED,
      actor,
      old_value: null, // Don't store full note text in old_value
      new_value: "updated",
    });
  }

  // Handoff data change
  if (newValues.handoff_data !== undefined) {
    entries.push({
      case_id: caseId,
      action: AUDIT_ACTIONS.HANDOFF_UPDATED,
      actor,
      old_value: null,
      new_value: "updated",
    });
  }

  // Fire all in parallel, fire-and-forget
  await Promise.allSettled(entries.map((e) => recordAudit(e)));
}
