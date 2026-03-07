/**
 * Hutchrok Concierge — deterministic decision tree
 *
 * Each node has a message, optional subtitle, and an array of options.
 * Options can route to another node (next) or to an external page (href).
 * This structure is AI-upgrade-ready: swap the tree for an LLM resolver later.
 */

export interface ConciergeOption {
  label: string;
  /** Navigate to another node in the tree */
  next?: string;
  /** Navigate to an app route */
  href?: string;
  /** Icon key (resolved in the component) */
  icon?: string;
}

export interface ConciergeNode {
  id: string;
  message: string;
  subtitle?: string;
  options: ConciergeOption[];
}

export const CONCIERGE_TREE: Record<string, ConciergeNode> = {
  /* ── Initial ── */
  root: {
    id: "root",
    message: "How can Hutchrok help you today?",
    subtitle:
      "Pick the option that best describes where you are — I'll point you in the right direction.",
    options: [
      {
        label: "I want to start my business for free",
        icon: "FileText",
        next: "qualification",
      },
      {
        label: "I don't know if I qualify",
        icon: "BadgeCheck",
        next: "qualification",
      },
      {
        label: "I need help getting my veteran verification",
        icon: "Shield",
        next: "verification",
      },
      {
        label: "I already have my verification",
        icon: "CheckCircle",
        next: "intake",
      },
      {
        label: "I need help building my business after filing",
        icon: "Rocket",
        next: "launchServices",
      },
    ],
  },

  /* ── Qualification ── */
  qualification: {
    id: "qualification",
    message: "Let's see if you qualify for a free Texas LLC filing.",
    subtitle:
      "The eligibility quiz takes about 30 seconds. You'll need to be a U.S. veteran with an honorable discharge, forming a 100% veteran-owned Texas LLC.",
    options: [
      {
        label: "Take the Eligibility Quiz",
        icon: "ArrowRight",
        href: "/eligibility",
      },
      {
        label: "Tell me the requirements first",
        icon: "Info",
        next: "qualification-details",
      },
      {
        label: "Go back",
        icon: "ChevronLeft",
        next: "root",
      },
    ],
  },

  "qualification-details": {
    id: "qualification-details",
    message: "Here's what's required to qualify:",
    subtitle:
      "You must be a U.S. military veteran (honorable discharge), forming a new Texas LLC that is 100% veteran-owned. You'll also need a Veteran Verification Letter from the Texas Veterans Commission.",
    options: [
      {
        label: "I think I qualify — take the quiz",
        icon: "ArrowRight",
        href: "/eligibility",
      },
      {
        label: "I need help with verification",
        icon: "Shield",
        next: "verification",
      },
      {
        label: "Start over",
        icon: "ChevronLeft",
        next: "root",
      },
    ],
  },

  /* ── Verification ── */
  verification: {
    id: "verification",
    message: "The Veteran Verification Letter (VVL) is what makes free filing possible.",
    subtitle:
      "TVC issues the letter and sends it directly to the Texas Secretary of State. Without it, the standard filing fee is $300.",
    options: [
      {
        label: "Show me how to get verified",
        icon: "ArrowRight",
        href: "/verification-help",
      },
      {
        label: "I already have my VVL",
        icon: "CheckCircle",
        next: "intake",
      },
      {
        label: "Go back",
        icon: "ChevronLeft",
        next: "root",
      },
    ],
  },

  /* ── Intake ── */
  intake: {
    id: "intake",
    message: "Great — you're ready to move forward.",
    subtitle:
      "Since you already have your verification, you can go straight to the intake form. We'll collect your LLC details and get your filing started. It takes about 5 minutes.",
    options: [
      {
        label: "Start my filing",
        icon: "ArrowRight",
        href: "/contact",
      },
      {
        label: "Check eligibility first",
        icon: "BadgeCheck",
        href: "/eligibility",
      },
      {
        label: "Go back",
        icon: "ChevronLeft",
        next: "root",
      },
    ],
  },

  /* ── Launch Services ── */
  launchServices: {
    id: "launchServices",
    message: "After your LLC is filed, we can help you launch properly.",
    subtitle:
      "Websites, branding, logo design, business email, domain & hosting, and compliance setup — all available as paid services after your free filing.",
    options: [
      {
        label: "View launch services",
        icon: "ArrowRight",
        href: "/launch-services",
      },
      {
        label: "I need to file my LLC first",
        icon: "FileText",
        next: "qualification",
      },
      {
        label: "Go back",
        icon: "ChevronLeft",
        next: "root",
      },
    ],
  },
};
