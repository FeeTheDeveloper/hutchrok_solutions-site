/**
 * Hutchrok Concierge — deterministic decision tree
 *
 * Each node has a message, optional subtitle, and an array of options.
 * Options can route to another node (next) or to an external page (href).
 * Nodes can show a lead-capture prompt (showLeadCapture) and trust signals (showTrust).
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
  /** Show lead-capture email prompt after idle on this node */
  showLeadCapture?: boolean;
  /** Show micro trust signals beneath the options */
  showTrust?: boolean;
}

/** Context-aware nudge config — keyed by pathname prefix */
export interface ContextNudge {
  message: string;
  subtitle?: string;
  options: ConciergeOption[];
}

/**
 * Map pathname prefixes to context-aware nudges.
 * The floating concierge will check the current path and, if it matches,
 * start with a contextual greeting instead of root.
 */
export const CONTEXT_NUDGES: Record<string, ContextNudge> = {
  "/guides/": {
    message: "Ready to put what you've learned into action?",
    subtitle:
      "Based on the guide you're reading, here are your recommended next steps.",
    options: [
      {
        label: "Check my eligibility for free filing",
        icon: "BadgeCheck",
        href: "/eligibility",
      },
      {
        label: "Learn about verification",
        icon: "Shield",
        href: "/verification-help",
      },
      {
        label: "Start my intake form",
        icon: "ArrowRight",
        href: "/contact",
      },
      {
        label: "Explore more options",
        icon: "MessageCircle",
        next: "root",
      },
    ],
  },
  "/eligibility": {
    message: "Need help with the eligibility process?",
    subtitle:
      "I can walk you through the requirements or connect you with the next step.",
    options: [
      {
        label: "What are the requirements?",
        icon: "Info",
        next: "qualification-details",
      },
      {
        label: "I need help with verification",
        icon: "Shield",
        next: "verification",
      },
      {
        label: "Explore more options",
        icon: "MessageCircle",
        next: "root",
      },
    ],
  },
  "/verification-help": {
    message: "Working on your Veteran Verification Letter?",
    subtitle:
      "Once you have your VVL, you're ready to file. Let me know how I can help.",
    options: [
      {
        label: "I already have my VVL",
        icon: "CheckCircle",
        next: "intake",
      },
      {
        label: "Check my eligibility first",
        icon: "BadgeCheck",
        href: "/eligibility",
      },
      {
        label: "Explore more options",
        icon: "MessageCircle",
        next: "root",
      },
    ],
  },
  "/free-filing": {
    message: "Ready to see if you qualify for free filing?",
    subtitle:
      "The eligibility quiz takes about 30 seconds. If you qualify, we handle everything.",
    options: [
      {
        label: "Take the eligibility quiz",
        icon: "ArrowRight",
        href: "/eligibility",
      },
      {
        label: "I already qualify — start intake",
        icon: "CheckCircle",
        href: "/contact",
      },
      {
        label: "Explore more options",
        icon: "MessageCircle",
        next: "root",
      },
    ],
  },
  "/launch-services": {
    message: "Interested in launch support?",
    subtitle:
      "Our post-filing services help you set up everything you need to operate. But first — is your LLC filed?",
    options: [
      {
        label: "My LLC is filed — view services",
        icon: "Rocket",
        href: "/launch-services",
      },
      {
        label: "I need to file my LLC first",
        icon: "FileText",
        next: "qualification",
      },
      {
        label: "Explore more options",
        icon: "MessageCircle",
        next: "root",
      },
    ],
  },
};

/** Micro trust signals displayed beneath concierge options */
export const TRUST_SIGNALS = [
  "Texas-focused platform",
  "Veteran-focused support",
  "Filing prepared by operators",
] as const;

export const CONCIERGE_TREE: Record<string, ConciergeNode> = {
  /* ── Initial ── */
  root: {
    id: "root",
    message: "How can Hutchrok help you today?",
    subtitle:
      "Pick the option that best describes where you are — I'll point you in the right direction.",
    showTrust: true,
    options: [
      {
        label: "I want to start a business",
        icon: "FileText",
        next: "start-business",
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

  /* ── Guided Funnel: Start a Business ── */
  "start-business": {
    id: "start-business",
    message:
      "Starting a Texas business as a veteran can qualify you for filing fee exemptions.",
    subtitle:
      "Hutchrok can help you navigate the process. The state filing fee for an LLC is $300 — but veterans with a Verification Letter from the Texas Veterans Commission file for free.",
    showLeadCapture: true,
    showTrust: true,
    options: [
      {
        label: "Check my eligibility",
        icon: "BadgeCheck",
        href: "/eligibility",
      },
      {
        label: "Learn about verification",
        icon: "Shield",
        next: "verification",
      },
      {
        label: "Start my intake form",
        icon: "ArrowRight",
        href: "/contact",
      },
      {
        label: "Go back",
        icon: "ChevronLeft",
        next: "root",
      },
    ],
  },

  /* ── Qualification ── */
  qualification: {
    id: "qualification",
    message: "Let's see if you qualify for a free Texas LLC filing.",
    subtitle:
      "The eligibility quiz takes about 30 seconds. You'll need to be a U.S. veteran with an honorable discharge, forming a 100% veteran-owned Texas LLC.",
    showLeadCapture: true,
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
    showLeadCapture: true,
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
    message:
      "The Veteran Verification Letter (VVL) is what makes free filing possible.",
    subtitle:
      "TVC issues the letter and sends it directly to the Texas Secretary of State. Without it, the standard filing fee is $300.",
    showLeadCapture: true,
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
    showTrust: true,
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

  /* ── Lead Capture Thank You ── */
  "lead-thanks": {
    id: "lead-thanks",
    message: "You're all set!",
    subtitle:
      "We'll send you a quick email with next steps for starting your veteran-owned Texas LLC. No spam — just the info you need.",
    showTrust: true,
    options: [
      {
        label: "Check my eligibility now",
        icon: "BadgeCheck",
        href: "/eligibility",
      },
      {
        label: "Browse veteran guides",
        icon: "Info",
        href: "/guides",
      },
      {
        label: "Start over",
        icon: "ChevronLeft",
        next: "root",
      },
    ],
  },
};
