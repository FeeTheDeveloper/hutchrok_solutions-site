import type { CaseStatus } from "@/lib/types";

/**
 * Client-facing filing status model.
 *
 * Internally a case moves through 9 granular statuses (see CASE_STATUSES).
 * For the self-service tracker we collapse those into 5 human-friendly
 * milestones — the same "order tracker" pattern clients expect from a
 * modern filing service — while still surfacing a precise label and a
 * "what's happening / what's next" narrative for the exact internal stage.
 */

export interface FilingMilestone {
  /** Stable key for the milestone */
  key: string;
  /** Short label shown in the stepper */
  label: string;
  /** One-line description of the milestone */
  description: string;
}

export const FILING_MILESTONES: FilingMilestone[] = [
  {
    key: "received",
    label: "Received",
    description: "Your filing request is in and queued for review.",
  },
  {
    key: "verification",
    label: "TVC Verification",
    description: "Confirming your Veteran Verification Letter.",
  },
  {
    key: "preparation",
    label: "Preparation & Review",
    description: "Preparing and operator-reviewing your Certificate of Formation.",
  },
  {
    key: "filed",
    label: "Filed with Texas SOS",
    description: "Submitted to the Texas Secretary of State.",
  },
  {
    key: "complete",
    label: "Complete",
    description: "Formation accepted and documents delivered.",
  },
];

export interface CaseStatusMeta {
  /** Index into FILING_MILESTONES (0-based) */
  milestone: number;
  /** Precise client-facing label for this exact status */
  label: string;
  /** What is happening right now */
  happening: string;
  /** What the client can expect next */
  next: string;
}

/**
 * Map every internal CaseStatus onto a milestone plus a precise,
 * client-appropriate narrative. Copy is deliberately reassuring and never
 * exposes internal operations jargon.
 */
export const CASE_STATUS_META: Record<CaseStatus, CaseStatusMeta> = {
  LEAD: {
    milestone: 0,
    label: "Filing Received",
    happening:
      "We've received your filing request and it's queued for our operations team.",
    next: "An operator will review your details, usually within 24–48 hours.",
  },
  ELIGIBILITY_PENDING: {
    milestone: 0,
    label: "Confirming Eligibility",
    happening:
      "We're confirming you meet the requirements for the free veteran filing program.",
    next: "Once eligibility is confirmed, we'll move on to TVC verification.",
  },
  VVL_PENDING: {
    milestone: 1,
    label: "Awaiting TVC Verification",
    happening:
      "We're waiting on your Texas Veterans Commission Verification Letter (VVL).",
    next:
      "As soon as your VVL is confirmed, we begin preparing your formation documents.",
  },
  READY_FOR_INTAKE: {
    milestone: 2,
    label: "Verification Confirmed",
    happening:
      "Your veteran status is verified. We're finalizing the details we need to file.",
    next: "Your Certificate of Formation moves into preparation and review.",
  },
  IN_REVIEW: {
    milestone: 2,
    label: "In Operator Review",
    happening:
      "A Hutchrok operator is preparing and reviewing your Certificate of Formation.",
    next: "After review, your filing is finalized and readied for submission.",
  },
  READY_FOR_FILING: {
    milestone: 2,
    label: "Ready to File",
    happening:
      "Your Certificate of Formation is prepared, reviewed, and ready to submit.",
    next: "We submit your filing to the Texas Secretary of State.",
  },
  SUBMITTED: {
    milestone: 3,
    label: "Filed with Texas SOS",
    happening:
      "Your filing has been submitted to the Texas Secretary of State.",
    next:
      "We're waiting for the state to process and accept your formation. Timelines depend on the SOS schedule.",
  },
  ACCEPTED: {
    milestone: 4,
    label: "Accepted by the State",
    happening: "The Texas Secretary of State has accepted your formation.",
    next: "We're finalizing and delivering your approved formation documents.",
  },
  COMPLETED: {
    milestone: 4,
    label: "Complete",
    happening:
      "Your LLC is formed and your approved documents have been delivered.",
    next:
      "You're all set. Explore optional launch services whenever you're ready.",
  },
};

/** Total number of client-facing milestones. */
export const MILESTONE_COUNT = FILING_MILESTONES.length;

/** Safe lookup with a sensible fallback for unknown/legacy statuses. */
export function getCaseStatusMeta(status: string): CaseStatusMeta {
  return (
    CASE_STATUS_META[status as CaseStatus] ?? CASE_STATUS_META.LEAD
  );
}
