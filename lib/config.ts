/**
 * Centralized environment configuration.
 *
 * All env var access should go through this module. This ensures:
 * - Required vars are validated once at import time
 * - Optional vars have clear defaults
 * - Missing config produces clear error messages
 * - No env access is scattered across files
 */

// ── Helpers ──

function required(name: string): string {
  const val = process.env[name];
  if (!val) {
    throw new Error(
      `[config] Missing required environment variable: ${name}. ` +
        "Check your .env or deployment settings.",
    );
  }
  return val;
}

function optional(name: string, fallback = ""): string {
  return process.env[name] || fallback;
}

// ── Config object ──

/**
 * Lazy-initialized config. Values are read on first access so that
 * build-time (static page generation) doesn't crash when vars are
 * only available at runtime.
 */
function buildConfig() {
  return {
    /** Supabase connection URL (required) */
    supabaseUrl: required("SUPABASE_URL"),
    /** Supabase anon/public key (required) */
    supabaseAnonKey: required("SUPABASE_ANON_KEY"),
    /** Shared admin token for admin API + dashboard access (required) */
    adminToken: required("ADMIN_TOKEN"),
    /** Ops integration token for inbound webhooks */
    opsToken: optional("OPS_TOKEN"),
    /** Outbound ops webhook URL (Power Automate HTTP trigger) */
    opsWebhookUrl: optional("OPS_WEBHOOK_URL"),
    /** Browser-side Supabase URL (optional, for future client-side access) */
    publicSupabaseUrl: optional("NEXT_PUBLIC_SUPABASE_URL"),
    /** Browser-side Supabase anon key */
    publicSupabaseAnonKey: optional("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    /** Node environment */
    nodeEnv: optional("NODE_ENV", "development"),
    /** Whether the app is running in production */
    isProd: process.env.NODE_ENV === "production",
  };
}

export type AppConfig = ReturnType<typeof buildConfig>;

let _config: AppConfig | null = null;

/**
 * Get the validated app config. Throws on first call if required
 * env vars are missing. Cached after first successful call.
 */
export function getConfig(): AppConfig {
  if (!_config) {
    _config = buildConfig();
  }
  return _config;
}

/**
 * List of all environment variables this app uses.
 * Useful for documentation and deployment checklists.
 */
export const ENV_VARS = {
  required: ["SUPABASE_URL", "SUPABASE_ANON_KEY", "ADMIN_TOKEN"] as const,
  optional: [
    "OPS_TOKEN",
    "OPS_WEBHOOK_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "NODE_ENV",
  ] as const,
};
