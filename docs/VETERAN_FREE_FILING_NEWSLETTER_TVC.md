# Veteran Free Filing, Newsletter Contacts, Specials, TVC Connect

## What shipped
- **One free filing per account** — `free_filing_entitlements` (unique per Clerk user AND per email).
  Flow: `PENDING_VERIFICATION` → ops `verify` (VVL/TVC confirmed) → member claims → `REDEEMED` → ops `link_case`.
  - Member: `GET/POST /api/account/free-filing` (Clerk, verified primary email required). Dashboard card: `components/dashboard/free-filing-card.tsx`.
  - Ops: `POST /api/admin/free-filing` with `Authorization: Bearer $ADMIN_TOKEN`,
    body `{ clerkUserId, action: "verify"|"revoke"|"link_case", actor, note?, filingCaseId? }`.
- **Newsletter contacts & leads** — `newsletter_contacts`. `/api/newsletter` (explicit consent required, one-click unsubscribe via `?unsubscribe=<token>`).
  `/api/lead` now also upserts every lead: opted-in → `SUBSCRIBED`, otherwise `LEAD_ONLY` (never bulk-emailed).
- **Add-on specials** — `lib/specials.ts`, date-windowed (America/Chicago). Veterans Day special `SALUTE20`, Nov 4–15, 2026, 20% off website/brand/logo/email.
  Shown on `/launch-services` and `/resources` (hourly revalidate). Checkout enforcement of the code is NOT yet wired to Stripe.
- **Veteran feeds** — `/resources`, VA News (`news.va.gov/feed/`) + VFW press releases, hourly, failures degrade gracefully. TVC blocks automated access, so it is a link-out.
- **TVC Connect** — `/tvc-connect`. Named contact (Victoria Spitler) renders only when `NEXT_PUBLIC_TVC_CONTACT_CONFIRMED=true`; otherwise routes to `/contact?topic=tvc-connect`.

## Deploy steps
1. Apply `lib/db/migration-013-free-filing-newsletter.sql` in Supabase.
2. Set `NEXT_PUBLIC_TVC_CONTACT_CONFIRMED=true` only after Victoria Spitler / TVC approve the public listing.
3. Build + deploy via the existing Cloudflare pipeline (`npm run cf:deploy`).

## Open items
- Stripe coupon for `SALUTE20` (restricted to the listed services, veterans with VERIFIED/REDEEMED entitlement).
- Newsletter sending (Resend broadcast/audience sync) — contacts are captured; no bulk send is built.
- Ops UI for verify/revoke (API exists; admin page not built).
- Homepage membership card says an active subscription is required for filing services — reconcile with the free-filing promise.
