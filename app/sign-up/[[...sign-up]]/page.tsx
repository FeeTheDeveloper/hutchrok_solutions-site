import Link from "next/link";
import { SignUp } from "@clerk/nextjs";

export const dynamic = "force-dynamic";
const CLERK_READY = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

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
            <div className="w-full max-w-md rounded-xl border border-border bg-cream p-6 text-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-gold">
                Account Access
              </p>
              <h2 className="mt-2 text-2xl font-bold text-navy">
                Let&apos;s get your business started
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                New online account registration is temporarily being upgraded.
                Complete the secure Hutchrok intake and our team will set up your
                account access.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/get-started"
                  className="inline-flex min-h-11 items-center justify-center rounded-lg bg-navy px-5 py-3 text-sm font-semibold text-white transition hover:bg-navy/90"
                >
                  Start Your Intake
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex min-h-11 items-center justify-center rounded-lg border border-navy px-5 py-3 text-sm font-semibold text-navy transition hover:bg-white"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
