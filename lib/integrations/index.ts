/**
 * External integrations — barrel export
 */

export { getM365Adapter, m365Stub } from "./m365-adapter";
export type {
  M365Adapter,
  M365AdapterConfig,
  SharePointFolderRef,
  SharePointDocumentRef,
  ExternalSyncState,
} from "./m365-adapter";
