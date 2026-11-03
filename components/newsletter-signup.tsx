"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NewsletterSignup({ source = "newsletter", dark = false }: { source?: string; dark?: boolean }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isVeteran, setIsVeteran] = useState(true);
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const text = dark ? "text-white/80" : "text-muted-foreground";

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!consent) {
      setError("Please confirm you want to receive emails.");
      return;
    }
    setState("busy");
    setError(null);
    try {
      const r = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, isVeteran, consent: true, source }),
      });
      const b = (await r.json()) as { ok: boolean; error?: { message?: string } };
      if (!b.ok) throw new Error(b.error?.message ?? "Subscribe failed.");
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Subscribe failed.");
      setState("idle");
    }
  }

  if (state === "done") {
    return (
      <p className={`flex items-center gap-2 text-sm ${text}`}>
        <CheckCircle className="h-4 w-4 text-gold" /> You&apos;re on the list. Watch for veteran benefits, business resources, and member specials.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3" noValidate>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor={`nl-name-${source}`} className={dark ? "text-white" : ""}>Name</Label>
          <Input id={`nl-name-${source}`} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        </div>
        <div>
          <Label htmlFor={`nl-email-${source}`} className={dark ? "text-white" : ""}>Email</Label>
          <Input id={`nl-email-${source}`} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </div>
      </div>
      <label className={`flex items-center gap-2 text-sm ${text}`}>
        <input type="checkbox" checked={isVeteran} onChange={(e) => setIsVeteran(e.target.checked)} /> I&apos;m a veteran
      </label>
      <label className={`flex items-start gap-2 text-sm ${text}`}>
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
        Email me Hutchrok&apos;s veteran benefits and business-resource newsletter and member specials. Unsubscribe anytime.
      </label>
      {error && <p className="text-sm text-red-500" role="alert">{error}</p>}
      <Button type="submit" disabled={state === "busy"} className="bg-gold text-navy hover:bg-gold-dark">
        {state === "busy" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Subscribe
      </Button>
    </form>
  );
}
