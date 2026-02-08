"use client";

import { useState, type FormEvent } from "react";
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
import { BUSINESS_STAGES, SERVICE_TYPES } from "@/lib/types";
import type { IntakeFormData } from "@/lib/types";
import { validateIntake } from "@/lib/validation";
import { CheckCircle, Loader2 } from "lucide-react";

export default function IntakeForm() {
  const [formData, setFormData] = useState<IntakeFormData>({
    name: "",
    email: "",
    phone: "",
    businessStage: "",
    serviceNeeded: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function validate(): Record<string, string> {
    const result = validateIntake(formData);
    return result.success ? {} : (result.fieldErrors ?? {});
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.ok) {
        setSubmitted(true);
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

  if (submitted) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="h-16 w-16 text-gold mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-navy mb-2">
          Intake Received
        </h3>
        <p className="text-muted-foreground">
          Thank you for reaching out. We&apos;ll review your submission and
          be in touch soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
            type="text"
            placeholder="Your full name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            className={errors.name ? "border-destructive" : ""}
          />
          {errors.name && (
            <p className="text-xs text-destructive mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && (
            <p className="text-xs text-destructive mt-1">{errors.email}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="phone">Phone Number *</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="(555) 123-4567"
          value={formData.phone}
          onChange={(e) =>
            setFormData({ ...formData, phone: e.target.value })
          }
          className={errors.phone ? "border-destructive" : ""}
        />
        {errors.phone && (
          <p className="text-xs text-destructive mt-1">{errors.phone}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Business Stage *</Label>
          <Select
            value={formData.businessStage}
            onValueChange={(val) =>
              setFormData({ ...formData, businessStage: val })
            }
          >
            <SelectTrigger
              className={errors.businessStage ? "border-destructive" : ""}
            >
              <SelectValue placeholder="Select stage" />
            </SelectTrigger>
            <SelectContent>
              {BUSINESS_STAGES.map((stage) => (
                <SelectItem key={stage.value} value={stage.value}>
                  {stage.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.businessStage && (
            <p className="text-xs text-destructive mt-1">
              {errors.businessStage}
            </p>
          )}
        </div>

        <div>
          <Label>Service Needed *</Label>
          <Select
            value={formData.serviceNeeded}
            onValueChange={(val) =>
              setFormData({ ...formData, serviceNeeded: val })
            }
          >
            <SelectTrigger
              className={errors.serviceNeeded ? "border-destructive" : ""}
            >
              <SelectValue placeholder="Select service" />
            </SelectTrigger>
            <SelectContent>
              {SERVICE_TYPES.map((service) => (
                <SelectItem key={service.value} value={service.value}>
                  {service.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.serviceNeeded && (
            <p className="text-xs text-destructive mt-1">
              {errors.serviceNeeded}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="message">Message (optional)</Label>
        <Textarea
          id="message"
          placeholder="Tell us about your business goals, current challenges, or specific needs..."
          rows={4}
          value={formData.message}
          onChange={(e) =>
            setFormData({ ...formData, message: e.target.value })
          }
        />
      </div>

      <Button
        type="submit"
        disabled={submitting}
        className="w-full bg-gold hover:bg-gold-dark text-navy font-bold text-base"
        size="lg"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Intake"
        )}
      </Button>
    </form>
  );
}
