"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BadgeCheck, Clock, FileCheck2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Status = "PENDING_VERIFICATION" | "VERIFIED" | "REDEEMED" | "REVOKED";

interface ApiBody {
  ok: boolean;
  entitlement?: { status: Status };
  error?: { message?: string };
}

const COPY: Record<Status, { icon: typeof Clock; title: string; body: string }> = {
  PENDING_VERIFICATION: {
    icon: Clock,
    title: "Verification in review",
    body: "Upload your Texas Veterans Commission Veteran Verification Letter. Once our team confirms it, your free filing unlocks here.",
  },
  VERIFIED: {
    icon: BadgeCheck,
    title: "Your free filing is ready",
    body: "You're verified. Claim your one free Texas LLC filing to start intake.",
  },
  REDEEMED: {
    icon: FileCheck2,
    title: "Free filing in use",
    body: "Your free filing is claimed. Track its progress below.",
  },
  REVOKED: {
    icon: Clock,
    title: "Free filing unavailable",
    body: "Contact contact@hutchrok.com if you believe this is an error.",
  },
};

export default function FreeFilingCard() {
  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/account/free-filing")
      .then((r) => r.json() as Promise<ApiBody>)
      .then((b) => (b.ok && b.entitlement ? setStatus(b.entitlement.status) : setError(b.error?.message ?? "Unavailable.")))
      .catch(() => setError("Could not load your free filing."));
  }, []);

  async function claim() {
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/account/free-filing", { method: "POST" });
      const b = (await r.json()) as ApiBody;
      if (b.ok && b.entitlement) setStatus(b.entitlement.status);
      else setError(b.error?.message ?? "Claim failed.");
    } catch {
      setError("Claim failed. Try again.");
    } finally {
      setBusy(false);
    }
  }

  const copy = status ? COPY[status] : null;
  const Icon = copy?.icon ?? Clock;

  return (
    <Card className="border-gold/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-navy">
          <Icon className="h-5 w-5 text-gold" /> One free filing per account
        </CardTitle>
        <CardDescription>{copy?.title ?? (error ? "" : "Loading…")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {copy && <p className="text-sm text-muted-foreground">{copy.body}</p>}
        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        {status === "PENDING_VERIFICATION" && (
          <Link href="/verification-help">
            <Button variant="outline">How to get your VVL</Button>
          </Link>
        )}
        {status === "VERIFIED" && (
          <Button onClick={claim} disabled={busy} className="bg-gold text-navy hover:bg-gold-dark">
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Claim my free filing
          </Button>
        )}
        {status === "REDEEMED" && (
          <Link href="/free-filing#intake">
            <Button className="bg-navy text-white">Continue intake</Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
