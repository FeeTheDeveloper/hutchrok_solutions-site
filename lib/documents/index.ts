/**
 * Document generation — barrel export
 */

export { DOCUMENT_KINDS, DOCUMENT_KIND_LABELS } from "./types";
export type {
  DocumentKind,
  DocumentMeta,
  DocumentPayload,
  DocumentBuilder,
  Form205Payload,
  FilingCoverSheetPayload,
  VvlTrackingPayload,
  ComplianceChecklistPayload,
  ComplianceItem,
  HandoffSummaryPayload,
} from "./types";

export {
  form205Builder,
  coverSheetBuilder,
  vvlTrackingBuilder,
  complianceChecklistBuilder,
  handoffSummaryBuilder,
  BUILDERS,
} from "./builders";
