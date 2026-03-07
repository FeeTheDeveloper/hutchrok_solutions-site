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

// ── Future channel stubs ──

/** Email channel placeholder — connect to Resend, SES, etc. */
const _emailChannel: NotificationChannel = {
  name: "email",
  enabled: false,
  async send(_event) {
    // TODO: Wire to email provider in a future phase
  },
};

/** Microsoft Teams channel placeholder */
const _teamsChannel: NotificationChannel = {
  name: "teams",
  enabled: false,
  async send(_event) {
    // TODO: Wire to Teams webhook / Graph API
  },
};

/** Power Automate channel placeholder */
const _powerAutomateChannel: NotificationChannel = {
  name: "power-automate",
  enabled: false,
  async send(_event) {
    // TODO: Wire to Power Automate HTTP trigger
  },
};

// ── Channel registry ──

const channels: NotificationChannel[] = [
  logChannel,
  opsWebhookChannel,
  // Add channels here as they're enabled:
  // _emailChannel,
  // _teamsChannel,
  // _powerAutomateChannel,
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
): Promise<void> {
  // Always emit the generic status_changed event
  await emitCaseEvent(CASE_EVENTS.STATUS_CHANGED, caseId, caseNumber, {
    old_status: oldStatus,
    new_status: newStatus,
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
