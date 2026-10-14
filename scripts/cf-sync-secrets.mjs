#!/usr/bin/env node
/**
 * Push the runtime environment from .env.local into the Cloudflare Worker
 * as secrets (the Workers equivalent of Vercel's encrypted/sensitive env vars).
 *
 *   npm run cf:secrets            # sync every runtime var found in .env.local
 *   npm run cf:secrets -- --dry   # print the key list, upload nothing
 *
 * Values never touch the repo: the payload is written to a temp file that is
 * deleted in a finally block.
 */

import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

/** Vars that only configure the local toolchain, never the running app. */
const SKIP = new Set(["NODE_ENV"]);

function parseEnvFile(text) {
  const out = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!value || SKIP.has(key)) continue;
    out[key] = value;
  }
  return out;
}

const dryRun = process.argv.includes("--dry");

const env = parseEnvFile(await readFile(new URL("../.env.local", import.meta.url), "utf8"));
const keys = Object.keys(env).sort();

if (keys.length === 0) {
  console.error("No variables found in .env.local — nothing to sync.");
  process.exit(1);
}

console.log(`${dryRun ? "Would sync" : "Syncing"} ${keys.length} secrets to the Worker:`);
for (const key of keys) console.log(`  ${key}`);

if (dryRun) process.exit(0);

const dir = mkdtempSync(join(tmpdir(), "cf-secrets-"));
const file = join(dir, "secrets.json");
try {
  writeFileSync(file, JSON.stringify(env), { mode: 0o600 });
  execFileSync("npx", ["wrangler", "secret", "bulk", file], {
    stdio: "inherit",
    shell: process.platform === "win32",
  });
} finally {
  rmSync(dir, { recursive: true, force: true });
}

console.log("Done.");
