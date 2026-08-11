"use client";

import { useState, type FormEvent } from "react";
import { BadgeCheck, Building2, Plus, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PremiumMemberRecord } from "@/lib/members/registry";

type Props = { member: PremiumMemberRecord };

const emptyForm = {
  legalName: "",
  entityType: "LLC",
  state: "TX",
  ownershipRole: "Owner",
  businessAddress: "",
  formationStatus: "Not started",
  einStatus: "Not started",
  veteranCertificationStatus: "Not started",
  notes: "",
};

export default function PremiumMemberWorkspace({ member }: Props) {
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/account/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) {
        throw new Error(result?.error?.message || "Business submission failed.");
      }
      setNotice("Business submitted for Hutchrok administrative review.");
      setForm(emptyForm);
      setShowForm(false);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Business submission failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-6 space-y-6" aria-labelledby="member-workspace-title">
      <Card className="border-gold/40">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle id="member-workspace-title">{member.displayName}</CardTitle>
              <CardDescription>Existing Hutchrok customer · Member {member.memberCode}</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-3 py-1 text-navy">
                <BadgeCheck className="h-4 w-4" /> Premium
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-emerald-800">
                <ShieldCheck className="h-4 w-4" /> VVL Enabled
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {member.businesses.length} rostered businesses are attached to this secure account.
          </p>
          {member.vvlEnabled && (
            <Button type="button" onClick={() => setShowForm((value) => !value)} className="bg-gold text-navy hover:bg-gold-dark">
              <Plus className="mr-2 h-4 w-4" /> Add Business
            </Button>
          )}
        </CardContent>
      </Card>

      {notice && <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
      {error && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add a Business</CardTitle>
            <CardDescription>New businesses enter Member Submitted — Review Required status.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
              {Object.entries(form).map(([key, value]) => (
                <div key={key} className={key === "notes" || key === "businessAddress" ? "sm:col-span-2" : ""}>
                  <Label htmlFor={key}>{key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase())}</Label>
                  <Input
                    id={key}
                    required={key !== "notes"}
                    value={value}
                    onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                  />
                </div>
              ))}
              <div className="sm:col-span-2">
                <Button disabled={saving} type="submit" className="bg-gold text-navy hover:bg-gold-dark">
                  {saving ? "Submitting..." : "Submit for Review"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {member.businesses.map((business) => (
          <Card key={business.legalName}>
            <CardHeader>
              <div className="flex items-start gap-3">
                <Building2 className="mt-1 h-5 w-5 text-gold" />
                <div>
                  <CardTitle className="text-lg">{business.legalName}</CardTitle>
                  <CardDescription>{business.entityType}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
              <p><span className="font-semibold text-navy">Formation & State:</span> {business.formationStatus}</p>
              <p><span className="font-semibold text-navy">Tax & EIN:</span> {business.einStatus}</p>
              <p><span className="font-semibold text-navy">Veteran Certification:</span> {business.veteranCertificationStatus}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Authorized files will appear here through the private document sync. No Drive credentials or unrestricted links are exposed.
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
