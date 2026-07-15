import { auth, currentUser } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HutchrokConcierge } from "@/components/concierge/hutchrok-concierge";
import { Button } from "@/components/ui/button";
import { getDashboardWorkspaceSnapshot } from "@/lib/dashboard/workspace";
import { getClientCases } from "@/lib/services/client-cases";
import FilingTracker from "@/components/filing-tracker";
import ClientCaseCard from "@/components/client-case-card";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in?redirect_url=/dashboard");
  }

  const user = await currentUser();
  const workspace = getDashboardWorkspaceSnapshot(user?.fullName);

  // Claim + list this user's filing cases by verified email match.
  const verifiedEmails = (user?.emailAddresses ?? [])
    .filter((e) => e.verification?.status === "verified")
    .map((e) => e.emailAddress);
  const cases = await getClientCases(userId, verifiedEmails);

  return (
    <div className="min-h-screen bg-cream">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-3xl font-bold text-navy mb-2">Client Dashboard</h1>
        <p className="text-muted-foreground mb-8">
          {workspace.greeting} This workspace is built for your active case and next actions.
        </p>

        {/* ── Your filings (auto-linked by verified email) ── */}
        {cases.length > 0 ? (
          <div className="grid gap-4">
            {cases.map((c) => (
              <ClientCaseCard key={c.id} clientCase={c} />
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No filings linked yet</CardTitle>
              <CardDescription>
                Filings submitted with{" "}
                {user?.primaryEmailAddress?.emailAddress ?? "your verified email"}{" "}
                appear here automatically. Started one under a different email?
                Look it up below, or begin a new filing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="bg-gold hover:bg-gold-dark text-navy font-bold">
                <Link href="/contact">Start a Free Texas Filing</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Track Another Filing</CardTitle>
            <CardDescription>
              Enter a case number to see its live filing status, timeline, and documents.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FilingTracker
              initialEmail={user?.primaryEmailAddress?.emailAddress ?? ""}
              compact
            />
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
