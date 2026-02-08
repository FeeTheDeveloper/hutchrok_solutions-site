"use client";

import { createClient } from "@supabase/supabase-js";

/**
 * Browser-side Supabase client (singleton).
 * Uses NEXT_PUBLIC_ prefixed env vars so they are available in the browser.
 *
 * NOTE: For admin console we pass the token server-side, but if we ever need
 * a client-side Supabase instance, expose NEXT_PUBLIC_SUPABASE_URL and
 * NEXT_PUBLIC_SUPABASE_ANON_KEY. For now, the admin console fetches via
 * API routes so this file exists as a placeholder for future client usage.
 */
let client: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables."
    );
  }

  client = createClient(url, key);
  return client;
}
