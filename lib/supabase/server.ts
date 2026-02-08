import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client.
 * Used in API routes and server components.
 * Uses SUPABASE_URL + SUPABASE_ANON_KEY env vars.
 */
export function getSupabaseServer() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables."
    );
  }

  return createClient(url, key);
}
