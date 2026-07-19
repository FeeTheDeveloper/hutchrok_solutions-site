import { getSupabaseServer } from "@/lib/supabase/server";

export interface ClientProfilePersonalInfo {
  firstName: string;
  lastName: string;
  phone: string;
}

export interface ClientProfileBusinessInfo {
  businessName: string;
  entityType: string;
  website: string;
}

export interface ClientProfile {
  clerkUserId: string;
  email: string;
  personalInfo: ClientProfilePersonalInfo;
  businessInfo: ClientProfileBusinessInfo;
  stripeCustomerId: string | null;
}

interface ClientProfileRow {
  clerk_user_id: string;
  email: string;
  personal_info: Record<string, unknown> | null;
  business_info: Record<string, unknown> | null;
  stripe_customer_id: string | null;
}

interface ClientProfileSeed {
  clerkUserId: string;
  email: string;
  fullName?: string;
}

function splitName(fullName?: string): { firstName: string; lastName: string } {
  if (!fullName) return { firstName: "", lastName: "" };
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function normalize(row: ClientProfileRow): ClientProfile {
  const personal = row.personal_info ?? {};
  const business = row.business_info ?? {};
  return {
    clerkUserId: row.clerk_user_id,
    email: row.email,
    personalInfo: {
      firstName: typeof personal.firstName === "string" ? personal.firstName : "",
      lastName: typeof personal.lastName === "string" ? personal.lastName : "",
      phone: typeof personal.phone === "string" ? personal.phone : "",
    },
    businessInfo: {
      businessName: typeof business.businessName === "string" ? business.businessName : "",
      entityType: typeof business.entityType === "string" ? business.entityType : "",
      website: typeof business.website === "string" ? business.website : "",
    },
    stripeCustomerId: row.stripe_customer_id ?? null,
  };
}

export async function getOrCreateClientProfile(seed: ClientProfileSeed): Promise<ClientProfile> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("client_profiles")
    .select("clerk_user_id, email, personal_info, business_info, stripe_customer_id")
    .eq("clerk_user_id", seed.clerkUserId)
    .maybeSingle();

  if (error) {
    throw new Error(`[client-profile] fetch failed: ${error.message}`);
  }

  if (data) {
    return normalize(data as ClientProfileRow);
  }

  const name = splitName(seed.fullName);
  const { data: inserted, error: insertError } = await supabase
    .from("client_profiles")
    .insert({
      clerk_user_id: seed.clerkUserId,
      email: seed.email,
      personal_info: {
        firstName: name.firstName,
        lastName: name.lastName,
        phone: "",
      },
      business_info: {
        businessName: "",
        entityType: "",
        website: "",
      },
    })
    .select("clerk_user_id, email, personal_info, business_info, stripe_customer_id")
    .single();

  if (insertError) {
    throw new Error(`[client-profile] create failed: ${insertError.message}`);
  }

  return normalize(inserted as ClientProfileRow);
}

export async function updateClientProfile(
  seed: ClientProfileSeed,
  profile: {
    personalInfo: ClientProfilePersonalInfo;
    businessInfo: ClientProfileBusinessInfo;
  },
): Promise<ClientProfile> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("client_profiles")
    .upsert(
      {
        clerk_user_id: seed.clerkUserId,
        email: seed.email,
        personal_info: profile.personalInfo,
        business_info: profile.businessInfo,
      },
      { onConflict: "clerk_user_id" },
    )
    .select("clerk_user_id, email, personal_info, business_info, stripe_customer_id")
    .single();

  if (error) {
    throw new Error(`[client-profile] update failed: ${error.message}`);
  }

  return normalize(data as ClientProfileRow);
}
