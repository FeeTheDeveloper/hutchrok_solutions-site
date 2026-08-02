# Agent Command Center Security Plan

Status: review plan only. The accompanying RLS migration must not be applied until Preview regression testing passes and a human operator explicitly approves production rollout.

## Required credential posture

Every database or Storage operation listed below must run through `getSupabaseServer()` with `SUPABASE_SECRET_KEY`. The publishable/anon fallback is not an acceptable production credential after hardening. Clerk identifies clients, `ADMIN_TOKEN` identifies operators, `OPS_TOKEN` identifies automation, and Stripe signatures identify Stripe. None of those replace the server database credential.

## Route access map

| Route | Tables / storage | Operation | Server credential | Clerk | ADMIN_TOKEN | Anonymous browser | Proposed RLS/grant change | Regression test |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `POST /api/intake` | `intake_submissions`, `filing_cases`, `audit_log`, `agent_tasks` | insert/read | Supabase secret | No | No | Yes, through Next.js | revoke anon/authenticated; service-role only | all three intake variants create case; triage remains best-effort |
| `POST /api/intake/upload-vvl` | `filing_cases`, `case_documents`, Storage | read/insert/upload | Supabase secret | No | No | Yes, time-limited case proof | remove anonymous Storage policies | valid upload works; expired/wrong case rejected |
| `POST /api/lead` | `intake_submissions` | insert | Supabase secret | No | No | Yes, through Next.js | service-role only | lead submission persists |
| `POST /api/service-request` | `intake_submissions` | insert | Supabase secret | No | No | Yes, through Next.js | service-role only | request persists and notification behavior unchanged |
| `GET /api/track` | `filing_cases` | allowlisted select | Supabase secret | No | No | Yes, with case lookup inputs | service-role only | valid lookup returns client-safe fields; enumeration blocked |
| `GET /api/health` | `intake_submissions` | limited select | Supabase secret | No | No | Yes | service-role only | safe health metadata only |
| `GET/PATCH /api/admin/cases/[id]` | `filing_cases`, intake join, documents, `audit_log` | select/update/insert audit | Supabase secret | No | Yes (legacy query allowed here) | No | service-role only | admin read/update and audit work |
| `GET /api/admin/cases` | `filing_cases`, intake join | select | Supabase secret | No | Yes (legacy query allowed here) | No | service-role only | list/filter works |
| `POST /api/cases/[id]/upload` | case tables, Storage | select/insert/upload | Supabase secret | No | Yes | No | remove anonymous Storage policies | admin upload works |
| `GET/DELETE /api/cases/[id]/documents` | `case_documents`, Storage | select/delete | Supabase secret | No | Yes | No | remove anonymous Storage policies | signed download/delete works |
| `GET/POST /api/account/profile` | `client_profiles` | select/insert/update | Supabase secret | Yes | No | No | service-role only | ownership enforced by Clerk ID |
| dashboard server loaders | intake, case and document tables | claim/select/update | Supabase secret | Yes | No | No | service-role only | verified-email claim and owned-case list work |
| `POST /api/client/cases/[id]/upload` | case tables, Storage | ownership select/insert/upload | Supabase secret | Yes | No | No | remove browser Storage access | owner succeeds; other user gets 404 |
| `POST /api/stripe/checkout` | `client_profiles` | select/insert | Supabase secret | Yes | No | No | service-role only | checkout links correct customer |
| `POST /api/stripe/webhook` | `client_profiles` | update | Supabase secret + Stripe signature | No | No | Stripe only | service-role only | signed event updates; invalid signature rejected |
| `POST /api/ops/case-linked` | `filing_cases`, audit | update/insert | Supabase secret | No | No | No (`OPS_TOKEN`) | service-role only | valid ops event works; invalid token rejected |
| `POST /api/ops/status-sync` | `filing_cases`, audit | update/insert | Supabase secret | No | No | No (`OPS_TOKEN`) | service-role only | status sync and audit work |
| `POST /api/ops/doc-published` | document/case tables, audit | update/insert | Supabase secret | No | No | No (`OPS_TOKEN`) | service-role only | publication metadata updates |
| `GET /api/filings/document` | filing/intake | select, generate PDF | Supabase secret | No | Yes | No | service-role only | authorized generation succeeds |
| `POST /api/filings/generate` | filing/intake, documents/Storage | select/insert/upload | Supabase secret | No | Yes | No | service-role only | generated artifact persists |
| `GET /api/admin/agents/health` | `agent_definitions` | select/connectivity | Supabase secret | No | bearer only | No | already server-only | safe fields only; query token rejected |
| `POST /api/admin/agents/run` | registry/task ledger + allowlisted subject tables | select/insert/update | Supabase secret | No | bearer only | No | already server-only | idempotency, failure ledger, structured outputs |
| `GET /api/admin/agents/tasks` | `agent_tasks` | select | Supabase secret | No | bearer only | No | already server-only | filters validated; input excluded |
| `GET/PATCH /api/admin/agents/tasks/[id]` | `agent_tasks` | select/update decision | Supabase secret | No | bearer only | No | already server-only | approval/rejection only mutate ledger |
| `POST /api/federal-intake` | none currently | validation/stub | none | No | No | Yes | no database grant | response contract unchanged |

## Migration behavior and rollout gate

The review migration drops permissive `Allow all for anon` policies, revokes table privileges from `anon` and `authenticated`, removes anonymous Storage select/insert/delete, restores explicit service-role grants, and limits `audit_log` to service-role `SELECT` and `INSERT`. It intentionally creates no browser policy.

Before Preview deployment, confirm `SUPABASE_SECRET_KEY` is set and that the server client actually selects it. Run every regression in the table, including public intake/tracking, Clerk claim/upload, admin CRUD, Stripe webhook, ops webhooks, and agent tasks. Only then may an operator approve applying the migration to production. Keep a transaction-ready rollback script that restores the prior policies only for emergency recovery; do not normalize permissive policies as the steady state.

## Blocking findings

- Production hardening is blocked until `SUPABASE_SECRET_KEY` is confirmed in every Vercel environment.
- The migration has not been applied or tested against a linked Preview database.
- Existing legacy admin routes still accept query-string tokens; the new agent routes correctly require bearer headers only. Migrating the legacy UI is separate work.
- The in-memory rate limiter is per-instance and is not a distributed abuse-control boundary.
