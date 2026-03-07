/**
 * Microsoft 365 Ops — webhook emitter.
 *
 * Fires outbound HTTP POSTs to Power Automate (or any webhook URL)
 * when key events happen inside the application.
 *
 * The target URL is set via the OPS_WEBHOOK_URL env var.
 * Calls are fire-and-forget with a short timeout so they never
 * block the critical path.
 */

export type OpsEventType =
  | "case.status_changed"
  | "case.document_inserted"
  | "case.created";

export interface OpsEvent {
  event: OpsEventType;
  timestamp: string;
  payload: Record<string, unknown>;
}

const TIMEOUT_MS = 5_000;

/**
 * Emit an event to the configured Power Automate webhook.
 * Safe to call even when OPS_WEBHOOK_URL is not set — it will no-op.
 */
export async function emitOpsEvent(
  event: OpsEventType,
  payload: Record<string, unknown>
): Promise<void> {
  let url: string;
  try {
    const { getConfig } = await import("@/lib/config");
    url = getConfig().opsWebhookUrl;
  } catch {
    url = process.env.OPS_WEBHOOK_URL || "";
  }
  if (!url) {
    console.debug("[ops/webhook] OPS_WEBHOOK_URL not configured, skipping.");
    return;
  }

  const body: OpsEvent = {
    event,
    timestamp: new Date().toISOString(),
    payload,
  };

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timer);
  } catch (err) {
    // Fire-and-forget — log but never throw
    console.error("[ops/webhook] Failed to emit event:", event, err);
  }
}
