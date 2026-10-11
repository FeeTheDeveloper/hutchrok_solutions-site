import "server-only";
import { createAdminClient } from "@supabase/server/core";
import { getConfig } from "@/lib/config";

type LooseDatabase = {
  public: {
    Tables: Record<
      string,
      {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      }
    >;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

/**
 * Server-side Supabase client.
 * Used in API routes and server components.
 * Clerk/admin authorization and ownership checks live in each caller. This
 * server-only client uses the service key; it must never fall back to anon.
 */
export function getSupabaseServer(): ReturnType<typeof createAdminClient<LooseDatabase>> {
  const config = getConfig();
  if (!config.supabaseSecretKey) {
    throw new Error("SUPABASE_SECRET_KEY is required for server database operations.");
  }
  return createAdminClient<LooseDatabase>({
    env: {
      url: config.supabaseUrl,
      publishableKeys: {
        default: config.supabasePublishableKey,
      },
      ...(config.supabaseSecretKey
        ? {
            secretKeys: {
              default: config.supabaseSecretKey,
            },
          }
        : {}),
      ...(config.supabaseJwksUrl
        ? {
            jwks: new URL(config.supabaseJwksUrl),
          }
        : {}),
    },
  });
}
