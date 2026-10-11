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
  const supabaseAnonKey = required("SUPABASE_ANON_KEY");

  const stripeSecretKey = optional("STRIPE_SECRET_KEY");
  const stripeWebhookSecret = optional("STRIPE_WEBHOOK_SECRET");

  const clerkPublishableKey = optional("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY");
  const clerkSecretKey = optional("CLERK_SECRET_KEY");

  const r2AccessKeyId = optional("R2_ACCESS_KEY_ID");
  const r2SecretAccessKey = optional("R2_SECRET_ACCESS_KEY");
  const r2Endpoint = optional("R2_S3_ENDPOINT");
  const r2Bucket = optional("R2_BUCKET");

  return {
    /** Supabase connection URL (required) */
    supabaseUrl: required("SUPABASE_URL"),
    /** Supabase anon/public key (required) */
    supabaseAnonKey,
    /** Supabase publishable key used by @supabase/server (falls back to anon key) */
    supabasePublishableKey: optional("SUPABASE_PUBLISHABLE_KEY", supabaseAnonKey),
    /** Supabase secret/service key used by @supabase/server admin helpers */
    supabaseSecretKey: optional("SUPABASE_SECRET_KEY"),
    /** Optional JWKS URL for validating Supabase JWTs in @supabase/server flows */
    supabaseJwksUrl: optional("SUPABASE_JWKS_URL"),
    /** Shared admin token for admin API + dashboard access (required) */
    adminToken: required("ADMIN_TOKEN"),
    /** Ops integration token for inbound webhooks */
    opsToken: optional("OPS_TOKEN"),
    /** Outbound ops webhook URL (Power Automate HTTP trigger) */
    opsWebhookUrl: optional("OPS_WEBHOOK_URL"),

    // ── Stripe ──
    /** Stripe server-side secret key (required for Checkout + webhook) */
    stripeSecretKey,
    /** Stripe webhook signing secret for POST /api/stripe/webhook */
    stripeWebhookSecret,
    /** True when Checkout can be created */
    stripeConfigured: Boolean(stripeSecretKey),
    /** True when inbound webhook signatures can be verified */
    stripeWebhookConfigured: Boolean(stripeSecretKey && stripeWebhookSecret),

    // ── Clerk ──
    /** Clerk browser-side publishable key */
    clerkPublishableKey,
    /** Clerk server-side secret key */
    clerkSecretKey,
    /** True when both Clerk keys are present */
    clerkConfigured: Boolean(clerkPublishableKey && clerkSecretKey),

    // ── Cloudflare ──
    /** Cloudflare account that owns the hutchrok.com zone and R2 */
    cloudflareAccountId: optional("CLOUDFLARE_ACCOUNT_ID"),
    /** Cloudflare API token used for DNS / R2 management */
    cloudflareApiToken: optional("CLOUDFLARE_API_TOKEN"),
    /** Zone ID for hutchrok.com */
    cloudflareZoneId: optional("CLOUDFLARE_ZONE_ID"),
    /** R2 (S3-compatible) object storage credentials */
    r2: {
      accountId: optional("R2_ACCOUNT_ID", optional("CLOUDFLARE_ACCOUNT_ID")),
      accessKeyId: r2AccessKeyId,
      secretAccessKey: r2SecretAccessKey,
      endpoint: r2Endpoint,
      bucket: r2Bucket,
    },
    /**
     * True when R2 credentials are complete. Note: nothing in the app reads R2
     * today — case documents live in the Supabase Storage bucket
     * `case-documents`. R2 must also be enabled on the Cloudflare account
     * before these credentials will authenticate.
     */
    r2Configured: Boolean(r2AccessKeyId && r2SecretAccessKey && r2Endpoint),

    // ── Site ──
    /** Public origin used to build absolute links in emails/notifications */
    siteUrl: optional("NEXT_PUBLIC_SITE_URL", "https://www.hutchrok.com"),

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
  required: [
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
    "ADMIN_TOKEN",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    "CLERK_SECRET_KEY",
  ] as const,
  optional: [
    "SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_SECRET_KEY",
    "SUPABASE_JWKS_URL",
    "OPENAI_API_KEY",
    "OPENAI_TRIAGE_MODEL",
    "OPENAI_COMMAND_MODEL",
    "OPS_TOKEN",
    "OPS_WEBHOOK_URL",
    "CLOUDFLARE_ACCOUNT_ID",
    "CLOUDFLARE_API_TOKEN",
    "CLOUDFLARE_ZONE_ID",
    "R2_ACCOUNT_ID",
    "R2_ACCESS_KEY_ID",
    "R2_SECRET_ACCESS_KEY",
    "R2_S3_ENDPOINT",
    "R2_BUCKET",
    "RESEND_API_KEY",
    "RESEND_FROM_EMAIL",
    "RESEND_TO_EMAIL",
    "TWILIO_ACCOUNT_SID",
    "TWILIO_AUTH_TOKEN",
    "TWILIO_FROM_NUMBER",
    "HUTCHROK_OS_API_URL",
    "HUTCHROK_OS_SIGNING_SECRET",
    "HUTCHROK_OS_MAILBOX",
    "NEXT_PUBLIC_SITE_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "NODE_ENV",
  ] as const,
};
