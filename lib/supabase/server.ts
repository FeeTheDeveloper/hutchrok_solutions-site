import { createContextClient } from "@supabase/server/core";
import { getConfig } from "@/lib/config";

/**
 * Server-side Supabase client.
 * Used in API routes and server components.
 * Reads connection config from centralized config module.
 */
export function getSupabaseServer() {
  const config = getConfig();
  return createContextClient({
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
