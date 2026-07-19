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
            <div className="w-full max-w-md rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
              Login is currently unavailable because authentication is not configured.
              Add <code className="font-mono">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> to your environment settings and restart/redeploy.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
