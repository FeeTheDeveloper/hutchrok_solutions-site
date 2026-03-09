import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getRoleFromClaims } from "@/lib/auth/roles";

export default async function DashboardPage() {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    redirect("/sign-in?redirect_url=/dashboard");
  }

  const user = await currentUser();
  const role = getRoleFromClaims(sessionClaims);

  return (
    <div className="min-h-screen bg-cream">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-3xl font-bold text-navy mb-2">Client Dashboard</h1>
        <p className="text-muted-foreground mb-8">
          Welcome back. This workspace will soon show filing progress and case updates.
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
            <CardTitle>Case Activity (Coming Soon)</CardTitle>
            <CardDescription>
              Placeholder panel for veteran filing case timeline, status, and document tasks.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            TODO(cases): load authenticated client case list and milestone progress.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
