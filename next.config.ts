import { execSync } from "node:child_process";
import type { NextConfig } from "next";

/**
 * Build-time deploy stamp. On Vercel this came from VERCEL_GIT_COMMIT_SHA;
 * on Cloudflare Workers there is no injected git metadata, so we read the
 * commit at build time and inline it.
 */
function commitSha(): string {
  if (process.env.DEPLOY_COMMIT_SHA) return process.env.DEPLOY_COMMIT_SHA;
  if (process.env.VERCEL_GIT_COMMIT_SHA) return process.env.VERCEL_GIT_COMMIT_SHA;
  if (process.env.CF_PAGES_COMMIT_SHA) return process.env.CF_PAGES_COMMIT_SHA;
  if (process.env.WORKERS_CI_COMMIT_SHA) return process.env.WORKERS_CI_COMMIT_SHA;
  try {
    return execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  env: {
    DEPLOY_COMMIT_SHA: commitSha(),
  },
};

export default nextConfig;

// Lets `next dev` talk to Cloudflare bindings defined in wrangler.jsonc.
// No-op in production builds.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
void initOpenNextCloudflareForDev();
