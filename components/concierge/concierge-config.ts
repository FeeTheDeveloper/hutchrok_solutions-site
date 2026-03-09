export type ConciergeMode = "public" | "client" | "admin";

export interface ConciergeOption {
  label: string;
  next?: string;
  href?: string;
  icon?: string;
}

export interface ConciergeIntent {
  id: string;
  label: string;
  summary: string;
}

export interface ConciergeNode {
  id: string;
  intentId: string;
  message: string;
  subtitle?: string;
  options: ConciergeOption[];
  showLeadCapture?: boolean;
  showTrust?: boolean;
}

export interface ContextNudge {
  message: string;
  subtitle?: string;
  options: ConciergeOption[];
}

export interface ConciergeModeConfig {
  mode: ConciergeMode;
  rootNodeId: string;
  intents: Record<string, ConciergeIntent>;
  nodes: Record<string, ConciergeNode>;
  contextNudges: Record<string, ContextNudge>;
}

export const TRUST_SIGNALS = [
  "Texas-focused platform",
  "Veteran-focused support",
  "Filing prepared by operators",
] as const;

const PUBLIC_INTENTS: Record<string, ConciergeIntent> = {
  routeStart: {
    id: "routeStart",
    label: "Route public visitor to a starting point",
    summary: "Direct first-time visitors to the right page quickly.",
  },
  eligibilityQuiz: {
    id: "eligibilityQuiz",
    label: "Eligibility quiz",
    summary: "Send the visitor to qualification screening.",
  },
  intakeForm: {
    id: "intakeForm",
    label: "Intake form",
    summary: "Route visitors with verification to intake.",
  },
  consultation: {
    id: "consultation",
    label: "Consultation/contact",
    summary: "Route to support and consultation channels.",
  },
  servicePages: {
    id: "servicePages",
    label: "Service page routing",
    summary: "Route to service and launch support pages.",
  },
  filingGuidance: {
    id: "filingGuidance",
    label: "Filing guidance",
    summary: "Route to filing and guide content.",
  },
};

const CLIENT_INTENTS: Record<string, ConciergeIntent> = {
  caseStatus: {
    id: "caseStatus",
    label: "Case status explanation",
    summary: "Explain current case stage and what it means.",
  },
  nextStep: {
    id: "nextStep",
    label: "Next-step guidance",
    summary: "Guide client to immediate next action.",
  },
  documentUpload: {
    id: "documentUpload",
    label: "Document upload guidance",
    summary: "Help client prepare and submit required docs.",
  },
  addOnServices: {
    id: "addOnServices",
    label: "Add-on service suggestions",
    summary: "Suggest optional post-filing services.",
  },
};

const ADMIN_INTENTS: Record<string, ConciergeIntent> = {
  caseTriage: {
    id: "caseTriage",
    label: "Case triage guidance",
    summary: "Help operators route and prioritize cases.",
  },
  intakeCompleteness: {
    id: "intakeCompleteness",
    label: "Intake completeness prompts",
    summary: "Prompt on missing intake data.",
  },
  filingFormSuggest: {
    id: "filingFormSuggest",
    label: "Filing form suggestion prompts",
    summary: "Suggest form paths and filing bundles.",
  },
  opsSync: {
    id: "opsSync",
    label: "Ops sync visibility prompts",
    summary: "Highlight sync actions and webhook visibility.",
  },
};

const PUBLIC_NODES: Record<string, ConciergeNode> = {
  root: {
    id: "root",
    intentId: "routeStart",
    message: "How can Hutchrok help you today?",
    subtitle:
      "Pick where you are in the process and I’ll route you to the right next step.",
    showTrust: true,
    options: [
      { label: "Sign in to your workspace", icon: "ArrowRight", href: "/sign-in" },
      { label: "Start intake form", icon: "FileText", href: "/contact" },
      { label: "Check eligibility", icon: "BadgeCheck", href: "/eligibility" },
      { label: "Book consultation / contact", icon: "Mail", href: "/contact" },
      { label: "Explore service pages", icon: "Rocket", next: "public-services" },
    ],
  },
  "public-services": {
    id: "public-services",
    intentId: "servicePages",
    message: "Here are the best service pages based on where you are.",
    options: [
      { label: "Formation filing support", icon: "FileText", href: "/formation-filings" },
      { label: "Launch services", icon: "Rocket", href: "/launch-services" },
      { label: "All services overview", icon: "ArrowRight", href: "/services" },
      { label: "Go back", icon: "ChevronLeft", next: "root" },
    ],
  },
  "public-filing-guidance": {
    id: "public-filing-guidance",
    intentId: "filingGuidance",
    message: "Need filing guidance before you start?",
    subtitle: "Use our in-depth filing and veteran business guides.",
    showLeadCapture: true,
    options: [
      { label: "Read filing guidance", icon: "Info", href: "/formation-filings" },
      { label: "Browse all guides", icon: "ArrowRight", href: "/guides" },
      { label: "Talk to concierge team", icon: "Mail", href: "/contact" },
      { label: "Go back", icon: "ChevronLeft", next: "root" },
    ],
  },
  "lead-thanks": {
    id: "lead-thanks",
    intentId: "consultation",
    message: "You’re all set!",
    subtitle: "We’ll send next steps and helpful links to your inbox.",
    showTrust: true,
    options: [
      { label: "Take the eligibility quiz", icon: "BadgeCheck", href: "/eligibility" },
      { label: "Contact concierge", icon: "Mail", href: "/contact" },
      { label: "Start over", icon: "ChevronLeft", next: "root" },
    ],
  },
};

const CLIENT_NODES: Record<string, ConciergeNode> = {
  root: {
    id: "root",
    intentId: "caseStatus",
    message: "Welcome back. What do you need help with in your case?",
    subtitle: "I can explain status, next steps, uploads, and recommended add-ons.",
    options: [
      { label: "Explain my case status", icon: "Info", next: "client-case-status" },
      { label: "Show my next step", icon: "ArrowRight", next: "client-next-step" },
      { label: "Help with document upload", icon: "FileText", next: "client-doc-upload" },
      { label: "Suggest add-on services", icon: "Rocket", next: "client-add-ons" },
    ],
  },
  "client-case-status": {
    id: "client-case-status",
    intentId: "caseStatus",
    message: "Case status explanations are tied to your dashboard stage labels.",
    subtitle: "Open your dashboard for the live stage, owner, and latest activity.",
    options: [
      { label: "Open dashboard", icon: "ArrowRight", href: "/dashboard" },
      { label: "Go back", icon: "ChevronLeft", next: "root" },
    ],
  },
  "client-next-step": {
    id: "client-next-step",
    intentId: "nextStep",
    message: "Next-step guidance prioritizes unblockers first.",
    subtitle:
      "Placeholder: this will map to your active case checklist once dynamic tasks are connected.",
    options: [
      { label: "Open dashboard next steps", icon: "CheckCircle", href: "/dashboard" },
      { label: "Contact support", icon: "Mail", href: "/contact" },
      { label: "Go back", icon: "ChevronLeft", next: "root" },
    ],
  },
  "client-doc-upload": {
    id: "client-doc-upload",
    intentId: "documentUpload",
    message: "For document uploads, we validate file type and naming guidance.",
    subtitle:
      "Placeholder: uploads will route to case-specific document requests when connected.",
    options: [
      { label: "Open uploads in dashboard", icon: "FileText", href: "/dashboard" },
      { label: "Upload troubleshooting", icon: "HelpCircle", href: "/contact" },
      { label: "Go back", icon: "ChevronLeft", next: "root" },
    ],
  },
  "client-add-ons": {
    id: "client-add-ons",
    intentId: "addOnServices",
    message: "Based on your stage, we can suggest high-impact add-on services.",
    options: [
      { label: "See launch services", icon: "Rocket", href: "/launch-services" },
      { label: "Browse services", icon: "ArrowRight", href: "/services" },
      { label: "Go back", icon: "ChevronLeft", next: "root" },
    ],
  },
};

const ADMIN_NODES: Record<string, ConciergeNode> = {
  root: {
    id: "root",
    intentId: "caseTriage",
    message: "Operator concierge is ready. What workflow are you running?",
    subtitle:
      "Use prompts for triage, intake checks, form routing, and sync visibility (role-aware placeholder hooks enabled).",
    options: [
      { label: "Case triage guidance", icon: "Info", next: "admin-triage" },
      { label: "Intake completeness prompts", icon: "CheckCircle", next: "admin-intake" },
      { label: "Filing form suggestions", icon: "FileText", next: "admin-filing" },
      { label: "Ops sync visibility", icon: "MessageCircle", next: "admin-sync" },
    ],
  },
  "admin-triage": {
    id: "admin-triage",
    intentId: "caseTriage",
    message:
      "Triage prompts focus on urgency, blocker type, and owner assignment (placeholder for live queue metadata).",
    options: [
      { label: "Open admin queue", icon: "ArrowRight", href: "/admin" },
      { label: "Go back", icon: "ChevronLeft", next: "root" },
    ],
  },
  "admin-intake": {
    id: "admin-intake",
    intentId: "intakeCompleteness",
    message:
      "Intake completeness checks highlight missing legal and contact fields (placeholder for field-level validators).",
    options: [
      { label: "Review intake records", icon: "ArrowRight", href: "/admin" },
      { label: "Go back", icon: "ChevronLeft", next: "root" },
    ],
  },
  "admin-filing": {
    id: "admin-filing",
    intentId: "filingFormSuggest",
    message:
      "Filing suggestion prompts map case type to the best form bundle (placeholder for rules engine outputs).",
    options: [
      { label: "Open filing workflows", icon: "FileText", href: "/admin" },
      { label: "Go back", icon: "ChevronLeft", next: "root" },
    ],
  },
  "admin-sync": {
    id: "admin-sync",
    intentId: "opsSync",
    message:
      "Ops sync prompts show latest document publish and status sync events (placeholder for event stream integration).",
    options: [
      { label: "View ops dashboard", icon: "ArrowRight", href: "/admin" },
      { label: "Go back", icon: "ChevronLeft", next: "root" },
    ],
  },
};

const PUBLIC_CONTEXT_NUDGES: Record<string, ContextNudge> = {
  "/guides/": {
    message: "Ready to put what you've learned into action?",
    subtitle: "Based on this guide, here are your next steps.",
    options: [
      { label: "Take eligibility quiz", icon: "BadgeCheck", href: "/eligibility" },
      { label: "Start intake form", icon: "ArrowRight", href: "/contact" },
      { label: "See filing guidance", icon: "Info", href: "/formation-filings" },
      { label: "More options", icon: "MessageCircle", next: "root" },
    ],
  },
  "/eligibility": {
    message: "Need help with eligibility?",
    subtitle: "I can route you to verification, intake, or filing guidance.",
    options: [
      { label: "Verification help", icon: "Shield", href: "/verification-help" },
      { label: "Start intake", icon: "ArrowRight", href: "/contact" },
      { label: "More options", icon: "MessageCircle", next: "root" },
    ],
  },
};

const CLIENT_CONTEXT_NUDGES: Record<string, ContextNudge> = {
  "/dashboard": {
    message: "Need help understanding your case workspace?",
    options: [
      { label: "Explain case status", icon: "Info", next: "client-case-status" },
      { label: "Next-step guidance", icon: "ArrowRight", next: "client-next-step" },
      { label: "Upload guidance", icon: "FileText", next: "client-doc-upload" },
    ],
  },
};

const ADMIN_CONTEXT_NUDGES: Record<string, ContextNudge> = {
  "/admin": {
    message: "Operator mode detected — choose your prompt pack.",
    options: [
      { label: "Case triage", icon: "Info", next: "admin-triage" },
      { label: "Intake completeness", icon: "CheckCircle", next: "admin-intake" },
      { label: "Form suggestions", icon: "FileText", next: "admin-filing" },
    ],
  },
};

export const CONCIERGE_MODE_CONFIG: Record<ConciergeMode, ConciergeModeConfig> = {
  public: {
    mode: "public",
    rootNodeId: "root",
    intents: PUBLIC_INTENTS,
    nodes: PUBLIC_NODES,
    contextNudges: PUBLIC_CONTEXT_NUDGES,
  },
  client: {
    mode: "client",
    rootNodeId: "root",
    intents: CLIENT_INTENTS,
    nodes: CLIENT_NODES,
    contextNudges: CLIENT_CONTEXT_NUDGES,
  },
  admin: {
    mode: "admin",
    rootNodeId: "root",
    intents: ADMIN_INTENTS,
    nodes: ADMIN_NODES,
    contextNudges: ADMIN_CONTEXT_NUDGES,
  },
};
