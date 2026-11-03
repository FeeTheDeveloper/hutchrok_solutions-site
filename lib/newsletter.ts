import "server-only";
import { getSupabaseServer } from "@/lib/supabase/server";

/**
 * Newsletter contacts and leads.
 *
 * - `consent: true`  -> SUBSCRIBED (may receive newsletter / specials)
 * - `consent: false` -> LEAD_ONLY (sales follow-up only, never bulk email)
 * An UNSUBSCRIBED contact is never re-subscribed without fresh consent.
 */
export async function upsertNewsletterContact(input: {
  email: string;
  name?: string;
  phone?: string;
  businessName?: string;
  source: string;
  tags?: string[];
  interests?: string[];
  isVeteran?: boolean;
  consent: boolean;
}): Promise<void> {
  const supabase = getSupabaseServer();
  const email = input.email.trim().toLowerCase();
  const now = new Date().toISOString();

  const existing = await supabase
    .from("newsletter_contacts")
    .select("id, status, tags, interests")
    .eq("email", email)
    .maybeSingle();
  if (existing.error) throw new Error(existing.error.message);

  const row = existing.data as
    | { id: string; status: string; tags: string[]; interests: string[] }
    | null;

  const merge = (a: string[] = [], b: string[] = []) => Array.from(new Set([...a, ...b]));

  if (!row) {
    const { error } = await supabase.from("newsletter_contacts").insert({
      email,
      name: input.name || null,
      phone: input.phone || null,
      business_name: input.businessName || null,
      source: input.source,
      tags: merge([], input.tags),
      interests: merge([], input.interests),
      is_veteran: input.isVeteran ?? null,
      status: input.consent ? "SUBSCRIBED" : "LEAD_ONLY",
      consent_at: input.consent ? now : null,
      consent_source: input.consent ? input.source : null,
    });
    if (error) throw new Error(error.message);
    return;
  }

  const patch: Record<string, unknown> = {
    tags: merge(row.tags, input.tags),
    interests: merge(row.interests, input.interests),
    updated_at: now,
  };
  if (input.name) patch.name = input.name;
  if (input.phone) patch.phone = input.phone;
  if (input.businessName) patch.business_name = input.businessName;
  if (input.isVeteran !== undefined) patch.is_veteran = input.isVeteran;
  // Fresh, explicit consent upgrades LEAD_ONLY or UNSUBSCRIBED to SUBSCRIBED.
  if (input.consent && row.status !== "SUBSCRIBED") {
    Object.assign(patch, {
      status: "SUBSCRIBED",
      consent_at: now,
      consent_source: input.source,
      unsubscribed_at: null,
    });
  }

  const { error } = await supabase.from("newsletter_contacts").update(patch).eq("id", row.id);
  if (error) throw new Error(error.message);
}

export async function unsubscribeByToken(token: string): Promise<boolean> {
  const supabase = getSupabaseServer();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("newsletter_contacts")
    .update({ status: "UNSUBSCRIBED", unsubscribed_at: now, updated_at: now })
    .eq("unsubscribe_token", token)
    .select("id")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return Boolean(data);
}
