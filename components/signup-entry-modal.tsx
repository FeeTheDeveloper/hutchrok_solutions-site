"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dialog } from "radix-ui";
import { SignUp } from "@clerk/nextjs";
import { ArrowLeft, ArrowRight, BadgeCheck, LayoutDashboard, Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CLERK_ENABLED, useAppAuth } from "@/app/providers";
import { SIGNUP_DISCOUNT_CODE, SIGNUP_DISCOUNT_LABEL } from "@/lib/promotions";

/**
 * Entry sign-up popup.
 *
 * Opens shortly after a signed-out visitor lands on the site. Step 1 is a
 * short call-to-action; the primary button swaps the popup straight into the
 * sign-up box (embedded Clerk <SignUp>) without leaving the page.
 *
 * - Never shown to signed-in users or on auth/dashboard/admin routes.
 * - Shown once per browser session; closing it suppresses it until the next visit.
 * - Without Clerk configured, the sign-up step falls back to the intake flow.
 */

const DISMISS_KEY = "hutchrok:signup-modal-dismissed";
const OPEN_DELAY_MS = 700;
const EXCLUDED_PREFIXES = ["/sign-up", "/sign-in", "/login", "/dashboard", "/admin"];

function wasDismissed(): boolean {
  try {
    return window.sessionStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

function markDismissed() {
  try {
    window.sessionStorage.setItem(DISMISS_KEY, "1");
  } catch {
    /* storage unavailable (private mode) — popup may reappear, harmless */
  }
}

const BENEFITS = [
  { icon: Tag, text: `${SIGNUP_DISCOUNT_LABEL} marketing services with code ${SIGNUP_DISCOUNT_CODE}` },
  { icon: LayoutDashboard, text: "Track filings, documents, and service requests in one dashboard" },
  { icon: BadgeCheck, text: "Free Texas LLC filing path for qualified veterans" },
];

export function SignupEntryModal() {
  const pathname = usePathname();
  const { isLoaded, isSignedIn } = useAppAuth();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"cta" | "signup">("cta");

  const excluded = EXCLUDED_PREFIXES.some((p) => pathname?.startsWith(p));

  useEffect(() => {
    if (!isLoaded || isSignedIn || excluded || wasDismissed()) return;
    const t = window.setTimeout(() => setOpen(true), OPEN_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [isLoaded, isSignedIn, excluded]);

  // Hide immediately if the visitor signs in/up or navigates to an excluded route.
  const visible = open && !isSignedIn && !excluded;

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) markDismissed();
  }

  return (
    <Dialog.Root open={visible} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-navy/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-[61] max-h-[92vh] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-gold/30 bg-white shadow-2xl focus:outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <Dialog.Close
            aria-label="Close"
            className="absolute right-3 top-3 z-10 rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white data-[step=signup]:text-navy/60 data-[step=signup]:hover:bg-navy/5 data-[step=signup]:hover:text-navy"
            data-step={step}
          >
            <X className="h-5 w-5" />
          </Dialog.Close>

          {step === "cta" ? (
            <>
              <div className="bg-navy px-6 pb-6 pt-8 text-white">
                <p className="text-xs font-semibold uppercase tracking-widest text-gold">
                  Hutchrok Member Access
                </p>
                <Dialog.Title className="mt-2 text-2xl font-bold leading-tight sm:text-3xl">
                  Create your free account
                </Dialog.Title>
                <Dialog.Description className="mt-2 text-sm leading-relaxed text-white/75">
                  Sign up in under a minute to launch, file, and grow your business with an
                  SBA-certified SDVOSB in your corner.
                </Dialog.Description>
              </div>

              <div className="space-y-5 px-6 py-6">
                <ul className="space-y-3">
                  {BENEFITS.map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-start gap-3 text-sm text-navy">
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  autoFocus
                  onClick={() => setStep("signup")}
                  className="h-12 w-full bg-gold text-[15px] font-semibold text-navy hover:bg-gold-dark"
                >
                  Sign Up Free <ArrowRight className="ml-1 h-4 w-4" />
                </Button>

                <div className="flex items-center justify-between text-sm">
                  <Link
                    href="/login"
                    onClick={() => handleOpenChange(false)}
                    className="font-semibold text-navy hover:text-gold"
                  >
                    Already a member? Sign in
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleOpenChange(false)}
                    className="text-muted-foreground hover:text-navy"
                  >
                    Maybe later
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="px-4 pb-6 pt-12 sm:px-6">
              <Dialog.Title className="sr-only">Sign up for a Hutchrok account</Dialog.Title>
              <Dialog.Description className="sr-only">
                Create your Hutchrok account to access your dashboard.
              </Dialog.Description>
              <button
                type="button"
                onClick={() => setStep("cta")}
                className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm text-navy/70 hover:bg-navy/5 hover:text-navy"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>

              {CLERK_ENABLED ? (
                <div className="flex justify-center">
                  <SignUp
                    routing="hash"
                    forceRedirectUrl="/dashboard"
                    signInUrl="/login"
                    appearance={{
                      elements: {
                        rootBox: "w-full",
                        cardBox: "w-full shadow-none border-0",
                        card: "shadow-none",
                      },
                    }}
                  />
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-cream p-6 text-center">
                  <h2 className="text-xl font-bold text-navy">Let&apos;s get your business started</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    Online registration is being upgraded. Complete the secure Hutchrok intake and
                    our team will set up your account access.
                  </p>
                  <Link
                    href="/get-started"
                    onClick={() => handleOpenChange(false)}
                    className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-navy px-5 py-3 text-sm font-semibold text-white hover:bg-navy/90"
                  >
                    Start Your Intake
                  </Link>
                </div>
              )}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
