/**
 * Centralized email (Resend) configuration.
 *
 * All Resend senders read from here so the "from" identity and the team
 * inbox are consistent everywhere. Both are env-overridable.
 *
 * IMPORTANT: For Resend to deliver to arbitrary recipients (clients), the
 * sending domain in RESEND_FROM_EMAIL must be a VERIFIED domain in your
 * Resend account. `onboarding@resend.dev` only sends to your own account
 * email and will fail for real client mail.
 */

/** The From identity for all outbound mail. Set RESEND_FROM_EMAIL in prod. */
export function emailFrom(): string {
  return (
    process.env.RESEND_FROM_EMAIL ||
    "Hutchrok Solutions Group <notifications@hutchrok.com>"
  );
}

/** The internal inbox that receives lead/service notifications + client replies. */
export const TEAM_INBOX = process.env.RESEND_TO_EMAIL || "contact@hutchrok.com";

/** Whether the Resend API key is configured (email delivery enabled). */
export function isEmailEnabled(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}
