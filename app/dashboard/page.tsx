import { auth, currentUser } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HutchrokConcierge } from "@/components/concierge/hutchrok-concierge";
import { Button } from "@/components/ui/button";
import { getRoleFromClaims } from "@/lib/auth/roles";
import { getDashboardWorkspaceSnapshot } from "@/lib/dashboard/workspace";

export default async function DashboardPage() {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    redirect("/sign-in?redirect_url=/dashboard");
  }

  const user = await currentUser();
  const role = getRoleFromClaims(sessionClaims);
  const workspace = getDashboardWorkspaceSnapshot(user?.fullName);

  return (
    <div className="min-h-screen bg-cream">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-3xl font-bold text-navy mb-2">Client Dashboard</h1>
        <p className="text-muted-foreground mb-8">
          {workspace.greeting} This workspace is built for your active case and next actions.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Authenticated Clerk user details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="font-semibold">User ID:</span> {user?.id}
              </p>
              <p>
                <span className="font-semibold">Name:</span> {user?.fullName ?? "Not set"}
              </p>
              <p>
                <span className="font-semibold">Email:</span>{" "}
                {user?.primaryEmailAddress?.emailAddress ?? "Not set"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Authorization</CardTitle>
              <CardDescription>Role scaffolding for future RBAC.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="font-semibold">Resolved role:</span> {role ?? "unassigned"}
              </p>
              <p className="text-muted-foreground">
                TODO(auth-rbac): enforce route and data authorization by Clerk role (`admin` / `client`).
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{workspace.caseStatusLabel}</CardTitle>
            <CardDescription>
              Placeholder panel for veteran filing case timeline, status, and document tasks.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {workspace.caseStatusDetail}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump to common tasks in one tap.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {workspace.quickActions.map((action) => (
              <div key={action.label} className="rounded-lg border border-border/60 p-4">
                <p className="font-semibold text-navy text-sm">{action.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{action.description}</p>
                <Button asChild size="sm" variant="outline" className="mt-3 w-full sm:w-auto">
                  <Link href={action.href}>Open</Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Concierge Assistant</CardTitle>
            <CardDescription>
              Suggestions here are tailored to your dashboard context and client workflow.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HutchrokConcierge mode="client" preferContextNudge />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
