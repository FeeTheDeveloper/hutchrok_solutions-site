/**
 * Notification dispatcher
 *
 * The log channel records operational metadata only. It never serializes
 * arbitrary event data or client contact information into platform logs.
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

export interface NotificationChannel {
  name: string;
  enabled: boolean;
  send(event: CaseEvent): Promise<void>;
}

function safeEventLog(event: CaseEvent) {
  return {
    event: event.event,
    caseNumber: event.caseNumber,
    dataKeys: Object.keys(event.data).filter((key) => key !== "contact"),
    contactPresent: Object.prototype.hasOwnProperty.call(event.data, "contact"),
  };
}

const logChannel: NotificationChannel = {
  name: "log",
  enabled: true,
  async send(event) {
    console.info("[notification] event", safeEventLog(event));
  },
};

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

const channels: NotificationChannel[] = [
  logChannel,
  opsWebhookChannel,
  clientEmailChannel,
  clientSmsChannel,
];

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
      .filter((channel) => channel.enabled)
      .map((channel) => channel.send(caseEvent)),
  );
}

export async function emitStatusChangeEvents(
  caseId: string,
  caseNumber: string,
  oldStatus: string,
  newStatus: string,
  contact?: NotifyContact,
): Promise<void> {
  await emitCaseEvent(CASE_EVENTS.STATUS_CHANGED, caseId, caseNumber, {
    old_status: oldStatus,
    new_status: newStatus,
    ...(contact ? { contact } : {}),
  });

  const lifecycleEvent = STATUS_EVENT_MAP[newStatus];
  if (lifecycleEvent) {
    await emitCaseEvent(lifecycleEvent, caseId, caseNumber, {
      triggered_by: "status_transition",
      from: oldStatus,
    });
  }

  if (newStatus === "COMPLETED") {
    await emitCaseEvent(CASE_EVENTS.LAUNCH_SERVICES_OPENED, caseId, caseNumber, {
      triggered_by: "case_completed",
    });
  }
}
