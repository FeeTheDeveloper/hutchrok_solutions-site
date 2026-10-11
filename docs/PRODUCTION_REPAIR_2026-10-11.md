# Hutchrok production repair and FTD-CORE-001 review — 2026-10-11

Scope: Hutchrok Solutions Group LLC, www.hutchrok.com, Clerk app app_3KSbPXq2zMGAEh9XH6cUwtbT5dS / production instance ins_3KYBaPxREAvLWU0TRc20Wjwp5La; Stripe acct_1UP8e4K9EdgEUYPN; Supabase igiuifkvunrnmgamyzqw; Vercel prj_8OjnAElsHaoYc50P9fK4VPrQEkUg. Fee The Developer supplies engineering and the Vercel team. No other tenant was modified.

This is a targeted secondary-engineer review of the production connection paths and adjacent OS activation gate. It is not a completed review of the entire Claude control-plane proposal.

## CRITICAL

**C1 — Direct anonymous database access bypassed Clerk and application ownership checks (REPAIRED 2026-10-11).** Count-only authenticated-as-anon HEAD requests on the production Supabase REST API returned nonzero visible counts for client_profiles, filing_cases, case_documents, intake_submissions, and audit_log. No client row contents were retrieved. lib/db/schema.sql contains always-true policies, and docs/SECURITY_FINDINGS.md already describes this issue. The previous getSupabaseServer used createContextClient without a user token; installing a secret in Vercel did not make that client privileged. The patch uses the SDK's createAdminClient behind server-only and fails closed without a secret. That code change prepared the application for the separate database policy repair subsequently applied below.

The user restored browser access to the exact production project. The connector still lacks project permission, so the authenticated dashboard SQL Editor was used. Removed five always-true core policies, revoked direct anon/authenticated/PUBLIC grants on the five core and three membership tables, and removed three public case-document Storage policies. RLS remains enabled; the bucket remains private; existing service-role privileges are preserved. New postgres-created public tables no longer receive automatic anon/authenticated grants. No client rows or files were modified. Ten anonymous REST checks now return 401, catalog checks deny both roles on all ten tables, both roles see zero Storage objects, and the deployed service-key health check remains 200. See docs/operations for the preimage, exact repair and repeatable verification. Application-level tenant tests are still required before autonomous handling.

## HIGH

**H1 — Production authentication unavailable (configuration repaired).** Clerk's primary domain was misspelled www.hutcrok.com while Cloudflare and Vercel serve www.hutchrok.com. Corrected the existing domain while preserving the existing clerk.www / accounts.www layout; updated only the six Clerk email CNAME targets to the new domain's generated targets. Frontend API, account portal, primary email DNS and SSL issuance were verified in Clerk. Production Vercel lacked both Clerk keys and redirect variables; these were added only to production and the existing commit was redeployed. Browser login now renders Clerk and unauthenticated account/checkout API calls return 401.

**H2 — Stripe account/catalog mismatch (patch deployed and catalog reconciled).** The verified Hutchrok live account had zero products and zero prices. Existing site price IDs did not belong to this account. Created idempotently keyed prices matching the published offers and updated the seven purchasable service mappings. Checkout verifies the account ID, live mode, product/price activity, USD amount and billing mode before creating a session. Browser-supplied amount/price IDs are ignored. Registered-agent service remains waitlist-only.

**H3 — Payment acknowledgement before reliable processing (partially repaired).** The webhook previously emitted payment.completed without checking payment_status, ignored async success, and acknowledged failed profile/OS writes with HTTP 200. The patch gates on paid/no_payment_required, handles async success, returns 503 on database or configured OS delivery failure, and uses a stable Checkout Session paid-effect ID. The Stripe endpoint now subscribes to async success. A durable event receipt/outbox and replay reconciliation are still required before claiming exactly-once effects or enabling an autonomous OS.

**H4 — Membership purchase and entitlement lifecycle absent (OPEN).** The $59/$129/$249 monthly offers route to /sign-up?plan=..., but the sign-up page forces /dashboard and does not create a subscription. Existing member access checks use separately provisioned Premium metadata, not Operator/Growth/Command subscriptions. Catalog prices now exist, but recurring checkout, cancellation/past-due/recovery synchronization, duplicate-subscription prevention and filing allowance accounting remain unimplemented. Catalog creation does not activate memberships. Do not charge subscriptions until the entitlement workflow is implemented and tested.

**H5 — OS cannot safely be activated by adding credentials (OPEN).** Live Vercel configuration has no HUTCHROK_OS_API_URL or signing secret. The adjacent hutchrok_os/apps/api/src/index.ts explicitly blocks production startup pending tenant-bound effect recovery and provider reconciliation. Postgres store implementations exist, so the older characterization of all persistence as in-memory is no longer sufficient. The production gate is still present. No gate was bypassed and no arbitrary endpoint was configured.

## MEDIUM

- Checkout retries formerly created independent sessions. A browser attempt UUID now becomes a server-generated user/service-scoped Stripe idempotency key; the UI also prevents concurrent submissions. This covers retries of one attempt, not separate devices or deliberate new attempts.
- Return URLs were derived from request origin and ?checkout=success claimed payment success without verification. URLs now use the configured canonical origin; the return page no longer claims to be a receipt.
- The /login route has no catch-all children. Clerk now uses hash routing there so multi-step login does not depend on missing child routes.
- Legacy admin access accepts tokens in URL query strings (middleware.ts); move to a reviewed server session/capability boundary. This patch does not redesign admin authorization.
- Rate limiting uses process-local memory; production instances and restarts do not share limits.
- Out-of-order webhook deliveries can still overwrite profile customer linkage/timestamps. Before subscriptions launch, use a durable customer mapping and monotonic provider reconciliation.

## LOW

- Connection verification previously called an unused, disabled R2 product a site outage and accepted any URL containing /api/stripe/webhook. It now skips unused R2, verifies the exact enabled Hutchrok webhook/account, uses request timeouts and treats a missing server database secret as a failure.
- The shared LooseDatabase type hides column drift; two historical migrations share the 010 prefix. Generate database types and a uniquely ordered migration history before extending membership/tenant schemas.
- Local C: drive is full. A build failed with ENOSPC; cache deletion was rejected by automatic approval review. No cache was deleted. Use the Vercel build result as build evidence. Local changes remain in the isolated workspace; the reviewed source can be committed through the GitHub API without modifying unrelated files.

## TESTS REQUIRED

Passed locally: 12 route/SDK regression tests; TypeScript with --noEmit --incremental false; ESLint on changed files; diff whitespace validation. Tests exercise real route code with provider boundaries substituted, plus the actual Supabase SDK's outgoing key selection. Five payment tests were observed failing before the fixes.

Required before claiming complete production readiness:
1. The direct database/storage permission audit now passes. Re-run the supplied checks after every migration and add application-level storage upload/download tests using isolated fixtures.
2. Two real Clerk users cannot read, claim, modify or download each other's records; verify primary email ownership and forged/expired/wrong-tenant sessions.
3. Authenticated browser checkout to the verified live catalog, with no real purchase unless separately authorized; test successful payment, failure, replay, concurrent duplicate events and crash between persistence and delivery in a sandbox.
4. Membership checkout, renewal, cancellation, past due and recovery; capacity/allowance concurrency and duplicate-subscription tests.
5. Outbox replay, approval payload binding/versioning, expired/revoked approvals, provider timeout reconciliation and recovery after restart.
6. Mobile/keyboard links, complete sign-in/sign-up, and a production runtime error scan after deployment.

## RECOMMENDED CHANGES

1. Preserve the checked-in permission preimage and applied SQL; verify project identity and current grants before any subsequent schema change.
2. Keep anon/authenticated direct access denied and case-documents private. Re-run the supplied SQL/HTTP checks after migrations. Reconnect Supabase MCP with access to this project for future provider-backed automation.
3. Keep public intake behind validated/rate-limited server routes; keep each Clerk user ownership predicate at server read/write boundaries. Do not use user-editable metadata to grant membership or admin capabilities.
4. Add tenant/environment/provider-account-bound payment receipts and an outbox; reconcile provider state before subscription entitlements or OS effects.
5. Keep this patch isolated for Claude's review. Preserve the existing architecture and production guard.

Initial narrower SQL proposal (superseded by the executed docs/operations/hutchrok-private-access-repair.sql, which also closes storage and membership grants):

```sql
begin;
alter table public.intake_submissions enable row level security;
alter table public.filing_cases enable row level security;
alter table public.case_documents enable row level security;
alter table public.audit_log enable row level security;
alter table public.client_profiles enable row level security;
revoke all privileges on table public.intake_submissions, public.filing_cases,
  public.case_documents, public.audit_log, public.client_profiles from anon, authenticated;
grant select, insert, update, delete on table public.intake_submissions, public.filing_cases,
  public.case_documents, public.audit_log, public.client_profiles to service_role;
-- Inspect pg_policies and drop each verified always-true policy by its actual name.
-- Verify no grants inherited from PUBLIC or other roles reopen these tables.
commit;
```

Rollback/recovery: original deployment dpl_FApo3Vj7ar71r4JdrBJNJtbUrftw; auth repair deployment dpl_6wWk1sv4iZKttnQ3MN1RBjG9tmPQ. Prefer rolling back code while keeping corrected Clerk DNS/configuration. Reverting to the misspelled Clerk domain restores the outage and invalidates sessions again. DNS preimages and Stripe webhook preimage were saved under ignored .vercel/production-repair/. Do not restore permissive database policies to repair an application error; repair or roll back the server code while retaining confidentiality.

Sources: [Clerk domain changes](https://clerk.com/docs/guides/development/deployment/changing-domains), [Stripe fulfillment](https://docs.stripe.com/checkout/fulfillment), [Supabase API security](https://supabase.com/docs/guides/api/securing-your-api), installed @supabase/server 1.4.0 docs/core-primitives.md, current repository and live provider observations.


## Follow-up verification at 2026-10-11 19:00 UTC

The applied permission repair and exact preimage are preserved in the isolated PR branch. Re-run scripts/verify-private-access.mjs and docs/operations/verify-private-access.sql after future permission changes. The live application code remains commit 562d8efddf248c4884e969b43ef0cd611d9a69e3; this follow-up changes SQL/review artifacts only. The browser project dashboard also displays an outstanding-invoices warning. Billing was not changed.

The local drive is full, so follow-up artifacts were committed through GitHub rather than written to the local checkout. No credentials or client contents were added. Supabase's generic destructive-query warning was accepted only for the reviewed permission removals; the SQL contains no row/file deletion. The transaction completed successfully.

Recovery constraint after RLS repair: do not roll back to the old anon-context database client. Keep a deployment with the server-only service-key client (562d8ef or a validated successor). Fix forward or roll back compatible code while retaining denied public access; the archived permission preimage is diagnostic evidence, not an automatic insecure rollback.
