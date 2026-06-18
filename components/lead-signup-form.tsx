"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { CheckCircle, Loader2, Tag, Copy, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { CLERK_ENABLED } from "@/app/providers";
import { MARKETING_SERVICES, SIGNUP_DISCOUNT_LABEL } from "@/lib/promotions";

interface LeadState {
  name: string;
  email: string;
  phone: string;
  businessName: string;
  interests: string[];
  marketingOptIn: boolean;
}

const INITIAL: LeadState = {
  name: "",
  email: "",
  phone: "",
  businessName: "",
  interests: [],
  marketingOptIn: true,
};

export default function LeadSignupForm() {
  const [form, setForm] = useState<LeadState>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function toggleInterest(title: string) {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(title)
        ? prev.interests.filter((i) => i !== title)
        : [...prev.interests, title],
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Name is required.";
    if (!form.email.trim()) next.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim()))
      next.email = "Enter a valid email address.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.ok) {
        setErrors(
          data.error?.fields ?? { form: data.error?.message ?? "Sign-up failed." },
        );
        return;
      }
      setCode(data.discountCode);
    } catch {
      setErrors({ form: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  function copyCode() {
    if (!code) return;
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // ── Success state ──
  if (code) {
    return (
      <div className="rounded-2xl border border-gold/40 bg-white p-6 sm:p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-gold/10 flex items-center justify-center">
          <CheckCircle className="h-7 w-7 text-gold" />
        </div>
        <h3 className="text-2xl font-bold text-navy mb-1">You&apos;re in!</h3>
        <p className="text-sm text-muted-foreground mb-5">
          Here&apos;s your {SIGNUP_DISCOUNT_LABEL} code for marketing services.
          Use it when you request a service and we&apos;ll apply it to your quote.
        </p>

        <div className="mx-auto mb-6 inline-flex items-center gap-3 rounded-xl border-2 border-dashed border-gold bg-gold/5 px-5 py-3">
          <Tag className="h-5 w-5 text-gold" />
          <span className="font-mono text-xl font-bold tracking-wider text-navy">
            {code}
          </span>
          <button
            type="button"
            onClick={copyCode}
            className="text-muted-foreground hover:text-navy transition-colors cursor-pointer"
            aria-label="Copy code"
          >
            {copied ? (
              <Check className="h-4 w-4 text-gold" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href={`/service-request?discount=${code}`}>
            <Button className="bg-gold hover:bg-gold-dark text-navy font-bold gap-2">
              Request a Marketing Service
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          {CLERK_ENABLED && (
            <Link href="/sign-up">
              <Button
                variant="outline"
                className="border-navy/30 text-navy hover:bg-navy hover:text-white font-medium"
              >
                Create My Account
              </Button>
            </Link>
          )}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          We emailed your code details too. Save it — it&apos;s good on your
          first marketing service.
        </p>
      </div>
    );
  }

  // ── Form ──
  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border/50 bg-white p-6 sm:p-8 shadow-sm space-y-5"
    >
      {errors.form && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {errors.form}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="lead-name" className="mb-1.5 block">
            Full Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="lead-name"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className={errors.name ? "border-destructive" : ""}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-destructive">{errors.name}</p>
          )}
        </div>
        <div>
          <Label htmlFor="lead-email" className="mb-1.5 block">
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="lead-email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-destructive">{errors.email}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="lead-phone" className="mb-1.5 block">
            Phone <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Input
            id="lead-phone"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="lead-business" className="mb-1.5 block">
            Business Name{" "}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Input
            id="lead-business"
            value={form.businessName}
            onChange={(e) =>
              setForm((p) => ({ ...p, businessName: e.target.value }))
            }
          />
        </div>
      </div>

      <div>
        <Label className="mb-2 block">
          What are you interested in?{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {MARKETING_SERVICES.map((s) => {
            const active = form.interests.includes(s.title);
            return (
              <button
                key={s.slug}
                type="button"
                onClick={() => toggleInterest(s.title)}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm text-left transition-colors cursor-pointer",
                  active
                    ? "border-gold bg-gold/10 text-navy font-medium"
                    : "border-border hover:border-gold/50 text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded border shrink-0",
                    active ? "bg-gold border-gold" : "border-input",
                  )}
                >
                  {active && <Check className="h-3 w-3 text-navy" />}
                </span>
                {s.title}
              </button>
            );
          })}
        </div>
      </div>

      <label className="flex items-start gap-3 cursor-pointer group">
        <button
          type="button"
          role="checkbox"
          aria-checked={form.marketingOptIn}
          onClick={() =>
            setForm((p) => ({ ...p, marketingOptIn: !p.marketingOptIn }))
          }
          className={cn(
            "mt-0.5 h-5 w-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors cursor-pointer",
            form.marketingOptIn
              ? "bg-gold border-gold"
              : "border-input group-hover:border-gold/50",
          )}
        >
          {form.marketingOptIn && <Check className="h-3 w-3 text-navy" />}
        </button>
        <span className="text-sm text-muted-foreground">
          Send me marketing tips and offers from Hutchrok. You can unsubscribe
          anytime.
        </span>
      </label>

      <Button
        type="submit"
        size="lg"
        disabled={submitting}
        className="w-full bg-gold hover:bg-gold-dark text-navy font-bold gap-2 h-12"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Signing you up…
          </>
        ) : (
          <>
            Sign Up &amp; Get {SIGNUP_DISCOUNT_LABEL}
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        No obligation. Your {SIGNUP_DISCOUNT_LABEL} code applies to your first
        marketing service.
      </p>
    </form>
  );
}
