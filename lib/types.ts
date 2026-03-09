export interface IntakeFormData {
  name: string;
  email: string;
  phone: string;
  businessStage: string;
  serviceNeeded: string;
  message: string;
}

export interface IntakeResponse {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
  caseNumber?: string | null;
  caseId?: string | null;
}

// ── Veteran Filing Intake Types ──

export interface OwnerDetail {
  name: string;
  role: string;
}

export type VvlStatus = "have_vvl" | "applied" | "not_started";
export type LaunchTimeline = "asap" | "1_3_months" | "3_6_months" | "6_plus_months" | "not_sure";
export type RegisteredAgentPreference = "self" | "hutchrok" | "other";
export type BusinessEntityType = "llc" | "dba" | "nonprofit";
export type BranchOfService = "army" | "navy" | "air_force" | "marines" | "coast_guard" | "space_force" | "other";

export const VVL_STATUSES: { value: VvlStatus; label: string }[] = [
  { value: "have_vvl", label: "I have my VVL" },
  { value: "applied", label: "I've applied — waiting on TVC" },
  { value: "not_started", label: "I haven't started yet" },
];

export const LAUNCH_TIMELINES: { value: LaunchTimeline; label: string }[] = [
  { value: "asap", label: "As soon as possible" },
  { value: "1_3_months", label: "1–3 months" },
  { value: "3_6_months", label: "3–6 months" },
  { value: "6_plus_months", label: "6+ months" },
  { value: "not_sure", label: "Not sure yet" },
];

export const REGISTERED_AGENT_OPTIONS: { value: RegisteredAgentPreference; label: string }[] = [
  { value: "self", label: "I'll serve as my own registered agent" },
  { value: "hutchrok", label: "I'd like Hutchrok to recommend one" },
  { value: "other", label: "I already have a registered agent" },
];

export const ENTITY_TYPES: { value: BusinessEntityType; label: string }[] = [
  { value: "llc", label: "LLC" },
  { value: "dba", label: "DBA (Assumed Name)" },
  { value: "nonprofit", label: "Nonprofit Corporation" },
];

export const BRANCHES_OF_SERVICE: { value: BranchOfService; label: string }[] = [
  { value: "army", label: "Army" },
  { value: "navy", label: "Navy" },
  { value: "air_force", label: "Air Force" },
  { value: "marines", label: "Marines" },
  { value: "coast_guard", label: "Coast Guard" },
  { value: "space_force", label: "Space Force" },
  { value: "other", label: "Other" },
];

export const OWNER_ROLES = ["Member", "Manager", "Member-Manager"] as const;

export interface VeteranIntakeFormData {
  // Contact
  name: string;
  email: string;
  phone: string;
  veteranStatus: boolean;
  vvlStatus: VvlStatus;
  notes: string;
  // Business
  businessName: string;
  entityType: BusinessEntityType;
  dbaName?: string;
  nonprofitPurpose?: string;
  businessPurpose: string;
  principalAddress: string;
  mailingAddress: string;
  texasConfirmed: boolean;
  launchTimeline: LaunchTimeline;
  // Ownership
  allOwnersVeterans: boolean;
  fullyVeteranOwned: boolean;
  ownerDetails: OwnerDetail[];
  organizerName: string;
  organizerTitle: string;
  registeredAgentPreference: RegisteredAgentPreference;
  operatorReviewConfirmed: boolean;
  // Service background
  branchOfService?: BranchOfService;
  yearsOfService?: number;
  // Context
  eligibilityAnswers: Record<string, boolean | null> | null;
}

// ── Filing case types ──

export const CASE_STATUSES = [
  "LEAD",
  "ELIGIBILITY_PENDING",
  "VVL_PENDING",
  "READY_FOR_INTAKE",
  "IN_REVIEW",
  "READY_FOR_FILING",
  "SUBMITTED",
  "ACCEPTED",
  "COMPLETED",
] as const;

export type CaseStatus = (typeof CASE_STATUSES)[number];

export interface IntakeSubmissionJoin {
  name: string;
  email: string;
  phone: string;
  business_stage: string | null;
  service_needed: string | null;
  message: string | null;
  // Veteran fields
  veteran_status: boolean | null;
  vvl_status: string | null;
  business_name: string | null;
  entity_type: string | null;
  business_purpose: string | null;
  principal_address: string | null;
  mailing_address: string | null;
  texas_confirmed: boolean | null;
  launch_timeline: string | null;
  all_owners_veterans: boolean | null;
  fully_veteran_owned: boolean | null;
  owner_details: OwnerDetail[] | null;
  organizer_name: string | null;
  organizer_title: string | null;
  registered_agent_preference: string | null;
  operator_review_confirmed: boolean | null;
  // Phase 2 expansion
  dba_name: string | null;
  nonprofit_purpose: string | null;
  branch_of_service: string | null;
  years_of_service: number | null;
  eligibility_answers: Record<string, boolean | null> | null;
}

export interface FilingCase {
  id: string;
  created_at: string;
  updated_at: string;
  intake_id: string;
  case_number: string;
  status: CaseStatus;
  assigned_to: string | null;
  due_date: string | null;
  notes: string | null;
  // Microsoft 365 Ops integration
  sharepoint_folder_url: string | null;
  ms_list_item_id: string | null;
  ops_synced_at: string | null;
  // Launch services handoff
  handoff_data: HandoffData | null;
  // Joined from intake_submissions
  intake_submissions?: IntakeSubmissionJoin;
}

// ── Case document types ──

export interface CaseDocument {
  id: string;
  case_id: string;
  filename: string;
  mime: string;
  size: number;
  storage_path: string;
  uploaded_at: string;
  /** SharePoint item ID set by ops integration */
  sharepoint_item_id: string | null;
  /** Populated client-side from signed URL */
  download_url?: string;
}

export const ALLOWED_UPLOAD_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
] as const;

export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10 MB

export type BusinessStage =
  | "idea"
  | "pre-launch"
  | "newly-formed"
  | "operating"
  | "scaling";

export type ServiceType =
  | "formation"
  | "compliance"
  | "advisory"
  | "managed"
  | "credit-enablement"
  | "other";

export const BUSINESS_STAGES: { value: BusinessStage; label: string }[] = [
  { value: "idea", label: "Idea Stage" },
  { value: "pre-launch", label: "Pre-Launch" },
  { value: "newly-formed", label: "Newly Formed (0–12 months)" },
  { value: "operating", label: "Operating (1–3 years)" },
  { value: "scaling", label: "Scaling (3+ years)" },
];

export const SERVICE_TYPES: { value: ServiceType; label: string }[] = [
  { value: "formation", label: "Business Formation & Structuring" },
  { value: "compliance", label: "Compliance & Operations Setup" },
  { value: "advisory", label: "Strategic Advisory" },
  { value: "managed", label: "Managed Business Services" },
  { value: "credit-enablement", label: "Credit Enablement" },
  { value: "other", label: "Other / Not Sure" },
];

// ── Launch services / handoff types ──

export const LAUNCH_SERVICE_OPTIONS = [
  "website",
  "branding",
  "logo",
  "email",
  "hosting",
  "compliance_setup",
  "ein_coordination",
] as const;

export type LaunchServiceOption = (typeof LAUNCH_SERVICE_OPTIONS)[number];

export const LAUNCH_SERVICE_LABELS: Record<LaunchServiceOption, string> = {
  website: "Business Website",
  branding: "Brand Identity Package",
  logo: "Logo Design",
  email: "Business Email Setup",
  hosting: "Domain + Hosting",
  compliance_setup: "Compliance & Ops Setup",
  ein_coordination: "EIN Coordination",
};

export interface HandoffData {
  /** Services the client expressed interest in */
  servicesInterested: LaunchServiceOption[];
  /** Operator-recommended next service */
  recommendedService: LaunchServiceOption | null;
  /** Whether the case is launch-ready */
  launchReady: boolean;
  /** Internal handoff notes */
  handoffNotes: string | null;
}

// ── Workflow quick-action types ──

export interface QuickAction {
  label: string;
  /** Target status to transition to */
  targetStatus: CaseStatus;
  /** Description shown in tooltip */
  description: string;
  /** Only show when current status is one of these */
  fromStatuses: CaseStatus[];
}

export const QUICK_ACTIONS: QuickAction[] = [
  {
    label: "Mark VVL Received",
    targetStatus: "READY_FOR_INTAKE",
    description: "Veteran Verification Letter confirmed — move to intake",
    fromStatuses: ["VVL_PENDING"],
  },
  {
    label: "Mark Intake Complete",
    targetStatus: "IN_REVIEW",
    description: "All intake fields verified — begin operator review",
    fromStatuses: ["READY_FOR_INTAKE"],
  },
  {
    label: "Ready for Filing",
    targetStatus: "READY_FOR_FILING",
    description: "Review complete — Form 205 is prepared and verified",
    fromStatuses: ["IN_REVIEW"],
  },
  {
    label: "Mark as Submitted",
    targetStatus: "SUBMITTED",
    description: "Filing submitted to Texas Secretary of State",
    fromStatuses: ["READY_FOR_FILING"],
  },
  {
    label: "Mark as Accepted",
    targetStatus: "ACCEPTED",
    description: "Texas SOS accepted the filing",
    fromStatuses: ["SUBMITTED"],
  },
  {
    label: "Complete Case",
    targetStatus: "COMPLETED",
    description: "Formation documents delivered — case closed",
    fromStatuses: ["ACCEPTED"],
  },
];
