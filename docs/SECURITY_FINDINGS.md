# Production security findings

## Resolved 2026-10-11: core database and case-document storage exposure

The Hutchrok production project `igiuifkvunrnmgamyzqw` now denies direct
`anon` and `authenticated` access to all 10 public application tables.
The repair revoked unnecessary grants on the five core and three membership
tables, removed five always-true policies, and removed the three public
SELECT/INSERT/DELETE policies on `storage.objects` for `case-documents`.
The bucket remains private. No client rows or stored objects were modified.

The deployed application uses a server-only service-key client. Existing
`service_role` CRUD access was preserved; caller authorization and ownership
checks remain required on every server operation.

Verification on 2026-10-11:
- Anonymous HTTP HEAD probes to all 10 tables returned 401.
- Catalog checks found no table or column privilege for anon/authenticated,
  with RLS enabled on all 10 tables and server CRUD privileges preserved.
- Storage queries under both anon and authenticated returned zero visible objects.
- Production `/api/health` returned 200; a nonexistent tracking lookup returned 404.

Review [the exact repair](operations/hutchrok-private-access-repair.sql),
[the permission preimage](operations/supabase-permissions-before-20261011.json),
and [the SQL checks](operations/verify-private-access.sql).
Run `node --env-file=.env.local scripts/verify-private-access.mjs` for read-only
HTTP checks. Do not replay legacy permissive schema scripts after this repair.

New tables created by postgres in public no longer receive automatic
anon/authenticated table grants. Managed supabase_admin defaults are unchanged,
so every future migration still needs explicit grant/RLS review.
This closes the observed direct database/storage bypass; it does not establish
complete application-level tenant isolation or payment/OS readiness.

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

