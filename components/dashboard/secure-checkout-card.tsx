"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Loader2, Lock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  SERVICE_REQUEST_OPTIONS,
  SERVICE_REQUEST_BY_SLUG,
  formatStartingPrice,
} from "@/lib/paid-services";

const CHECKOUT_OPTIONS = SERVICE_REQUEST_OPTIONS.filter(
  (option) => option.slug !== "registered-agent",
);
type CheckoutSlug = (typeof CHECKOUT_OPTIONS)[number]["slug"];

interface SecureCheckoutCardProps {
  initialStatus?: "success" | "cancel" | "";
}

interface CheckoutApiResponse {
  ok: boolean;
  checkoutUrl?: string;
  error?: { message?: string };
}

function isCheckoutApiResponse(value: unknown): value is CheckoutApiResponse {
  return typeof value === "object" && value !== null && "ok" in value;
}

function isCheckoutSlug(value: string): value is CheckoutSlug {
  return CHECKOUT_OPTIONS.some((option) => option.slug === value);
}

export default function SecureCheckoutCard({ initialStatus = "" }: SecureCheckoutCardProps) {
  const [serviceSlug, setServiceSlug] = useState<CheckoutSlug>(CHECKOUT_OPTIONS[0].slug);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const selected = useMemo(() => {
    return serviceSlug ? SERVICE_REQUEST_BY_SLUG[serviceSlug] : null;
  }, [serviceSlug]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceSlug }),
      });
      const json: unknown = await res.json();

      if (!isCheckoutApiResponse(json) || !res.ok || !json.ok || !json.checkoutUrl) {
        setError(
          isCheckoutApiResponse(json)
            ? json.error?.message || "Unable to start checkout."
            : "Unable to start checkout.",
        );
        return;
      }

      window.location.assign(json.checkoutUrl);
    } catch {
      setError("Unable to start secure checkout right now.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Secure Checkout Portal</CardTitle>
        <CardDescription>
          Choose a paid service and continue to Stripe&apos;s secure checkout page.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {initialStatus === "success" && (
          <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">
            Payment completed successfully. Our team will follow up shortly.
          </div>
        )}
        {initialStatus === "cancel" && (
          <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-700">
            Checkout canceled. You can restart anytime.
          </div>
        )}
        {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="serviceSlug">Paid service</Label>
            <select
              id="serviceSlug"
              value={serviceSlug}
              onChange={(e) => {
                if (isCheckoutSlug(e.target.value)) {
                  setServiceSlug(e.target.value);
                }
              }}
              className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
            >
              {CHECKOUT_OPTIONS.map((option) => (
                <option key={option.slug} value={option.slug}>
                  {option.title} ({formatStartingPrice(option.startingPrice)})
                </option>
              ))}
            </select>
          </div>

          {selected && (
            <div className="rounded-md border border-border/60 bg-muted/20 p-3 text-sm">
              <p className="font-semibold text-navy">{selected.title}</p>
              <p className="text-muted-foreground">{selected.description}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={submitting || !serviceSlug}
            className="bg-gold hover:bg-gold-dark text-navy"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Preparing checkout...
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Continue to Secure Checkout
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
