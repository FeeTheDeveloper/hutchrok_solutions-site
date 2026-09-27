"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ContactState {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  website: string;
}

const INITIAL: ContactState = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
  website: "",
};

interface ContactResponse {
  ok: boolean;
  error?: { message?: string; fields?: Record<string, string> };
}

function isContactResponse(value: unknown): value is ContactResponse {
  return typeof value === "object" && value !== null && "ok" in value;
}

export default function ContactMessageForm() {
  const [form, setForm] = useState<ContactState>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  function update<K extends keyof ContactState>(key: K, value: ContactState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Name is required.";
    if (!form.email.trim()) next.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim()))
      next.email = "Enter a valid email address.";
    if (!form.subject.trim()) next.subject = "Subject is required.";
    if (form.message.trim().length < 10)
      next.message = "Please include a few more details.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data: unknown = await res.json();
      if (!isContactResponse(data) || !data.ok) {
        setErrors(
          isContactResponse(data)
            ? data.error?.fields ?? { form: data.error?.message ?? "Message failed to send." }
            : { form: "Message failed to send." },
        );
        return;
      }
      setSent(true);
    } catch {
      setErrors({
        form: "We couldn't reach our servers. Please try again, or email contact@hutchrok.com.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="text-center py-4">
        <CheckCircle className="h-10 w-10 text-gold mx-auto mb-3" />
        <h3 className="font-semibold text-navy mb-1">Message received</h3>
        <p className="text-sm text-muted-foreground">
          Check your inbox for a confirmation with your reference number. Reply
          to that email any time — it reaches our operations desk directly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <Label htmlFor="contact-name">Name</Label>
        <Input
          id="contact-name"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          aria-invalid={Boolean(errors.name)}
          autoComplete="name"
        />
        {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
      </div>
      <div>
        <Label htmlFor="contact-email">Email</Label>
        <Input
          id="contact-email"
          type="email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          aria-invalid={Boolean(errors.email)}
          autoComplete="email"
        />
        {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
      </div>
      <div>
        <Label htmlFor="contact-phone">Phone (optional)</Label>
        <Input
          id="contact-phone"
          type="tel"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          autoComplete="tel"
        />
      </div>
      <div>
        <Label htmlFor="contact-subject">Subject</Label>
        <Input
          id="contact-subject"
          value={form.subject}
          onChange={(e) => update("subject", e.target.value)}
          aria-invalid={Boolean(errors.subject)}
        />
        {errors.subject && <p className="text-xs text-destructive mt-1">{errors.subject}</p>}
      </div>
      <div>
        <Label htmlFor="contact-message">Message</Label>
        <Textarea
          id="contact-message"
          rows={5}
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          aria-invalid={Boolean(errors.message)}
        />
        {errors.message && <p className="text-xs text-destructive mt-1">{errors.message}</p>}
        <p className="text-xs text-muted-foreground mt-1">
          Please don&apos;t include SSNs, EINs, or bank details — we&apos;ll send a
          secure upload link if we need documents.
        </p>
      </div>
      {/* Honeypot: hidden from people, visible to bots. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={(e) => update("website", e.target.value)}
        />
      </div>
      {errors.form && <p className="text-sm text-destructive">{errors.form}</p>}
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Send className="h-4 w-4" />
            Send Message
          </>
        )}
      </Button>
    </form>
  );
}
