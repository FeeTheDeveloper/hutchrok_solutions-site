/**
 * Notification dispatcher
 *
 * The log channel records operational metadata only. It never serializes
 * arbitrary event data or client contact information into platform logs.
 */

import { emitOpsEvent } from "@/lib/services/ops-webhook";
import { emitSiteSignal, isOsBridgeEnabled, type SiteSignalInput } from "@/lib/os/bridge";
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

/** Case lifecycle → Hutchrok OS site signal. Only the case-created signal carries contact details. */
function toSiteSignal(event: CaseEvent): SiteSignalInput {
  const entity = { type: "filing_case", id: event.caseId, ref: event.caseNumber };
  const signalId = `${event.event}:${event.caseId}:${event.timestamp}`;

  if (event.event === CASE_EVENTS.CASE_CREATED) {
    const contact = (event.data.contact ?? {}) as NotifyContact;
    return {
      type: "intake.submitted",
      signalId,
      entity,
      contact: {
        ...(contact.clientName ? { name: contact.clientName } : {}),
        ...(contact.email ? { email: contact.email } : {}),
        ...(contact.phone ? { phone: contact.phone } : {}),
        ...(contact.businessName ? { businessName: contact.businessName } : {}),
      },
    };
  }
  if (event.event === CASE_EVENTS.STATUS_CHANGED) {
    return {
      type: "case.status_changed",
      signalId,
      entity,
      data: { old_status: event.data.old_status, new_status: event.data.new_status },
    };
  }
  if (event.event === CASE_EVENTS.DOCUMENT_UPLOADED) {
    return { type: "document.uploaded", signalId, entity, data: { document_type: event.data.document_type } };
  }
  return { type: "case.event", signalId, entity, data: { event: event.event } };
}

const hutchrokOsChannel: NotificationChannel = {
  name: "hutchrok-os",
  enabled: isOsBridgeEnabled(),
  async send(event) {
    await emitSiteSignal(toSiteSignal(event));
  },
};

const channels: NotificationChannel[] = [
  logChannel,
  opsWebhookChannel,
  hutchrokOsChannel,
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
