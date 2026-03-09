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
        label: "View Case Status",
        description: "Review your filing stage, owner, and latest timeline updates.",
        href: "/dashboard",
      },
      {
        label: "Upload Documents",
        description: "Submit requested case documents securely from your dashboard.",
        href: "/dashboard",
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
