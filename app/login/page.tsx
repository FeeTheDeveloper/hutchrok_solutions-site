import Link from "next/link";
import { SignIn } from "@clerk/nextjs";

export const dynamic = "force-dynamic";
const CLERK_READY = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-cream px-4 py-10">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-gold">
            Secure Access
          </p>
          <h1 className="mt-2 text-3xl font-bold text-navy sm:text-4xl">
            Account Holder & Subscriber Login
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Sign in with your account credentials. Your username is your email
            address, and your account profile is organized into two sections:
            personal information and business information.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-navy">
            <li>• Username: Email address</li>
            <li>• Personal information profile</li>
            <li>• Business information profile</li>
          </ul>
          <p className="mt-6 text-sm text-muted-foreground">
            New here?{" "}
            <Link href="/sign-up" className="font-semibold text-gold hover:underline">
              Create your account
            </Link>
          </p>
        </section>

        <section className="flex items-center justify-center rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-6">
          {CLERK_READY ? (
            <SignIn forceRedirectUrl="/dashboard" signUpUrl="/sign-up" />
          ) : (
            <div className="w-full max-w-md rounded-xl border border-border bg-cream p-6 text-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-gold">
                Account Access
              </p>
              <h2 className="mt-2 text-2xl font-bold text-navy">
                Portal maintenance in progress
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Online account access is temporarily unavailable while we
                complete a secure upgrade. Your case and documents remain
                protected. Contact Hutchrok if you need immediate assistance.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/contact"
                  className="inline-flex min-h-11 items-center justify-center rounded-lg bg-navy px-5 py-3 text-sm font-semibold text-white transition hover:bg-navy/90"
                >
                  Contact Support
                </Link>
                <Link
                  href="/"
                  className="inline-flex min-h-11 items-center justify-center rounded-lg border border-navy px-5 py-3 text-sm font-semibold text-navy transition hover:bg-white"
                >
                  Return Home
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
