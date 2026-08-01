# Production security findings

## P0 — Core application RLS remains overly permissive

Supabase security advisors still report always-true `ALL` policies on:

- `intake_submissions`
- `filing_cases`
- `case_documents`
- `audit_log`
- `client_profiles`

These policies effectively allow broad anonymous access despite RLS being
enabled. Do not store real client, veteran, filing, identity, payment-linkage,
or private-document data until the application is confirmed to use
`SUPABASE_SECRET_KEY` for all server writes and the permissive policies are
replaced with least-privilege policies.

This bundle does not silently remove the existing policies because doing so
before confirming every production route uses the server secret could break
intake, tracking, profile, and document workflows. The required sequence is:

1. Confirm `SUPABASE_SECRET_KEY` is configured in Vercel Production, Preview,
   and Development.
2. Verify every privileged Supabase operation runs only on the server.
3. Add a reviewed core-RLS hardening migration.
4. Test intake, case claiming, tracking, profile access, admin actions, and
   document upload/download in Preview.
5. Apply the migration to Production.
6. Re-run Supabase security advisors and direct anonymous-access tests.

## Agent tables

`agent_definitions` and `agent_tasks` use RLS with no anon/authenticated
policies and explicit grants only to `service_role`. Supabase may report the
informational lint `RLS Enabled No Policy`; that is intentional for these
server-only tables.

## P1 — Contact data in runtime logs

The current notification log channel serializes event data, including contact
fields. The overlay replaces that logger with metadata-only logging. Deploy the
replacement before real client intake.

## P1 — Legacy admin token in query strings

The existing application still permits `?token=` for legacy admin routes.
Agent administration routes in this overlay require an
`Authorization: Bearer` header and intentionally reject query-string-only
authentication. The broader admin area should migrate to Clerk role-based
access or another session-based control.
