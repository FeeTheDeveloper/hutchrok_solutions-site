import { SignUp } from "@clerk/nextjs";

export const dynamic = "force-dynamic";
const CLERK_READY =
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && !!process.env.CLERK_SECRET_KEY;

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-cream px-4 py-10">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-gold">
            Create Account
          </p>
          <h1 className="mt-2 text-3xl font-bold text-navy sm:text-4xl">
            Account Setup for Holders & Subscribers
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Use your email address as your username. During onboarding, account
            details are organized into two profile sections.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border/70 bg-cream p-4">
              <h2 className="text-base font-semibold text-navy">Personal Info</h2>
              <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                <li>• Full name</li>
                <li>• Preferred contact details</li>
                <li>• Account access details</li>
              </ul>
            </div>
            <div className="rounded-xl border border-border/70 bg-cream p-4">
              <h2 className="text-base font-semibold text-navy">Business Info</h2>
              <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                <li>• Business name</li>
                <li>• Business stage and services</li>
                <li>• Operational contact details</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-6">
          {CLERK_READY ? (
            <SignUp forceRedirectUrl="/dashboard" signInUrl="/login" />
          ) : (
            <div className="w-full max-w-md rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
              Sign up is currently unavailable because authentication is not configured.
              Add <code className="font-mono">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> and{" "}
              <code className="font-mono">CLERK_SECRET_KEY</code> to your environment settings.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
