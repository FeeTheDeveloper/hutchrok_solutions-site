# Redeploy Checklist — Fresh Vercel Project + New Supabase Project

Context: the original Vercel project was deleted and recreated, and it's now
connected to a **new** Supabase project (`igiuifkvunrnmgamyzqw`, replacing the
old `wjedqgrzuvkhnqctsmnd` project referenced earlier). Nothing carries over
automatically — the new Supabase project starts empty, and Vercel needs env
vars set again. This is the exact sequence to get back to a fully working,
autonomous deployment.

**Blocked on your action right now:** this session's Supabase and Vercel MCP
connections both need interactive OAuth (`claude mcp` / `/mcp` in a terminal
with a browser) — that can't be completed from here. Everything below that
says "run in the Supabase SQL Editor" or "set in the Vercel dashboard" needs
you (or another authenticated session) to execute directly until that's done.

---

## 1. Database — run once against the new Supabase project

Open the Supabase SQL Editor for `igiuifkvunrnmgamyzqw` and run
**`lib/db/setup-all.sql`** in full. It's idempotent (safe to re-run) and is
the single source of truth — it consolidates `schema.sql`, migrations
003–010, the ops columns from `schema-ops.sql`, the `case-documents` storage
bucket, and that bucket's access policies. You do not need to run any other
`migration-*.sql` file separately on a fresh project.

That last part (storage policies) was added in this pass — the previous
production project had a hand-applied fix for `case-documents` uploads
failing under RLS (per `docs/AUTOMATION_PLAN.md` Phase A), but the actual
policy statements were never captured in a migration file, so a fresh
project would have silently hit the same bug. The policies now in
`setup-all.sql` are a best-effort reconstruction (permissive anon
insert/select/delete on that bucket, matching every other table's RLS
pattern in this codebase) — **verify a document upload actually works**
after running this, since the original policy definitions weren't available
to check against.

- [ ] `setup-all.sql` executed against `igiuifkvunrnmgamyzqw`
- [ ] Spot check: `select * from filing_cases limit 1;` runs without error
- [ ] Spot check: upload a test document through `/admin` (or `/dashboard`)
      and confirm it succeeds

## 2. Vercel project

- [ ] Vercel project recreated and linked to
      `FeeTheDeveloper/hutchrok_solutions-site`, tracking this branch/main
- [ ] Vercel ↔ Supabase integration connected (you mentioned this is done) —
      confirm it actually populated `SUPABASE_URL` / `SUPABASE_ANON_KEY` /
      `SUPABASE_SERVICE_ROLE_KEY` style vars in the Vercel project; the
      integration's naming may not exactly match what this app reads (see
      env var table below) — rename/add vars as needed rather than assuming
      a 1:1 match
- [ ] Production domain (`hutchrok.com`) attached to the new project

## 3. Environment variables

Set these in **Vercel → Project → Settings → Environment Variables**. Full
reference with descriptions is in `.env.example` — this is the checklist
view.

**Required (app throws on boot without these):**

| Variable | Source |
| --- | --- |
| `SUPABASE_URL` | Supabase → Settings → API |
| `SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `ADMIN_TOKEN` | Generate: `openssl rand -base64 32` |

**Needed for features already wired in this codebase:**

| Variable | Enables |
| --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | `/dashboard`, `/sign-up`, `/login`, account linkage |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | `/api/stripe/checkout`, `/api/stripe/webhook` |
| `RESEND_API_KEY` | All outbound email — lead notifications, **submission-received confirmations (new this pass)**, status-change emails |
| `RESEND_FROM_EMAIL`, `RESEND_TO_EMAIL` | Override the default sender/team-inbox identity (optional — has defaults) |
| `OPENAI_API_KEY` | **New this pass** — the intake triage agent (`lib/agents/intake-triage.ts`); self-disables without it |
| `OPENAI_TRIAGE_MODEL` | Optional override, defaults to `gpt-4.1-mini` |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` | Optional SMS status notifications — all three required together |
| `OPS_TOKEN`, `OPS_WEBHOOK_URL` | Optional Power Automate ops webhook |
| `NEXT_PUBLIC_SITE_URL` | Used to build tracking links in emails; defaults to `https://hutchrok.com` |

- [ ] Required vars set
- [ ] Clerk keys set (or explicitly deferred — app degrades gracefully without them)
- [ ] Stripe keys set (or explicitly deferred)
- [ ] `RESEND_API_KEY` set — **without it, the new submission-confirmation
      email silently does nothing**
- [ ] `OPENAI_API_KEY` set — **without it, intake triage silently does nothing**

## 4. Reconnect external webhooks/redirects to the new deployment URL

Anything that was pointed at the old Vercel deployment's URL needs updating:

- [ ] Stripe Dashboard → Webhooks → endpoint URL → `https://<new-domain>/api/stripe/webhook`
- [ ] Clerk Dashboard → confirm allowed redirect/origin URLs include the new domain
- [ ] Resend → confirm the sending domain (`hutchrok.com` or whatever
      `RESEND_FROM_EMAIL` uses) is still verified — domain verification is
      per-Resend-account, not per-deploy, so this is likely already fine

## 5. Post-deploy smoke test

- [ ] Submit a real test intake through `/contact` (veteran flow)
- [ ] Confirm the applicant confirmation email arrives (Resend)
- [ ] Confirm the team notification email arrives at `RESEND_TO_EMAIL`
- [ ] Confirm an `ai_triage` row appears in `audit_log` for that case (if
      `OPENAI_API_KEY` is set)
- [ ] From `/admin`, generate a Form 205 (LLC case) and a Form 202
      (nonprofit case) PDF and confirm both download filled out correctly
- [ ] Advance a test case's status and confirm the status-change email fires

---

## Known gaps / deliberately not done

- **Forms 204 (professional association) and 207 (limited partnership)**
  have official templates in `docs/filings/` but no auto-fill implementation
  and no path to select them from the current intake form (`entityType` is
  limited to `llc | dba | nonprofit`). Wiring these up is intake-wizard work
  (`docs/AUTOMATION_PLAN.md` Phase B), not a redeploy step.
- This checklist assumes `setup-all.sql` is run against a genuinely **empty**
  Supabase project. If `igiuifkvunrnmgamyzqw` already has partial data or
  schema from prior experimentation, review before running.
