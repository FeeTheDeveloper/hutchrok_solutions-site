"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Loader2, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileFormState {
  personalFirstName: string;
  personalLastName: string;
  personalPhone: string;
  businessName: string;
  businessEntityType: string;
  businessWebsite: string;
}

const INITIAL_STATE: ProfileFormState = {
  personalFirstName: "",
  personalLastName: "",
  personalPhone: "",
  businessName: "",
  businessEntityType: "",
  businessWebsite: "",
};

export default function AccountProfileCard() {
  const [form, setForm] = useState<ProfileFormState>(INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string>("");

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      try {
        const res = await fetch("/api/account/profile");
        const json = await res.json();
        if (!res.ok || !json.ok) {
          throw new Error(json?.error?.message || "Failed to load profile.");
        }

        const profile = json.profile;
        if (!mounted) return;
        setForm({
          personalFirstName: profile.personalInfo?.firstName ?? "",
          personalLastName: profile.personalInfo?.lastName ?? "",
          personalPhone: profile.personalInfo?.phone ?? "",
          businessName: profile.businessInfo?.businessName ?? "",
          businessEntityType: profile.businessInfo?.entityType ?? "",
          businessWebsite: profile.businessInfo?.website ?? "",
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load profile.";
        if (mounted) setErrors({ form: message });
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      mounted = false;
    };
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setNotice("");
    setErrors({});
    setSaving(true);

    try {
      const res = await fetch("/api/account/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setErrors(json?.error?.fields ?? { form: json?.error?.message || "Save failed." });
        return;
      }

      setNotice("Account profile saved.");
    } catch {
      setErrors({ form: "Failed to save profile. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Account Credentials Profile</CardTitle>
        <CardDescription>
          Keep your account profile split between personal and business information.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading profile...
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-6">
            {errors.form && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {errors.form}
              </div>
            )}
            {notice && (
              <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">
                {notice}
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-navy">Personal Info</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="personalFirstName">First name</Label>
                  <Input
                    id="personalFirstName"
                    value={form.personalFirstName}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, personalFirstName: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="personalLastName">Last name</Label>
                  <Input
                    id="personalLastName"
                    value={form.personalLastName}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, personalLastName: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="personalPhone">Phone</Label>
                <Input
                  id="personalPhone"
                  value={form.personalPhone}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, personalPhone: e.target.value }))
                  }
                />
                {errors.personalPhone && (
                  <p className="mt-1 text-xs text-destructive">{errors.personalPhone}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-navy">Business Info</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="businessName">Business name</Label>
                  <Input
                    id="businessName"
                    value={form.businessName}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, businessName: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="businessEntityType">Entity type</Label>
                  <Input
                    id="businessEntityType"
                    value={form.businessEntityType}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, businessEntityType: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="businessWebsite">Website (https://...)</Label>
                <Input
                  id="businessWebsite"
                  value={form.businessWebsite}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, businessWebsite: e.target.value }))
                  }
                />
                {errors.businessWebsite && (
                  <p className="mt-1 text-xs text-destructive">{errors.businessWebsite}</p>
                )}
              </div>
            </div>

            <Button type="submit" disabled={saving} className="bg-gold hover:bg-gold-dark text-navy">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Profile
                </>
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
