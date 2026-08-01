import { emailFrom, TEAM_INBOX } from "@/lib/email/config";

interface NewFilingNotificationPayload {
  caseNumber: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  entityType: string;
  veteranStatus: boolean;
  vvlStatus: string;
}

/**
 * Internal "new filing intake" notification to the team inbox.
 * Best-effort — never throws, self-disables without RESEND_API_KEY.
 */
export async function notifyTeamNewFiling(
  payload: NewFilingNotificationPayload,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const from = emailFrom();
  const text = [
    "New veteran filing intake",
    "",
    `Case: ${payload.caseNumber}`,
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone}`,
    `Business: ${payload.businessName} (${payload.entityType})`,
    `Veteran status: ${payload.veteranStatus ? "Yes" : "No"}`,
    `VVL status: ${payload.vvlStatus}`,
  ].join("\n");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [TEAM_INBOX],
        reply_to: payload.email,
        subject: `New filing intake: ${payload.businessName || payload.name} (${payload.caseNumber})`,
        text,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`[api/intake] team notification failed (${res.status}): ${body}`);
    }
  } catch (e) {
    console.error("[api/intake] team notification failed:", e);
  }
}
