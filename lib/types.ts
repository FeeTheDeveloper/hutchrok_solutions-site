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
}

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
