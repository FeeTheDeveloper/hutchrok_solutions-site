"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  TITLE_HOLDING,
  PROPERTY_TYPES,
  PROPERTY_CONDITIONS,
  OCCUPANCY,
  PHA_REGISTRATION,
  PLACEMENT_TIMELINES,
  INTEREST_SCOPES,
  SAM_STATUSES,
  CONTACT_CHANNELS,
  showsFederalSection,
} from "@/lib/consulting/gov-housing";
import { CheckCircle, Loader2, Check, ArrowRight } from "lucide-react";

interface FormState {
  name: string;
  email: string;
  phone: string;
  titleHolding: string;
  veteranStatus: boolean;
  propertyAddress: string;
  propertyCity: string;
  propertyZip: string;
  propertyType: string;
  unitsAvailable: string;
  bedrooms: string;
  bathrooms: string;
  yearBuilt: string;
  condition: string;
  occupancy: string;
  targetRent: string;
  section8Before: boolean;
  registeredWithPHA: string;
  knowsPHA: boolean;
  phaName: string;
  placementTimeline: string;
  interestScope: string[];
  samStatus: string;
  uei: string;
  govContractExperience: string;
  successOutcome: string;
  budgetAuthorityConfirmed: boolean;
  preferredChannel: string;
}

const INITIAL: FormState = {
  name: "",
  email: "",
  phone: "",
  titleHolding: "",
  veteranStatus: false,
  propertyAddress: "",
  propertyCity: "",
  propertyZip: "",
  propertyType: "",
  unitsAvailable: "",
  bedrooms: "",
  bathrooms: "",
  yearBuilt: "",
  condition: "",
  occupancy: "",
  targetRent: "",
  section8Before: false,
  registeredWithPHA: "",
  knowsPHA: false,
  phaName: "",
  placementTimeline: "",
  interestScope: [],
  samStatus: "",
  uei: "",
  govContractExperience: "",
  successOutcome: "",
  budgetAuthorityConfirmed: false,
  preferredChannel: "",
};

interface GovHousingIntakeResponse {
  ok: boolean;
  caseNumber?: string | null;
  pathway?: "veteran-verified" | "standard";
  error?: { message?: string; fields?: Record<string, string> };
}

function isGovHousingIntakeResponse(value: unknown): value is GovHousingIntakeResponse {
  return typeof value === "object" && value !== null && "ok" in value;
}

const REQUIRED_LABELS: Record<string, string> = {
  name: "Name or entity",
  email: "Email",
  phone: "Phone",
  titleHolding: "How title is held",
  propertyAddress: "Property address",
  propertyCity: "City",
  propertyZip: "ZIP",
  propertyType: "Property type",
  condition: "Condition",
  occupancy: "Occupancy",
  registeredWithPHA: "Landlord registration",
  placementTimeline: "Placement timeline",
  interestScope: "Area of interest",
  successOutcome: "Success outcome",
  preferredChannel: "Preferred channel",
};

export default function GovHousingIntakeForm() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ caseNumber: string | null; pathway: string } | null>(null);

  const showFederal = useMemo(
    () => showsFederalSection(form.interestScope),
    [form.interestScope],
  );

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key as string];
      return next;
    });
  }

  function toggleScope(value: string) {
    setForm((p) => ({
      ...p,
      interestScope: p.interestScope.includes(value)
        ? p.interestScope.filter((s) => s !== value)
        : [...p.interestScope, value],
    }));
    setErrors((prev) => {
      if (!prev.interestScope) return prev;
      const next = { ...prev };
      delete next.interestScope;
      return next;
    });
  }

  function validate(): Record<string, string> {
    const next: Record<string, string> = {};
    for (const key of Object.keys(REQUIRED_LABELS)) {
      const val = form[key as keyof FormState];
      const empty = Array.isArray(val) ? val.length === 0 : !String(val ?? "").trim();
      if (empty) next[key] = `${REQUIRED_LABELS[key]} is required.`;
    }
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      next.email = "Enter a valid email address.";
    }
    return next;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) {
      const first = document.querySelector(`[data-field="${Object.keys(v)[0]}"]`);
      first?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        formType: "gov-housing-consulting" as const,
        name: form.name,
        email: form.email,
        phone: form.phone,
        titleHolding: form.titleHolding,
        veteranStatus: form.veteranStatus,
        propertyAddress: form.propertyAddress,
        propertyCity: form.propertyCity,
        propertyZip: form.propertyZip,
        propertyType: form.propertyType,
        unitsAvailable: form.unitsAvailable ? Number(form.unitsAvailable) : undefined,
        bedrooms: form.bedrooms,
        bathrooms: form.bathrooms,
        yearBuilt: form.yearBuilt ? Number(form.yearBuilt) : undefined,
        condition: form.condition,
        occupancy: form.occupancy,
        targetRent: form.targetRent ? Number(form.targetRent) : undefined,
        section8Before: form.section8Before,
        registeredWithPHA: form.registeredWithPHA,
        knowsPHA: form.knowsPHA,
        phaName: form.phaName,
        placementTimeline: form.placementTimeline,
        interestScope: form.interestScope,
        samStatus: showFederal && form.samStatus ? form.samStatus : undefined,
        uei: showFederal ? form.uei : "",
        govContractExperience: showFederal ? form.govContractExperience : "",
        successOutcome: form.successOutcome,
        budgetAuthorityConfirmed: form.budgetAuthorityConfirmed,
        preferredChannel: form.preferredChannel,
      };

      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data: unknown = await res.json();
      if (isGovHousingIntakeResponse(data) && data.ok) {
        setResult({ caseNumber: data.caseNumber ?? null, pathway: data.pathway ?? "standard" });
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const err = isGovHousingIntakeResponse(data) ? data.error ?? {} : {};
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

  if (result) {
    return <SuccessState caseNumber={result.caseNumber} pathway={result.pathway} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.form && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {errors.form}
        </div>
      )}

      {/* A. Contact & Entity */}
      <Section title="Contact & Entity" step="A">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full name / entity holding title" error={errors.name} required>
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
        <RadioRow label="Is the property held personally or in an LLC/trust?" required
          error={errors.titleHolding} options={TITLE_HOLDING}
          value={form.titleHolding} onChange={(v) => set("titleHolding", v)} />
        <FormCheckbox checked={form.veteranStatus} onChange={(v) => set("veteranStatus", v)}
          label="I am a U.S. military veteran"
          description="For benefit-eligibility routing only. Non-veterans are welcome clients." />
      </Section>

      {/* B. Property Profile */}
      <Section title="Property Profile" step="B">
        <Field label="Property address" error={errors.propertyAddress} required>
          <Input value={form.propertyAddress} onChange={(e) => set("propertyAddress", e.target.value)}
            className={errors.propertyAddress ? "border-destructive" : ""} />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="City" error={errors.propertyCity} required>
            <Input value={form.propertyCity} onChange={(e) => set("propertyCity", e.target.value)}
              className={errors.propertyCity ? "border-destructive" : ""} />
          </Field>
          <Field label="ZIP" error={errors.propertyZip} required>
            <Input value={form.propertyZip} onChange={(e) => set("propertyZip", e.target.value)}
              className={errors.propertyZip ? "border-destructive" : ""} />
          </Field>
        </div>
        <RadioRow label="Property type" required error={errors.propertyType}
          options={PROPERTY_TYPES} value={form.propertyType} onChange={(v) => set("propertyType", v)} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Field label="Units available">
            <Input type="number" min={0} value={form.unitsAvailable}
              onChange={(e) => set("unitsAvailable", e.target.value)} />
          </Field>
          <Field label="Beds / unit">
            <Input value={form.bedrooms} onChange={(e) => set("bedrooms", e.target.value)} placeholder="e.g. 3" />
          </Field>
          <Field label="Baths / unit">
            <Input value={form.bathrooms} onChange={(e) => set("bathrooms", e.target.value)} placeholder="e.g. 2" />
          </Field>
          <Field label="Year built">
            <Input type="number" value={form.yearBuilt} onChange={(e) => set("yearBuilt", e.target.value)}
              placeholder="e.g. 1985" />
          </Field>
        </div>
        {form.yearBuilt && Number(form.yearBuilt) > 0 && Number(form.yearBuilt) < 1978 && (
          <p className="text-xs text-gold-dark bg-gold/10 rounded-md px-3 py-2">
            Built before 1978 — federal lead-paint disclosure requirements will apply.
          </p>
        )}
        <RadioRow label="Current condition" required error={errors.condition}
          options={PROPERTY_CONDITIONS} value={form.condition} onChange={(v) => set("condition", v)} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          <RadioRow label="Occupancy" required error={errors.occupancy}
            options={OCCUPANCY} value={form.occupancy} onChange={(v) => set("occupancy", v)} />
          <Field label="Target monthly rent">
            <Input type="number" min={0} value={form.targetRent}
              onChange={(e) => set("targetRent", e.target.value)} placeholder="$" />
          </Field>
        </div>
      </Section>

      {/* C. Program Readiness */}
      <Section title="Program Readiness" step="C">
        <FormCheckbox checked={form.section8Before} onChange={(v) => set("section8Before", v)}
          label="I have leased to a Section 8 / voucher tenant before" />
        <RadioRow label="Registered with your local housing authority as a landlord?" required
          error={errors.registeredWithPHA} options={PHA_REGISTRATION}
          value={form.registeredWithPHA} onChange={(v) => set("registeredWithPHA", v)} />
        <div>
          <FormCheckbox checked={form.knowsPHA} onChange={(v) => set("knowsPHA", v)}
            label="I know which PHA serves this address" />
          {form.knowsPHA && (
            <div className="mt-3">
              <Field label="PHA name">
                <Input value={form.phaName} onChange={(e) => set("phaName", e.target.value)}
                  placeholder="e.g. Houston Housing Authority" />
              </Field>
            </div>
          )}
        </div>
        <RadioRow label="Timeline to have a tenant placed" required error={errors.placementTimeline}
          options={PLACEMENT_TIMELINES} value={form.placementTimeline}
          onChange={(v) => set("placementTimeline", v)} />
        <div data-field="interestScope">
          <Label className="mb-2 block">
            Interest scope <span className="text-destructive">*</span>{" "}
            <span className="text-muted-foreground font-normal">(select all that apply)</span>
          </Label>
          {errors.interestScope && (
            <p className="text-xs text-destructive mb-2">{errors.interestScope}</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {INTEREST_SCOPES.map((opt) => {
              const active = form.interestScope.includes(opt.value);
              return (
                <button key={opt.value} type="button" onClick={() => toggleScope(opt.value)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm text-left transition-colors cursor-pointer",
                    active ? "border-gold bg-gold/10 text-navy font-medium"
                      : "border-border hover:border-gold/50 text-muted-foreground",
                  )}>
                  <span className={cn(
                    "flex h-4 w-4 items-center justify-center rounded border shrink-0",
                    active ? "bg-gold border-gold" : "border-input",
                  )}>
                    {active && <Check className="h-3 w-3 text-navy" />}
                  </span>
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </Section>

      {/* D. Federal Contracting (conditional) */}
      {showFederal && (
        <Section title="Federal Contracting" step="D"
          subtitle="Because you selected federal development / contracting.">
          <RadioRow label="SAM.gov registration status"
            options={SAM_STATUSES} value={form.samStatus} onChange={(v) => set("samStatus", v)} />
          <Field label="UEI number (if any)">
            <Input value={form.uei} onChange={(e) => set("uei", e.target.value)} />
          </Field>
          <Field label="Existing government contract experience">
            <Textarea rows={3} value={form.govContractExperience}
              onChange={(e) => set("govContractExperience", e.target.value)}
              placeholder="Briefly describe any prior government contracting experience." />
          </Field>
        </Section>
      )}

      {/* E. Engagement Fit */}
      <Section title="Engagement Fit" step="E">
        <Field label="What outcome defines success in 12 months?" error={errors.successOutcome} required>
          <Textarea rows={3} value={form.successOutcome}
            onChange={(e) => set("successOutcome", e.target.value)}
            className={errors.successOutcome ? "border-destructive" : ""} />
        </Field>
        <FormCheckbox checked={form.budgetAuthorityConfirmed}
          onChange={(v) => set("budgetAuthorityConfirmed", v)}
          label="Budget authority for consulting fees is confirmed" />
        <RadioRow label="Preferred communication channel" required error={errors.preferredChannel}
          options={CONTACT_CHANNELS} value={form.preferredChannel}
          onChange={(v) => set("preferredChannel", v)} />
      </Section>

      <Button type="submit" size="lg" disabled={submitting}
        className="w-full bg-gold hover:bg-gold-dark text-navy font-bold gap-2 h-12">
        {submitting ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
        ) : (
          <>Submit Consulting Request <ArrowRight className="h-4 w-4" /></>
        )}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        A Hutchrok consultant reviews every request and follows up based on your preferred channel.
      </p>
    </form>
  );
}

/* ── Success ── */
function SuccessState({ caseNumber, pathway }: { caseNumber: string | null; pathway: string }) {
  const pathwayCopy: Record<string, string> = {
    fast_track: "You look ready to move quickly — we'll reach out with a Readiness-tier proposal.",
    escalate: "Given your portfolio / development goals, we'll schedule a strategy session.",
    standard: "We'll start with an Insight review and a readiness-gap report.",
  };
  return (
    <div className="rounded-2xl border border-gold/40 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-gold/10 flex items-center justify-center">
        <CheckCircle className="h-7 w-7 text-gold" />
      </div>
      <h3 className="text-2xl font-bold text-navy mb-2">Request Received</h3>
      {caseNumber && (
        <p className="text-sm text-muted-foreground mb-3">
          Reference: <span className="font-mono font-semibold text-navy">{caseNumber}</span>
        </p>
      )}
      <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
        {pathwayCopy[pathway] ?? pathwayCopy.standard} A consultant will follow up shortly via your
        preferred channel.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {caseNumber && (
          <Link href={`/track?case=${encodeURIComponent(caseNumber)}`}>
            <Button className="bg-gold hover:bg-gold-dark text-navy font-bold">Track My Request</Button>
          </Link>
        )}
        <Link href="/">
          <Button variant="outline" className="border-navy/30 text-navy hover:bg-navy hover:text-white">
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
}

/* ── Shared UI helpers ── */
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
