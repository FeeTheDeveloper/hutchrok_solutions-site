/**
 * Microsoft 365 / SharePoint — integration adapter (scaffold)
 *
 * Defines the service boundary for future M365 integration.
 * All external calls to Microsoft Graph, SharePoint, or Power Automate
 * should go through this adapter so they can be mocked, swapped, or
 * enabled incrementally.
 *
 * Currently a no-op scaffold — no real API calls are made.
 */

// ── Types ──

export interface SharePointFolderRef {
  /** SharePoint site-relative folder URL */
  folderUrl: string;
  /** SharePoint drive item ID */
  driveItemId: string | null;
  /** When the folder was created */
  createdAt: string;
}

export interface SharePointDocumentRef {
  /** SharePoint item ID for the uploaded document */
  itemId: string;
  /** Web URL to view the document */
  webUrl: string;
}

export interface ExternalSyncState {
  /** URL to the SharePoint case folder */
  sharepointFolderUrl: string | null;
  /** Microsoft List item ID for tracking */
  msListItemId: string | null;
  /** Last time the external system was synced */
  opsSyncedAt: string | null;
}

export interface M365AdapterConfig {
  /** Microsoft Graph API tenant ID */
  tenantId: string;
  /** Application (client) ID */
  clientId: string;
  /** SharePoint site ID for case folders */
  siteId: string;
  /** SharePoint document library ID */
  libraryId: string;
  /** Microsoft Lists list ID for case tracking */
  listId: string;
}

// ── Adapter interface ──

export interface M365Adapter {
  /** Create a case folder in SharePoint */
  createCaseFolder(
    caseNumber: string,
    applicantName: string,
  ): Promise<SharePointFolderRef | null>;

  /** Upload a document to the case's SharePoint folder */
  uploadDocument(
    folderUrl: string,
    filename: string,
    content: Buffer | Uint8Array,
    mimeType: string,
  ): Promise<SharePointDocumentRef | null>;

  /** Create or update a case tracking item in Microsoft Lists */
  syncCaseToList(
    caseId: string,
    caseNumber: string,
    status: string,
    applicantName: string,
  ): Promise<string | null>;

  /** Trigger a Power Automate flow */
  triggerFlow(
    flowId: string,
    payload: Record<string, unknown>,
  ): Promise<boolean>;
}

// ── Stub adapter (used until real integration is wired) ──

export const m365Stub: M365Adapter = {
  async createCaseFolder(_caseNumber, _applicantName) {
    console.debug("[m365] createCaseFolder — stub, no-op");
    return null;
  },

  async uploadDocument(_folderUrl, _filename, _content, _mimeType) {
    console.debug("[m365] uploadDocument — stub, no-op");
    return null;
  },

  async syncCaseToList(_caseId, _caseNumber, _status, _applicantName) {
    console.debug("[m365] syncCaseToList — stub, no-op");
    return null;
  },

  async triggerFlow(_flowId, _payload) {
    console.debug("[m365] triggerFlow — stub, no-op");
    return false;
  },
};

/**
 * Get the current M365 adapter.
 * Returns the stub until real credentials are configured.
 */
export function getM365Adapter(): M365Adapter {
  // Future: check for M365_TENANT_ID env var and return real adapter
  return m365Stub;
}
