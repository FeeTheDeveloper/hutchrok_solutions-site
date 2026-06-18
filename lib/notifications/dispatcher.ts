/**
 * Notification dispatcher — scaffolding
 *
 * Central hub for emitting case lifecycle events to multiple channels.
 * Currently logs events and forwards to the ops webhook. Future channels
 * (email, Teams, Power Automate, SharePoint) plug in here.
 */

import { emitOpsEvent } from "@/lib/services/ops-webhook";
import {
  CASE_EVENTS,
  STATUS_EVENT_MAP,
  type CaseEvent,
  type CaseEventName,
} from "./events";
import {
  clientEmailChannel,
  clientSmsChannel,
  type NotifyContact,
} from "./client-channels";

// ── Channel interface (for future providers) ──

export interface NotificationChannel {
  name: string;
  enabled: boolean;
  send(event: CaseEvent): Promise<void>;
}

// ── Built-in channels ──

/** Console / structured log channel (always enabled) */
const logChannel: NotificationChannel = {
  name: "log",
  enabled: true,
  async send(event) {
    console.info(
      `[notification] ${event.event} — case ${event.caseNumber}`,
      JSON.stringify(event.data),
    );
  },
};

/** Ops webhook channel (enabled when OPS_WEBHOOK_URL is set) */
const opsWebhookChannel: NotificationChannel = {
  name: "ops-webhook",
  enabled: true,
  async send(event) {
    await emitOpsEvent(
      event.event as Parameters<typeof emitOpsEvent>[0],
      { caseId: event.caseId, caseNumber: event.caseNumber, ...event.data },
    );
  },
};

// ── Channel registry ──

const channels: NotificationChannel[] = [
  logChannel,
  opsWebhookChannel,
  // Client-facing channels — self-disable when their provider env is absent.
  clientEmailChannel,
  clientSmsChannel,
];

// ── Dispatcher ──

/**
 * Emit a case event to all enabled notification channels.
 * Fire-and-forget — never throws.
 */
export async function emitCaseEvent(
  event: CaseEventName,
  caseId: string,
  caseNumber: string,
  data: Record<string, unknown> = {},
): Promise<void> {
  const caseEvent: CaseEvent = {
    event,
    timestamp: new Date().toISOString(),
    caseId,
    caseNumber,
    data,
  };

  await Promise.allSettled(
    channels
      .filter((ch) => ch.enabled)
      .map((ch) => ch.send(caseEvent)),
  );
}

/**
 * Automatically emit the appropriate event when a case status changes.
 * Call this from the admin PATCH route after a successful status update.
 */
export async function emitStatusChangeEvents(
  caseId: string,
  caseNumber: string,
  oldStatus: string,
  newStatus: string,
  contact?: NotifyContact,
): Promise<void> {
  // Always emit the generic status_changed event. Contact details ride along
  // so client-facing channels (email/SMS) can reach the applicant.
  await emitCaseEvent(CASE_EVENTS.STATUS_CHANGED, caseId, caseNumber, {
    old_status: oldStatus,
    new_status: newStatus,
    ...(contact ? { contact } : {}),
  });

  // Emit the specific lifecycle event for the new status
  const lifecycleEvent = STATUS_EVENT_MAP[newStatus];
  if (lifecycleEvent) {
    await emitCaseEvent(lifecycleEvent, caseId, caseNumber, {
      triggered_by: "status_transition",
      from: oldStatus,
    });
  }

  // Special: if moving to COMPLETED, also fire launch services opportunity
  if (newStatus === "COMPLETED") {
    await emitCaseEvent(CASE_EVENTS.LAUNCH_SERVICES_OPENED, caseId, caseNumber, {
      triggered_by: "case_completed",
    });
  }
}
