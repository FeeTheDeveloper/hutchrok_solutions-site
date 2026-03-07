/** Eligibility quiz types, questions, and decision logic */

export interface QuizQuestion {
  id: string;
  question: string;
  detail: string;
  yesLabel?: string;
  noLabel?: string;
}

export interface QuizAnswers {
  isVeteran: boolean | null;
  isNewTexasBusiness: boolean | null;
  allOwnersVeterans: boolean | null;
  fullyVeteranOwned: boolean | null;
  formingLLC: boolean | null;
}

export type QuizOutcome = "qualified" | "needs-verification" | "not-qualified";

export const STORAGE_KEY = "hutchrok_eligibility";

export const QUESTIONS: QuizQuestion[] = [
  {
    id: "isVeteran",
    question: "Are you a U.S. military veteran?",
    detail:
      "This program requires honorable discharge from any branch of the U.S. Armed Forces.",
    yesLabel: "Yes, I'm a veteran",
    noLabel: "No",
  },
  {
    id: "isNewTexasBusiness",
    question: "Is this for a new Texas business?",
    detail:
      "The free filing program covers new business formations filed with the Texas Secretary of State.",
    yesLabel: "Yes, it's a new business",
    noLabel: "No",
  },
  {
    id: "allOwnersVeterans",
    question: "Are all owners veterans?",
    detail:
      "The TVC fee waiver under Texas Business Organizations Code §3.005(b) requires that all owners or organizers be veterans.",
    yesLabel: "Yes, all owners are veterans",
    noLabel: "No, not all owners",
  },
  {
    id: "fullyVeteranOwned",
    question: "Will the business be 100% veteran-owned?",
    detail:
      "The entity must be entirely owned by veterans to qualify for the state filing fee waiver.",
    yesLabel: "Yes, 100% veteran-owned",
    noLabel: "No",
  },
  {
    id: "formingLLC",
    question: "Are you forming an LLC?",
    detail:
      "Hutchrok's free filing program is currently focused on Texas Limited Liability Companies.",
    yesLabel: "Yes, an LLC",
    noLabel: "No, a different entity type",
  },
];

export const INITIAL_ANSWERS: QuizAnswers = {
  isVeteran: null,
  isNewTexasBusiness: null,
  allOwnersVeterans: null,
  fullyVeteranOwned: null,
  formingLLC: null,
};

/**
 * Determine the quiz outcome based on user's answers.
 *
 * - All yes → qualified
 * - Veteran but some "no" on business-structure questions → needs-verification
 * - Not a veteran → not-qualified
 */
export function getOutcome(answers: QuizAnswers): QuizOutcome {
  // Not a veteran at all → cannot qualify
  if (answers.isVeteran === false) {
    return "not-qualified";
  }

  // All questions answered "yes"
  const allYes =
    answers.isVeteran === true &&
    answers.isNewTexasBusiness === true &&
    answers.allOwnersVeterans === true &&
    answers.fullyVeteranOwned === true &&
    answers.formingLLC === true;

  if (allYes) {
    return "qualified";
  }

  // Veteran but not fully ready on business structure
  if (answers.isVeteran === true) {
    return "needs-verification";
  }

  return "not-qualified";
}

/** Persist answers to localStorage */
export function saveAnswers(answers: QuizAnswers): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
  } catch {
    // localStorage unavailable (SSR, private browsing) — silent fail
  }
}

/** Load answers from localStorage (returns null if none) */
export function loadAnswers(): QuizAnswers | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as QuizAnswers;
  } catch {
    return null;
  }
}

/** Clear persisted answers */
export function clearAnswers(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // silent
  }
}
