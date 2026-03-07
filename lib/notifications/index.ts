/**
 * Notification system — barrel export
 */

export {
  CASE_EVENTS,
  CASE_EVENT_LABELS,
  STATUS_EVENT_MAP,
} from "./events";

export type {
  CaseEventName,
  CaseEvent,
} from "./events";

export type { NotificationChannel } from "./dispatcher";

export {
  emitCaseEvent,
  emitStatusChangeEvents,
} from "./dispatcher";
