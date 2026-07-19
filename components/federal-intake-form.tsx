"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  FEDERAL_ENTITY_TYPES,
  EIN_STATUSES,
  EMPLOYEE_COUNTS,
  ANNUAL_RECEIPTS_RANGES,
  SAM_ATTEMPT_STATUSES,
} from "@/lib/consulting/federal-contract-prep";
import { validateFederalIntake } from "@/lib/federal-intake";
import { CheckCircle, Loader2, Check, ArrowRight } from "lucide-react";

/**
 * Federal Contract Prep intake — Stage 1 qualification.
 *
 * PRIVACY GUARDRAIL: never add fields for SSN, the EIN number itself,
 * bank details, or login credentials. EIN is a have / don't-have status.
 */

interface FormState {
  name: string;
  email: string;
  phone: string;
  legalEntityName: string;
  stateOfFormation: string;
  entityType: string;
  einStatus: string;
  revenueLines: string;
  employeeCount: string;
  annualReceiptsRange: string;
  veteranStatus: boolean;
  samAttemptStatus: string;
  samAttemptNotes: string;
  contactConsent: boolean;
}

const INITIAL: FormState = {
  name: "",
  email: "",
  phone: "",
  legalEntityName: "",
  stateOfFormation: "",
  entityType: "",
  einStatus: "",
  revenueLines: "",
  employeeCount: "",
  annualReceiptsRange: "",
  veteranStatus: false,
  samAttemptStatus: "",
  samAttemptNotes: "",
  contactConsent: false,
};

const DISCLAIMER =
  "Operational business consulting only — not legal or tax advice. No contract awards are guaranteed. Verify requirements at SAM.gov and SBA.gov.";

interface FederalIntakeResponse {
  ok: boolean;
  error?: { message?: string; fields?: Record<string, string> };
}

function isFederalIntakeResponse(value: unknown): value is FederalIntakeResponse {
  return typeof value === "object" && value !== null && "ok" in value;
}

export default function FederalIntakeForm() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key as string];
      return next;
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validation = validateFederalIntake(form);
    if (!validation.success) {
      const v = validation.fieldErrors ?? {};
      setErrors(v);
      const first = document.querySelector(`[data-field="${Object.keys(v)[0]}"]`);
      first?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/federal-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data: unknown = await res.json();
      if (isFederalIntakeResponse(data) && data.ok) {
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const err = isFederalIntakeResponse(data) ? data.error ?? {} : {};
        setErrors(err.fields ?? { form: err.message ?? "Submission failed." });
      }
    } catch {
      setErrors({
        form: "We couldn't reach our servers. Please try again, or email contact@hutchrok.com.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return <SuccessState />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.form && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {errors.form}
        </div>
      )}

      {/* A. Contact */}
      <Section title="Contact" step="A">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full name" error={errors.name} required>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)}
              className={errors.name ? "border-destructive" : ""} />
          </Field>
          <Field label="Email" error={errors.email} required>
            <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
              className={errors.email ? "border-destructive" : ""} />
          </Field>
        </div>
        <Field label="Phone" error={errors.phone} required>
          <Input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)}
            className={errors.phone ? "border-destructive" : ""} />
        </Field>
      </Section>

      {/* B. Legal Entity */}
      <Section
        title="Legal Entity"
        step="B"
        subtitle="Federal systems reject mismatched names — enter yours exactly as it appears on IRS records."
      >
        <Field label="Legal entity name (exact IRS match)" error={errors.legalEntityName} required>
          <Input value={form.legalEntityName}
            onChange={(e) => set("legalEntityName", e.target.value)}
            placeholder="e.g. Example Services LLC"
            className={errors.legalEntityName ? "border-destructive" : ""} />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="State of formation" error={errors.stateOfFormation} required>
            <Input value={form.stateOfFormation}
              onChange={(e) => set("stateOfFormation", e.target.value)}
              placeholder="e.g. Texas"
              className={errors.stateOfFormation ? "border-destructive" : ""} />
          </Field>
        </div>
        <RadioRow label="Entity type" required error={errors.entityType}
          options={FEDERAL_ENTITY_TYPES} value={form.entityType}
          onChange={(v) => set("entityType", v)} />
        <RadioRow label="EIN status" required error={errors.einStatus}
          options={EIN_STATUSES} value={form.einStatus}
          onChange={(v) => set("einStatus", v)} />
        <p className="text-xs text-muted-foreground -mt-2">
          Status only — never enter your EIN, SSN, or any tax ID number on this form.
        </p>
      </Section>

      {/* C. Business Profile */}
      <Section title="Business Profile" step="C">
        <Field label="What does your business sell? (revenue lines)"
          error={errors.revenueLines} required>
          <Textarea rows={3} value={form.revenueLines}
            onChange={(e) => set("revenueLines", e.target.value)}
            placeholder="Products or services, one per line"
            className={errors.revenueLines ? "border-destructive" : ""} />
        </Field>
        <RadioRow label="Employee count" required error={errors.employeeCount}
          options={EMPLOYEE_COUNTS} value={form.employeeCount}
          onChange={(v) => set("employeeCount", v)} />
        <RadioRow label="Annual receipts range" required error={errors.annualReceiptsRange}
          options={ANNUAL_RECEIPTS_RANGES} value={form.annualReceiptsRange}
          onChange={(v) => set("annualReceiptsRange", v)} />
        <FormCheckbox checked={form.veteranStatus} onChange={(v) => set("veteranStatus", v)}
          label="I am a U.S. military veteran (self-reported)"
          description="Used for program-eligibility routing only. Non-veterans are welcome clients." />
      </Section>

      {/* D. SAM.gov History */}
      <Section title="SAM.gov History" step="D">
        <RadioRow label="Have you attempted SAM.gov registration before?" required
          error={errors.samAttemptStatus} options={SAM_ATTEMPT_STATUSES}
          value={form.samAttemptStatus} onChange={(v) => set("samAttemptStatus", v)} />
        <Field label="Tell us about prior SAM.gov attempts (optional)" error={errors.samAttemptNotes}>
          <Textarea rows={3} value={form.samAttemptNotes}
            onChange={(e) => set("samAttemptNotes", e.target.value)}
            placeholder="Where did it stall? Any error messages or validation issues?" />
        </Field>
      </Section>

      {/* Consent + disclaimer */}
      <Section title="Consent" step="E">
        <div data-field="contactConsent">
          <FormCheckbox checked={form.contactConsent} onChange={(v) => set("contactConsent", v)}
            label="I agree to be contacted by Hutchrok Solutions Group by phone, text message, or email about this request."
            description="Message and data rates may apply. Consent is not a condition of purchase. Reply STOP to opt out of texts." />
          {errors.contactConsent && (
            <p className="text-xs text-destructive mt-1">{errors.contactConsent}</p>
          )}
        </div>
        <p className="rounded-lg border border-border/50 bg-cream/60 p-3 text-xs text-muted-foreground leading-relaxed">
          {DISCLAIMER}
        </p>
      </Section>

      <Button type="submit" size="lg" disabled={submitting}
        className="w-full bg-gold hover:bg-gold-dark text-navy font-bold gap-2 h-12">
        {submitting ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
        ) : (
          <>Request My Readiness Review <ArrowRight className="h-4 w-4" /></>
        )}
      </Button>
    </form>
  );
}

/* ── Success ── */
function SuccessState() {
  return (
    <div className="rounded-2xl border border-gold/40 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-gold/10 flex items-center justify-center">
        <CheckCircle className="h-7 w-7 text-gold" />
      </div>
      <h3 className="text-2xl font-bold text-navy mb-2">Request Received</h3>
      <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
        A Hutchrok consultant will review your federal-readiness profile and
        follow up within one business day with recommended next steps.
      </p>
      <Link href="/">
        <Button variant="outline" className="border-navy/30 text-navy hover:bg-navy hover:text-white">
          Return Home
        </Button>
      </Link>
    </div>
  );
}

/* ── Shared UI helpers (matches gov-housing-intake-form) ── */
function Section({ title, step, subtitle, children }: {
  title: string; step: string; subtitle?: string; children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border/50 bg-white p-6 sm:p-8 shadow-sm space-y-5">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-sm font-bold text-gold shrink-0">
          {step}
        </span>
        <div>
          <h3 className="text-lg font-bold text-navy leading-tight">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({ label, error, required, children }: {
  label: string; error?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="mb-1.5 block">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}

function RadioRow({ label, options, value, onChange, error, required }: {
  label: string;
  options: readonly { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
}) {
  return (
    <div data-field={label}>
      <Label className="mb-2 block">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {error && <p className="text-xs text-destructive mb-2">{error}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button key={opt.value} type="button" onClick={() => onChange(opt.value)}
              className={cn(
                "rounded-lg border px-3.5 py-2 text-sm transition-colors cursor-pointer",
                active ? "border-gold bg-gold/10 text-navy font-medium"
                  : "border-border hover:border-gold/50 text-muted-foreground",
              )}>
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FormCheckbox({ checked, onChange, label, description }: {
  checked: boolean; onChange: (v: boolean) => void; label: string; description?: string;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <button type="button" role="checkbox" aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "mt-0.5 h-5 w-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors cursor-pointer",
          checked ? "bg-gold border-gold" : "border-input group-hover:border-gold/50",
        )}>
        {checked && <Check className="h-3 w-3 text-navy" />}
      </button>
      <div>
        <span className="text-sm font-medium text-navy">{label}</span>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
    </label>
  );
}
