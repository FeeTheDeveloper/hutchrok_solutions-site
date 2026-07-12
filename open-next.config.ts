import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * OpenNext → Cloudflare Workers adapter config.
 *
 * Defaults are correct for this app (no ISR / data-cache reliance). If you
 * later add incremental cache, wire an R2/KV cache here per the OpenNext docs.
 */
export default defineCloudflareConfig();
