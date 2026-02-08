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

// ── Filing case types ──

export const CASE_STATUSES = [
  "NEW",
  "IN_REVIEW",
  "NEEDS_INFO",
  "IN_PROGRESS",
  "FILED",
  "COMPLETED",
] as const;

export type CaseStatus = (typeof CASE_STATUSES)[number];

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
  // Joined from intake_submissions
  intake_submissions?: {
    name: string;
    email: string;
    phone: string;
    business_stage: string;
    service_needed: string;
    message: string | null;
  };
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
