"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  VVL_STATUSES,
  LAUNCH_TIMELINES,
  REGISTERED_AGENT_OPTIONS,
  OWNER_ROLES,
  ENTITY_TYPES,
  BRANCHES_OF_SERVICE,
} from "@/lib/types";
import type { OwnerDetail, BusinessEntityType, BranchOfService } from "@/lib/types";
import { validateVeteranIntakeStep } from "@/lib/validation";
import { loadAnswers, type QuizAnswers } from "@/lib/eligibility";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Plus,
  X,
  Shield,
  Building2,
  Users,
  FileText,
  Check,
  Upload,
} from "lucide-react";

/* ──────────────────────────────────────────
   Constants
   ────────────────────────────────────────── */

const STEPS = [
  { id: "contact", title: "About You", icon: Shield },
  { id: "business", title: "Business Details", icon: Building2 },
  { id: "ownership", title: "Ownership & Filing", icon: Users },
  { id: "review", title: "Review & Submit", icon: FileText },
] as const;

interface FormState {
  name: string;
  email: string;
  phone: string;
  veteranStatus: boolean;
  vvlStatus: string;
  branchOfService: string;
  yearsOfService: string;
  notes: string;
  businessName: string;
  entityType: BusinessEntityType;
  dbaName: string;
  nonprofitPurpose: string;
  businessPurpose: string;
  principalAddress: string;
  mailingAddress: string;
  mailingAddressSame: boolean;
  texasConfirmed: boolean;
  launchTimeline: string;
  allOwnersVeterans: boolean;
  fullyVeteranOwned: boolean;
  ownerDetails: OwnerDetail[];
  organizerName: string;
  organizerTitle: string;
  registeredAgentPreference: string;
  operatorReviewConfirmed: boolean;
}

const INITIAL_STATE: FormState = {
  name: "",
  email: "",
  phone: "",
  veteranStatus: false,
  vvlStatus: "",
  branchOfService: "",
  yearsOfService: "",
  notes: "",
  businessName: "",
  entityType: "llc",
  dbaName: "",
  nonprofitPurpose: "",
  businessPurpose: "",
  principalAddress: "",
  mailingAddress: "",
  mailingAddressSame: true,
  texasConfirmed: false,
  launchTimeline: "",
  allOwnersVeterans: false,
  fullyVeteranOwned: false,
  ownerDetails: [{ name: "", role: "Member" }],
  organizerName: "",
  organizerTitle: "",
  registeredAgentPreference: "",
  operatorReviewConfirmed: false,
};

/* ──────────────────────────────────────────
   Main Component
   ────────────────────────────────────────── */

export default function VeteranIntakeForm() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [caseNumber, setCaseNumber] = useState<string | null>(null);
  const [caseId, setCaseId] = useState<string | null>(null);
  const [vvlFile, setVvlFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const [eligibilityData, setEligibilityData] = useState<Record<
    string,
    boolean | null
  > | null>(null);

  // Pre-populate from eligibility quiz
  useEffect(() => {
    const saved = loadAnswers();
    if (saved) {
      setEligibilityData(saved as unknown as Record<string, boolean | null>);
      setForm((prev) => ({
        ...prev,
        veteranStatus: saved.isVeteran === true ? true : prev.veteranStatus,
        allOwnersVeterans:
          saved.allOwnersVeterans === true ? true : prev.allOwnersVeterans,
        fullyVeteranOwned:
          saved.fullyVeteranOwned === true ? true : prev.fullyVeteranOwned,
      }));
    }
  }, []);

  const update = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      // Clear the error for this field
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    []
  );

  /** Prepare form state for validation — coerce string fields to expected types */
  function formDataForValidation() {
    return {
      ...form,
      yearsOfService: form.yearsOfService !== "" ? Number(form.yearsOfService) : undefined,
    };
  }

  function validateStep(): boolean {
    if (step >= STEPS.length - 1) return true; // review step — no fields to validate
    const result = validateVeteranIntakeStep(step, formDataForValidation());
    if (result.success) {
      setErrors({});
      return true;
    }
    setErrors(result.fieldErrors ?? {});
    return false;
  }

  function handleNext() {
    if (validateStep()) {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit() {
    // Validate all content steps
    const coerced = formDataForValidation();
    for (let i = 0; i < STEPS.length - 1; i++) {
      const result = validateVeteranIntakeStep(i, coerced);
      if (!result.success) {
        setStep(i);
        setErrors(result.fieldErrors ?? {});
        return;
      }
    }

    setSubmitting(true);
    setErrors({});

    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        veteranStatus: form.veteranStatus,
        vvlStatus: form.vvlStatus,
        branchOfService: form.branchOfService || undefined,
        yearsOfService: form.yearsOfService ? Number(form.yearsOfService) : undefined,
        notes: form.notes,
        businessName: form.businessName,
        entityType: form.entityType,
        dbaName: form.entityType === "dba" ? form.dbaName : undefined,
        nonprofitPurpose: form.entityType === "nonprofit" ? form.nonprofitPurpose : undefined,
        businessPurpose: form.businessPurpose,
        principalAddress: form.principalAddress,
        mailingAddress: form.mailingAddressSame ? "" : form.mailingAddress,
        texasConfirmed: form.texasConfirmed,
        launchTimeline: form.launchTimeline,
        allOwnersVeterans: form.allOwnersVeterans,
        fullyVeteranOwned: form.fullyVeteranOwned,
        ownerDetails: form.ownerDetails,
        organizerName: form.organizerName,
        organizerTitle: form.organizerTitle,
        registeredAgentPreference: form.registeredAgentPreference,
        operatorReviewConfirmed: form.operatorReviewConfirmed,
        eligibilityAnswers: eligibilityData,
      };

      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.ok) {
        setCaseNumber(data.caseNumber);
        setCaseId(data.caseId);
        setSubmitted(true);

        // Upload VVL if provided
        if (vvlFile && data.caseId) {
          setUploading(true);
          try {
            const fd = new FormData();
            fd.append("caseId", data.caseId);
            fd.append("file", vvlFile);
            const uploadRes = await fetch("/api/intake/upload-vvl", {
              method: "POST",
              body: fd,
            });
            const uploadData = await uploadRes.json();
            if (uploadData.ok) setUploadDone(true);
          } catch {
            // Non-blocking — operator can request the document later
          } finally {
            setUploading(false);
          }
        }
      } else {
        const errPayload = data.error ?? {};
        if (errPayload.fields) {
          setErrors(errPayload.fields);
        } else {
          setErrors({ form: errPayload.message ?? "Submission failed." });
        }
      }
    } catch {
      setErrors({ form: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  /* ── Success state ── */
  if (submitted) {
    return (
      <SuccessState
        caseNumber={caseNumber}
        hasVvlFile={!!vvlFile}
        uploading={uploading}
        uploadDone={uploadDone}
      />
    );
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="w-full">
      {/* ── Progress stepper ── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors shrink-0",
                  i < step && "bg-gold text-navy",
                  i === step && "bg-navy text-white",
                  i > step && "bg-muted text-muted-foreground"
                )}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={cn(
                  "hidden sm:block text-xs font-medium ml-2",
                  i <= step ? "text-navy" : "text-muted-foreground"
                )}
              >
                {s.title}
              </span>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "hidden sm:block w-6 lg:w-14 h-px mx-2",
                    i < step ? "bg-gold" : "bg-border"
                  )}
                />
              )}
            </div>
          ))}
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gold rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* ── Error banner ── */}
      {errors.form && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-6">
          {errors.form}
        </div>
      )}

      {/* ── Step content ── */}
      <div className="bg-white rounded-2xl border border-border/50 p-6 sm:p-8 shadow-sm">
        {step === 0 && (
          <StepContact form={form} errors={errors} update={update} />
        )}
        {step === 1 && (
          <StepBusiness form={form} errors={errors} update={update} />
        )}
        {step === 2 && (
          <StepOwnership form={form} errors={errors} update={update} />
        )}
        {step === 3 && (
          <StepReview
            form={form}
            vvlFile={vvlFile}
            onFileChange={setVvlFile}
          />
        )}
      </div>

      {/* ── Navigation ── */}
      <div className="flex items-center justify-between mt-6">
        {step > 0 ? (
          <Button variant="outline" onClick={handleBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        ) : (
          <span />
        )}

        {step < STEPS.length - 1 ? (
          <Button
            onClick={handleNext}
            className="bg-navy hover:bg-navy-light text-white gap-2"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-gold hover:bg-gold-dark text-navy font-bold gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                Submit Intake
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   Step 1 — About You
   ══════════════════════════════════════════ */

function StepContact({
  form,
  errors,
  update,
}: {
  form: FormState;
  errors: Record<string, string>;
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-navy mb-1">About You</h3>
        <p className="text-sm text-muted-foreground">
          Let us know who you are and where you stand with TVC verification.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Full Legal Name" error={errors.name} required>
          <Input
            placeholder="Your full legal name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className={errors.name ? "border-destructive" : ""}
          />
        </Field>
        <Field label="Email" error={errors.email} required>
          <Input
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className={errors.email ? "border-destructive" : ""}
          />
        </Field>
      </div>

      <Field label="Phone Number" error={errors.phone} required>
        <Input
          type="tel"
          placeholder="(555) 123-4567"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          className={errors.phone ? "border-destructive" : ""}
        />
      </Field>

      <FormCheckbox
        checked={form.veteranStatus}
        onChange={(v) => update("veteranStatus", v)}
        label="I confirm I am a U.S. military veteran"
        description="Honorable discharge from any branch of the U.S. Armed Forces."
        error={errors.veteranStatus}
      />

      <Field label="VVL Status" error={errors.vvlStatus} required>
        <Select
          value={form.vvlStatus}
          onValueChange={(val) => update("vvlStatus", val)}
        >
          <SelectTrigger
            className={errors.vvlStatus ? "border-destructive" : ""}
          >
            <SelectValue placeholder="Select your VVL status" />
          </SelectTrigger>
          <SelectContent>
            {VVL_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {form.veteranStatus && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Branch of Service" error={errors.branchOfService} required>
            <Select
              value={form.branchOfService}
              onValueChange={(val) => update("branchOfService", val)}
            >
              <SelectTrigger
                className={errors.branchOfService ? "border-destructive" : ""}
              >
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                {BRANCHES_OF_SERVICE.map((b) => (
                  <SelectItem key={b.value} value={b.value}>
                    {b.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Years of Service" error={errors.yearsOfService} required>
            <Input
              type="number"
              min={0}
              max={50}
              placeholder="e.g. 8"
              value={form.yearsOfService}
              onChange={(e) => update("yearsOfService", e.target.value)}
              className={errors.yearsOfService ? "border-destructive" : ""}
            />
          </Field>
        </div>
      )}

      <Field label="Notes or Questions" error={errors.notes}>
        <Textarea
          placeholder="Anything you'd like us to know before we review your intake…"
          rows={3}
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
        />
      </Field>
    </div>
  );
}

/* ══════════════════════════════════════════
   Step 2 — Business Details
   ══════════════════════════════════════════ */

function StepBusiness({
  form,
  errors,
  update,
}: {
  form: FormState;
  errors: Record<string, string>;
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-navy mb-1">Business Details</h3>
        <p className="text-sm text-muted-foreground">
          Tell us about the Texas entity you'd like to form.
        </p>
      </div>

      <Field label="Entity Type" error={errors.entityType} required>
        <Select
          value={form.entityType}
          onValueChange={(val) => update("entityType", val as BusinessEntityType)}
        >
          <SelectTrigger
            className={errors.entityType ? "border-destructive" : ""}
          >
            <SelectValue placeholder="Select entity type" />
          </SelectTrigger>
          <SelectContent>
            {ENTITY_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Business Name" error={errors.businessName} required>
        <Input
          placeholder={form.entityType === "dba" ? "e.g. Lone Star Consulting" : "e.g. Lone Star Ventures LLC"}
          value={form.businessName}
          onChange={(e) => update("businessName", e.target.value)}
          className={errors.businessName ? "border-destructive" : ""}
        />
        <p className="text-xs text-muted-foreground mt-1">
          We'll check name availability with the Texas SOS before filing.
        </p>
      </Field>

      {form.entityType === "dba" && (
        <Field label="DBA / Assumed Name" error={errors.dbaName} required>
          <Input
            placeholder="The name you'll do business as"
            value={form.dbaName}
            onChange={(e) => update("dbaName", e.target.value)}
            className={errors.dbaName ? "border-destructive" : ""}
          />
        </Field>
      )}

      {form.entityType === "nonprofit" && (
        <Field label="Nonprofit Purpose" error={errors.nonprofitPurpose} required>
          <Textarea
            placeholder="Describe the charitable, educational, or other nonprofit purpose…"
            rows={3}
            value={form.nonprofitPurpose}
            onChange={(e) => update("nonprofitPurpose", e.target.value)}
            className={errors.nonprofitPurpose ? "border-destructive" : ""}
          />
        </Field>
      )}

      <Field
        label="Business Purpose / Industry"
        error={errors.businessPurpose}
        required
      >
        <Textarea
          placeholder="Briefly describe what your business will do…"
          rows={2}
          value={form.businessPurpose}
          onChange={(e) => update("businessPurpose", e.target.value)}
          className={errors.businessPurpose ? "border-destructive" : ""}
        />
      </Field>

      <Field
        label="Principal Business Address"
        error={errors.principalAddress}
        required
      >
        <Input
          placeholder="Street, City, TX ZIP"
          value={form.principalAddress}
          onChange={(e) => update("principalAddress", e.target.value)}
          className={errors.principalAddress ? "border-destructive" : ""}
        />
      </Field>

      <div>
        <FormCheckbox
          checked={form.mailingAddressSame}
          onChange={(v) => update("mailingAddressSame", v)}
          label="Mailing address is the same as above"
        />
        {!form.mailingAddressSame && (
          <div className="mt-3">
            <Field label="Mailing Address" error={errors.mailingAddress}>
              <Input
                placeholder="Street, City, State ZIP"
                value={form.mailingAddress}
                onChange={(e) => update("mailingAddress", e.target.value)}
              />
            </Field>
          </div>
        )}
      </div>

      <FormCheckbox
        checked={form.texasConfirmed}
        onChange={(v) => update("texasConfirmed", v)}
        label="This business will be formed in Texas"
        description="The free filing program is for Texas LLC formations only."
        error={errors.texasConfirmed}
      />

      <Field label="Desired Launch Timeline" error={errors.launchTimeline} required>
        <Select
          value={form.launchTimeline}
          onValueChange={(val) => update("launchTimeline", val)}
        >
          <SelectTrigger
            className={errors.launchTimeline ? "border-destructive" : ""}
          >
            <SelectValue placeholder="When do you want to launch?" />
          </SelectTrigger>
          <SelectContent>
            {LAUNCH_TIMELINES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    </div>
  );
}

/* ══════════════════════════════════════════
   Step 3 — Ownership & Filing
   ══════════════════════════════════════════ */

function StepOwnership({
  form,
  errors,
  update,
}: {
  form: FormState;
  errors: Record<string, string>;
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
}) {
  function addOwner() {
    if (form.ownerDetails.length >= 10) return;
    update("ownerDetails", [...form.ownerDetails, { name: "", role: "Member" }]);
  }

  function removeOwner(index: number) {
    if (form.ownerDetails.length <= 1) return;
    update(
      "ownerDetails",
      form.ownerDetails.filter((_, i) => i !== index)
    );
  }

  function updateOwner(index: number, field: keyof OwnerDetail, value: string) {
    const next = form.ownerDetails.map((o, i) =>
      i === index ? { ...o, [field]: value } : o
    );
    update("ownerDetails", next);
    // Clear specific owner errors
    setOwnerError(index, field, undefined);
  }

  // Helper to read owner-specific errors like "ownerDetails.0.name"
  function ownerError(index: number, field: string): string | undefined {
    return errors[`ownerDetails.${index}.${field}`];
  }

  function setOwnerError(
    index: number,
    field: string,
    _value: string | undefined
  ) {
    // handled by update clearing parent key
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-navy mb-1">
          Ownership & Filing
        </h3>
        <p className="text-sm text-muted-foreground">
          Tell us about the owners and how you'd like the filing handled.
        </p>
      </div>

      <div className="space-y-3">
        <FormCheckbox
          checked={form.allOwnersVeterans}
          onChange={(v) => update("allOwnersVeterans", v)}
          label="All owners / organizers are U.S. military veterans"
          description="Required for the TVC fee waiver."
        />
        <FormCheckbox
          checked={form.fullyVeteranOwned}
          onChange={(v) => update("fullyVeteranOwned", v)}
          label="This business will be 100% veteran-owned"
          description="The entity must be entirely owned by veterans."
        />
      </div>

      {/* Owner / member list */}
      <div>
        <Label className="mb-2 block">
          Owners / Members{" "}
          <span className="text-destructive">*</span>
        </Label>
        {errors.ownerDetails && (
          <p className="text-xs text-destructive mb-2">{errors.ownerDetails}</p>
        )}
        <div className="space-y-3">
          {form.ownerDetails.map((owner, i) => (
            <div
              key={i}
              className="flex items-start gap-3 bg-cream/50 rounded-xl border border-border/40 p-4"
            >
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Input
                    placeholder="Full legal name"
                    value={owner.name}
                    onChange={(e) => updateOwner(i, "name", e.target.value)}
                    className={
                      ownerError(i, "name") ? "border-destructive" : ""
                    }
                  />
                  {ownerError(i, "name") && (
                    <p className="text-xs text-destructive mt-1">
                      {ownerError(i, "name")}
                    </p>
                  )}
                </div>
                <Select
                  value={owner.role}
                  onValueChange={(val) => updateOwner(i, "role", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    {OWNER_ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {form.ownerDetails.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeOwner(i)}
                  className="mt-2 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                  aria-label="Remove owner"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        {form.ownerDetails.length < 10 && (
          <button
            type="button"
            onClick={addOwner}
            className="mt-3 inline-flex items-center gap-1.5 text-sm text-navy font-medium hover:text-gold transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add another owner
          </button>
        )}
      </div>

      {/* Organizer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Organizer Name" error={errors.organizerName} required>
          <Input
            placeholder="Person signing the formation docs"
            value={form.organizerName}
            onChange={(e) => update("organizerName", e.target.value)}
            className={errors.organizerName ? "border-destructive" : ""}
          />
        </Field>
        <Field label="Organizer Title" error={errors.organizerTitle}>
          <Input
            placeholder="e.g. Managing Member"
            value={form.organizerTitle}
            onChange={(e) => update("organizerTitle", e.target.value)}
          />
        </Field>
      </div>

      <Field
        label="Registered Agent Preference"
        error={errors.registeredAgentPreference}
        required
      >
        <Select
          value={form.registeredAgentPreference}
          onValueChange={(val) => update("registeredAgentPreference", val)}
        >
          <SelectTrigger
            className={
              errors.registeredAgentPreference ? "border-destructive" : ""
            }
          >
            <SelectValue placeholder="Who will serve as registered agent?" />
          </SelectTrigger>
          <SelectContent>
            {REGISTERED_AGENT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <FormCheckbox
        checked={form.operatorReviewConfirmed}
        onChange={(v) => update("operatorReviewConfirmed", v)}
        label="I understand Hutchrok reviews and submits my filing"
        description="No filing is automated. A Hutchrok operator reviews every case before submission to the Texas SOS."
        error={errors.operatorReviewConfirmed}
      />
    </div>
  );
}

/* ══════════════════════════════════════════
   Step 4 — Review & Submit
   ══════════════════════════════════════════ */

function StepReview({
  form,
  vvlFile,
  onFileChange,
}: {
  form: FormState;
  vvlFile: File | null;
  onFileChange: (file: File | null) => void;
}) {
  const sections = [
    {
      title: "Contact",
      items: [
        ["Name", form.name],
        ["Email", form.email],
        ["Phone", form.phone],
        ["Veteran", form.veteranStatus ? "Confirmed" : "—"],
        [
          "VVL Status",
          VVL_STATUSES.find((s) => s.value === form.vvlStatus)?.label ?? "—",
        ],
        ...(form.veteranStatus && form.branchOfService
          ? [[
              "Branch of Service",
              BRANCHES_OF_SERVICE.find((b) => b.value === form.branchOfService)?.label ?? "—",
            ]]
          : []),
        ...(form.veteranStatus && form.yearsOfService
          ? [["Years of Service", form.yearsOfService]]
          : []),
        ...(form.notes ? [["Notes", form.notes]] : []),
      ],
    },
    {
      title: "Business",
      items: [
        ["Entity Type", ENTITY_TYPES.find((t) => t.value === form.entityType)?.label ?? "—"],
        ["Business Name", form.businessName],
        ...(form.entityType === "dba" && form.dbaName
          ? [["DBA Name", form.dbaName]]
          : []),
        ...(form.entityType === "nonprofit" && form.nonprofitPurpose
          ? [["Nonprofit Purpose", form.nonprofitPurpose]]
          : []),
        ["Purpose", form.businessPurpose],
        ["Principal Address", form.principalAddress],
        [
          "Mailing Address",
          form.mailingAddressSame
            ? "Same as principal"
            : form.mailingAddress || "—",
        ],
        ["Texas Formation", form.texasConfirmed ? "Confirmed" : "—"],
        [
          "Timeline",
          LAUNCH_TIMELINES.find((t) => t.value === form.launchTimeline)
            ?.label ?? "—",
        ],
      ],
    },
    {
      title: "Ownership & Filing",
      items: [
        [
          "All Owners Veterans",
          form.allOwnersVeterans ? "Yes" : "No",
        ],
        [
          "100% Veteran-Owned",
          form.fullyVeteranOwned ? "Yes" : "No",
        ],
        [
          "Owners",
          form.ownerDetails
            .map((o) => `${o.name} (${o.role})`)
            .join(", "),
        ],
        ["Organizer", form.organizerName + (form.organizerTitle ? ` — ${form.organizerTitle}` : "")],
        [
          "Registered Agent",
          REGISTERED_AGENT_OPTIONS.find(
            (o) => o.value === form.registeredAgentPreference
          )?.label ?? "—",
        ],
        [
          "Operator Review",
          form.operatorReviewConfirmed ? "Confirmed" : "—",
        ],
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-navy mb-1">Review & Submit</h3>
        <p className="text-sm text-muted-foreground">
          Please review your information before submitting. You can go back to
          make changes.
        </p>
      </div>

      {sections.map((section) => (
        <div
          key={section.title}
          className="bg-cream/50 rounded-xl border border-border/40 p-5"
        >
          <h4 className="text-sm font-bold text-navy mb-3">{section.title}</h4>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            {section.items.map(([label, value]) => (
              <div key={label as string} className="flex flex-col">
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="text-sm text-navy break-words">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}

      {/* VVL upload */}
      {form.vvlStatus === "have_vvl" && (
        <div className="bg-cream/50 rounded-xl border border-border/40 p-5">
          <h4 className="text-sm font-bold text-navy mb-2">
            Upload Your VVL <span className="font-normal text-muted-foreground">(optional)</span>
          </h4>
          <p className="text-xs text-muted-foreground mb-3">
            If you have your Veteran Verification Letter ready, you can upload
            it now. PDF, JPG, or PNG — 10 MB max.
          </p>
          {vvlFile ? (
            <div className="flex items-center gap-3 text-sm">
              <FileText className="h-4 w-4 text-gold" />
              <span className="text-navy font-medium truncate">
                {vvlFile.name}
              </span>
              <button
                type="button"
                onClick={() => onFileChange(null)}
                className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-border hover:border-gold/50 bg-white text-sm text-navy font-medium cursor-pointer transition-colors">
              <Upload className="h-4 w-4 text-gold" />
              Choose file
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  onFileChange(f);
                }}
              />
            </label>
          )}
        </div>
      )}

      {form.vvlStatus !== "have_vvl" && (
        <div className="bg-cream/50 rounded-xl border border-border/40 p-5">
          <h4 className="text-sm font-bold text-navy mb-1">Documents</h4>
          <p className="text-xs text-muted-foreground">
            No documents are required now. Once your VVL is ready, you can
            upload it or email it to{" "}
            <span className="text-navy font-medium">contact@hutchrok.com</span>.
          </p>
        </div>
      )}

      <div className="bg-navy/5 rounded-xl border border-navy/10 p-5">
        <p className="text-xs text-muted-foreground leading-relaxed">
          By submitting, you confirm the information above is accurate. A
          Hutchrok operator will review your case before any filing is submitted.
          Hutchrok is not a law firm and does not provide legal advice.
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   Success State
   ══════════════════════════════════════════ */

function SuccessState({
  caseNumber,
  hasVvlFile,
  uploading,
  uploadDone,
}: {
  caseNumber: string | null;
  hasVvlFile: boolean;
  uploading: boolean;
  uploadDone: boolean;
}) {
  return (
    <div className="text-center py-8">
      <div className="mx-auto mb-5 h-16 w-16 rounded-full bg-gold/10 flex items-center justify-center">
        <CheckCircle className="h-8 w-8 text-gold" />
      </div>
      <h3 className="text-2xl font-bold text-navy mb-2">
        Intake Submitted
      </h3>
      {caseNumber && (
        <p className="text-sm text-muted-foreground mb-4">
          Case Number:{" "}
          <span className="font-mono font-semibold text-navy">
            {caseNumber}
          </span>
        </p>
      )}

      {hasVvlFile && (
        <p className="text-sm text-muted-foreground mb-4">
          {uploading && "Uploading your VVL…"}
          {uploadDone && (
            <span className="text-gold font-medium">
              ✓ Veteran Verification Letter received.
            </span>
          )}
          {!uploading && !uploadDone && (
            <span className="text-muted-foreground">
              VVL upload was not completed. You can email it to
              contact@hutchrok.com.
            </span>
          )}
        </p>
      )}

      <div className="bg-cream/60 rounded-xl border border-border/40 p-6 text-left max-w-md mx-auto mb-8">
        <h4 className="text-sm font-bold text-navy mb-3">What happens next</h4>
        <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
          <li>Our team reviews your submission within 24–48 hours.</li>
          <li>We'll reach out if we need additional information.</li>
          <li>
            Once your VVL is confirmed, we prepare your Certificate of
            Formation.
          </li>
          <li>
            We file with the Texas Secretary of State on your behalf.
          </li>
        </ol>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link href="/free-filing">
          <Button
            variant="outline"
            className="border-navy/30 text-navy hover:bg-navy hover:text-white font-medium"
          >
            View Free Filing Details
          </Button>
        </Link>
        <Link href="/">
          <Button
            variant="outline"
            className="border-border text-muted-foreground hover:text-navy font-medium"
          >
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   Shared Helpers
   ══════════════════════════════════════════ */

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
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

function FormCheckbox({
  checked,
  onChange,
  label,
  description,
  error,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  error?: string;
}) {
  return (
    <div>
      <label className="flex items-start gap-3 cursor-pointer group">
        <button
          type="button"
          role="checkbox"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={cn(
            "mt-0.5 h-5 w-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors cursor-pointer",
            checked
              ? "bg-gold border-gold"
              : "border-input group-hover:border-gold/50",
            error && !checked && "border-destructive"
          )}
        >
          {checked && <Check className="h-3 w-3 text-navy" />}
        </button>
        <div>
          <span className="text-sm font-medium text-navy">{label}</span>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {description}
            </p>
          )}
        </div>
      </label>
      {error && (
        <p className="text-xs text-destructive mt-1 ml-8">{error}</p>
      )}
    </div>
  );
}
