/**
 * Hutchrok OS bridge — hutchrok.com → Hutchrok OS.
 *
 * Every business action on the site is reported to Hutchrok OS as a signed
 * "site signal". The OS (FeeTheDeveloper/hutchrok_os, packages/autopilot)
 * acknowledges customers from the OS mailbox, routes work to the owning
 * agent, drafts replies for human approval, and escalates missed SLAs.
 *
 *   POST {HUTCHROK_OS_API_URL}/api/v1/site/signals
 *   x-hutchrok-timestamp: <unix seconds>
 *   x-hutchrok-signature: sha256=<hex HMAC-SHA256 of "<timestamp>.<body>">
 *
 * Safe to call when unconfigured (no-op) and never throws — the site's own
 * flows must not depend on the OS being reachable.
 */

import { createHmac, randomUUID } from "crypto";

export type SiteSignalType =
  | "contact.submitted"
  | "lead.created"
  | "intake.submitted"
  | "service_request.submitted"
  | "federal_intake.submitted"
  | "case.created"
  | "case.status_changed"
  | "case.event"
  | "document.uploaded"
  | "payment.completed"
  | "payment.failed"
  | "membership.activated"
  | "account.created"
  | "site.other";

export interface SiteSignalInput {
  type: SiteSignalType;
  /** Stable idempotency key; generated when omitted. */
  signalId?: string;
  contact?: { name?: string; email?: string; phone?: string; businessName?: string };
  subject?: string;
  message?: string;
  entity?: { type: string; id?: string; ref?: string };
  data?: Record<string, unknown>;
}

const TIMEOUT_MS = 3_000;

export function isOsBridgeEnabled(): boolean {
  return Boolean(process.env.HUTCHROK_OS_API_URL && process.env.HUTCHROK_OS_SIGNING_SECRET);
}

function truncate(value: string | undefined, max: number): string | undefined {
  if (value === undefined) return undefined;
  return value.length > max ? value.slice(0, max) : value;
}

/** Report a site action to Hutchrok OS. Resolves to true when the OS accepted it. */
export async function emitSiteSignal(input: SiteSignalInput): Promise<boolean> {
  const baseUrl = process.env.HUTCHROK_OS_API_URL;
  const secret = process.env.HUTCHROK_OS_SIGNING_SECRET;
  if (!baseUrl || !secret) return false;

  const body = JSON.stringify({
    signalId: input.signalId ?? `${input.type}:${randomUUID()}`,
    type: input.type,
    occurredAt: new Date().toISOString(),
    source: "hutchrok.com",
    ...(input.contact ? { contact: input.contact } : {}),
    ...(input.subject ? { subject: truncate(input.subject, 300) } : {}),
    ...(input.message ? { message: truncate(input.message, 10_000) } : {}),
    ...(input.entity ? { entity: input.entity } : {}),
    data: input.data ?? {},
  });
  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = `sha256=${createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex")}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, "")}/api/v1/site/signals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hutchrok-timestamp": timestamp,
        "x-hutchrok-signature": signature,
      },
      body,
      signal: controller.signal,
    });
    if (!res.ok) {
      console.error(`[os/bridge] ${input.type} rejected by Hutchrok OS (HTTP ${res.status}).`);
      return false;
    }
    return true;
  } catch (err) {
    console.error(
      `[os/bridge] ${input.type} not delivered:`,
      err instanceof Error ? err.message : String(err),
    );
    return false;
  } finally {
    clearTimeout(timer);
  }
}
