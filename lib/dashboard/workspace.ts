export interface DashboardQuickAction {
  label: string;
  description: string;
  href: string;
}

export interface DashboardWorkspaceSnapshot {
  greeting: string;
  caseStatusLabel: string;
  caseStatusDetail: string;
  quickActions: DashboardQuickAction[];
}

export function getDashboardWorkspaceSnapshot(name?: string | null): DashboardWorkspaceSnapshot {
  return {
    greeting: name ? `Welcome back, ${name.split(" ")[0]}.` : "Welcome back.",
    caseStatusLabel: "Case status placeholder",
    caseStatusDetail:
      "Live status and timeline will populate here once case data is connected from Supabase.",
    quickActions: [
      {
        label: "Track My Filing",
        description: "Check your live filing stage, timeline, and documents by case number.",
        href: "/track",
      },
      {
        label: "Start a New Filing",
        description: "Begin a free Texas LLC formation intake in a few guided steps.",
        href: "/contact",
      },
      {
        label: "Contact Support",
        description: "Reach the concierge team for case-specific assistance.",
        href: "/contact",
      },
      {
        label: "Explore Add-On Services",
        description: "See optional services that can support launch and compliance.",
        href: "/services",
      },
    ],
  };
}
