"use client";

import { useMemo, useState, type FormEvent } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
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
  PAID_SERVICES,
  PAID_SERVICE_BY_SLUG,
  type PaidServiceSlug,
} from "@/lib/paid-services";

interface ServiceRequestFormProps {
  initialServiceSlug?: string;
}

interface ServiceRequestState {
  name: string;
  email: string;
  phone: string;
  businessName: string;
  serviceSlug: string;
  projectDetails: string;
}

const INITIAL_STATE: ServiceRequestState = {
  name: "",
  email: "",
  phone: "",
  businessName: "",
  serviceSlug: "",
  projectDetails: "",
};

export default function ServiceRequestForm({
  initialServiceSlug,
}: ServiceRequestFormProps) {
  const [form, setForm] = useState<ServiceRequestState>({
    ...INITIAL_STATE,
    serviceSlug: initialServiceSlug ?? "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedService = useMemo(() => {
    if (!form.serviceSlug) return null;
    return PAID_SERVICE_BY_SLUG[form.serviceSlug as PaidServiceSlug] ?? null;
  }, [form.serviceSlug]);

  function validate(): Record<string, string> {
    const next: Record<string, string> = {};

    if (!form.name.trim()) next.name = "Name is required.";
    if (!form.email.trim()) next.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      next.email = "Please enter a valid email address.";
    }
    if (!form.phone.trim()) next.phone = "Phone is required.";
    if (!form.businessName.trim()) next.businessName = "Business name is required.";
    if (!form.serviceSlug) next.serviceSlug = "Please select a service.";
    if (!form.projectDetails.trim()) {
      next.projectDetails = "Project details are required.";
    }

    return next;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      const message = [
        `Business Name: ${form.businessName}`,
        `Selected Service: ${selectedService?.title ?? form.serviceSlug}`,
        "",
        "Project Details:",
        form.projectDetails,
      ].join("\n");

      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          businessStage: "newly-formed",
          serviceNeeded: selectedService?.tag.toLowerCase() ?? "paid-service",
          message,
        }),
      });

      const data = await res.json();
      if (!data.ok) {
        const apiErrors = data.error?.fields as Record<string, string> | undefined;
        setErrors(apiErrors ?? { form: data.error?.message ?? "Submission failed." });
        return;
      }

      setSubmitted(true);
    } catch {
      setErrors({ form: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-white border border-border/50 rounded-2xl p-8 text-center">
        <CheckCircle className="h-12 w-12 text-gold mx-auto mb-3" />
        <h3 className="text-2xl font-bold text-navy mb-2">Request Submitted</h3>
        <p className="text-muted-foreground text-sm sm:text-base">
          Thanks for your request. A Hutchrok operator will follow up in 1–2 business days
          to confirm scope, timeline, and next steps.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-border/50 rounded-2xl p-6 sm:p-8 space-y-5">
      {errors.form && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
          {errors.form}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            className={errors.name ? "border-destructive" : ""}
          />
          {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
        </div>

        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="businessName">Business Name *</Label>
          <Input
            id="businessName"
            value={form.businessName}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, businessName: e.target.value }))
            }
            className={errors.businessName ? "border-destructive" : ""}
          />
          {errors.businessName && (
            <p className="text-xs text-destructive mt-1">{errors.businessName}</p>
          )}
        </div>

        <div>
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
            className={errors.phone ? "border-destructive" : ""}
          />
          {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
        </div>
      </div>

      <div>
        <Label>Selected Service *</Label>
        <Select
          value={form.serviceSlug}
          onValueChange={(value) => setForm((prev) => ({ ...prev, serviceSlug: value }))}
        >
          <SelectTrigger className={errors.serviceSlug ? "border-destructive" : ""}>
            <SelectValue placeholder="Choose a service" />
          </SelectTrigger>
          <SelectContent>
            {PAID_SERVICES.map((service) => (
              <SelectItem key={service.slug} value={service.slug}>
                {service.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.serviceSlug && (
          <p className="text-xs text-destructive mt-1">{errors.serviceSlug}</p>
        )}
      </div>

      <div>
        <Label htmlFor="projectDetails">Project Details *</Label>
        <Textarea
          id="projectDetails"
          rows={5}
          placeholder="Tell us what you need, your timeline, and any goals for this service."
          value={form.projectDetails}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, projectDetails: e.target.value }))
          }
          className={errors.projectDetails ? "border-destructive" : ""}
        />
        {errors.projectDetails && (
          <p className="text-xs text-destructive mt-1">{errors.projectDetails}</p>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={submitting}
        className="w-full bg-gold hover:bg-gold-dark text-navy font-bold"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Submitting Request...
          </>
        ) : (
          "Submit Service Request"
        )}
      </Button>
    </form>
  );
}
