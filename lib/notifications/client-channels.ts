/**
 * Client-facing notification channels — email (Resend) + SMS (Twilio).
 *
 * These react to STATUS_CHANGED case events and notify the *client* when
 * their filing advances to a meaningful milestone. Both channels degrade
 * gracefully: if the relevant provider env vars are absent the channel is
 * disabled and nothing is sent (a log line is emitted instead).
 */

import { getCaseStatusMeta, shouldNotifyClient } from "@/lib/case-status";
import { CASE_EVENTS, type CaseEvent } from "./events";
import type { NotificationChannel } from "./dispatcher";

/** Contact details carried on a STATUS_CHANGED event's data payload. */
export interface NotifyContact {
  email?: string | null;
  phone?: string | null;
  clientName?: string | null;
  businessName?: string | null;
}

function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://hutchrok.com"
  );
}

/** Extract the contact + status info needed to notify a client, or null. */
function resolveTarget(event: CaseEvent) {
  if (event.event !== CASE_EVENTS.STATUS_CHANGED) return null;
  const newStatus = String(event.data.new_status ?? "");
  if (!shouldNotifyClient(newStatus)) return null;
  const contact = (event.data.contact ?? {}) as NotifyContact;
  const meta = getCaseStatusMeta(newStatus);
  const firstName = contact.clientName?.trim().split(/\s+/)[0] || "there";
  const trackUrl = `${siteUrl()}/track?case=${encodeURIComponent(event.caseNumber)}${
    contact.email ? `&email=${encodeURIComponent(contact.email)}` : ""
  }`;
  return { contact, newStatus, meta, firstName, trackUrl };
}

// ── Email channel (Resend) ──

export const clientEmailChannel: NotificationChannel = {
  name: "client-email",
  enabled: !!process.env.RESEND_API_KEY,
  async send(event) {
    const target = resolveTarget(event);
    if (!target || !target.contact.email) return;

    const { contact, meta, firstName, trackUrl } = target;
    const apiKey = process.env.RESEND_API_KEY!;
    const from =
      process.env.RESEND_FROM_EMAIL ||
      "Hutchrok Solutions Group <onboarding@resend.dev>";
    const business = contact.businessName ? ` for ${contact.businessName}` : "";

    const text = [
      `Hi ${firstName},`,
      "",
      `Your Texas LLC filing${business} (case ${event.caseNumber}) has a new status: ${meta.label}.`,
      "",
      meta.happening,
      "",
      `What's next: ${meta.next}`,
      "",
      `Track your filing anytime: ${trackUrl}`,
      "",
      "— Hutchrok Solutions Group",
      "Veteran-owned · Operator-reviewed",
    ].join("\n");

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [contact.email],
        subject: `Your filing update — ${meta.label} (${event.caseNumber})`,
        text,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[client-email] Resend error (${res.status}): ${body}`);
    }
  },
};

// ── SMS channel (Twilio) ──

const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM = process.env.TWILIO_FROM_NUMBER;

export const clientSmsChannel: NotificationChannel = {
  name: "client-sms",
  enabled: !!(TWILIO_SID && TWILIO_TOKEN && TWILIO_FROM),
  async send(event) {
    const target = resolveTarget(event);
    const phone = target?.contact.phone;
    if (!target || !phone) return;

    const { meta, trackUrl } = target;
    const body = `Hutchrok: your filing ${event.caseNumber} is now "${meta.label}". ${meta.next} Track: ${trackUrl}`;

    const params = new URLSearchParams({
      To: phone,
      From: TWILIO_FROM!,
      Body: body,
    });

    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      },
    );

    if (!res.ok) {
      const txt = await res.text();
      console.error(`[client-sms] Twilio error (${res.status}): ${txt}`);
    }
  },
};
