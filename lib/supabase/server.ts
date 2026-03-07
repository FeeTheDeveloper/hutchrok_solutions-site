import { createClient } from "@supabase/supabase-js";
import { getConfig } from "@/lib/config";

/**
 * Server-side Supabase client.
 * Used in API routes and server components.
 * Reads connection config from centralized config module.
 */
export function getSupabaseServer() {
  const config = getConfig();
  return createClient(config.supabaseUrl, config.supabaseAnonKey);
}
