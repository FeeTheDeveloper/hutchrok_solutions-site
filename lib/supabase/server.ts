import { createContextClient } from "@supabase/server/core";
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
 * Reads connection config from centralized config module.
 */
export function getSupabaseServer(): ReturnType<typeof createContextClient<LooseDatabase>> {
  const config = getConfig();
  return createContextClient<LooseDatabase>({
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
