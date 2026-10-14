# Vercel → Cloudflare Workers migration

**Date:** 2026-10-14
**Site:** https://www.hutchrok.com
**From:** Vercel project `hutchrok-solutions-site` (`prj_8OjnAElsHaoYc50P9fK4VPrQEkUg`, team `team_mjDCwdXOv5dHtOGdxnyqqVcE`)
**To:** Cloudflare Worker `hutchrok-solutions-site` (account `62738e2bb751720449f1cd904f6d175f`, zone `hutchrok.com` / `c6289ba82d5ab79c77009ff6483c8be5`)

## How it runs now

The app is still a normal Next.js 15 App Router project — `next dev` and `next build` are
unchanged. [@opennextjs/cloudflare](https://opennext.js.org/cloudflare) takes the `next build`
output and packages it as a Worker:

| Concern | Vercel | Cloudflare |
| --- | --- | --- |
| Compute | Serverless/Fluid functions | One Worker (`.open-next/worker.js`), `nodejs_compat` |
| Static assets | Vercel CDN | Workers static assets (`ASSETS` binding, `.open-next/assets`) |
| Middleware | Edge middleware | Runs inside the same Worker |
| Env vars | Project env (encrypted/sensitive) | Worker secrets (`wrangler secret bulk`) |
| Build-time `NEXT_PUBLIC_*` | Injected by Vercel build | Read from `.env.local` during the local build |
| Deploy | git push → Vercel build | `npm run cf:deploy` from a checkout |
| Logs | Vercel runtime logs | Workers Logs (`observability.enabled`), `npx wrangler tail` |

Why OpenNext and not [vinext](https://vinext.dev): vinext is Cloudflare's newer recommended
path, but it is beta and targets Next.js 16. This app is on Next.js 15.5 with Clerk
middleware, so OpenNext is the supported route today. Revisit after a Next 16 upgrade.

## Commands

```bash
npm run dev          # unchanged, plain next dev
npm run cf:build     # next build + package as a Worker
npm run cf:preview   # build, then run the Worker locally in workerd
npm run cf:deploy    # build + deploy to Cloudflare
npm run cf:secrets   # push .env.local into the Worker as secrets (--dry to list only)
npm run cf:typegen   # regenerate cloudflare-env.d.ts from wrangler.jsonc
```

Wrangler authenticates from `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` in `.env.local`
(export them into the shell first), or interactively with `npx wrangler login`.

## Environment variables

`.env.local` is the source of truth. `npm run cf:secrets` reads it and uploads every variable
as a Worker secret — the Workers equivalent of a Vercel "sensitive" env var. Values are written
to a temp file that is deleted immediately after upload; nothing lands in the repo.

Two kinds of variables, and the difference matters:

- `NEXT_PUBLIC_*` are **inlined at build time**. They must be present in `.env.local` on the
  machine that runs `cf:build`/`cf:deploy`, or the deployed bundle ships without them.
- Everything else is read at request time from the Worker's secrets.

Carried over from Vercel but previously missing from `.env.local` (added during the migration,
they are build-time Clerk routing values):
`NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL`,
`NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL`.

Deliberately **not** carried over (nothing in the codebase reads them — they came from the old
Vercel/Supabase integration): `POSTGRES_URL`, `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING`,
`POSTGRES_USER`, `POSTGRES_HOST`, `POSTGRES_PASSWORD`, `POSTGRES_DATABASE`,
`SUPABASE_JWT_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`.

`VERCEL_GIT_COMMIT_SHA` no longer exists. `next.config.ts` now stamps `DEPLOY_COMMIT_SHA` from
`git rev-parse HEAD` at build time, and `/api/admin/agents/health` reports it as
`applicationVersion`.

## Unchanged by the migration

- Clerk production instance and its `clerk.www` / `accounts.www` / DKIM CNAMEs.
- Stripe webhook endpoint URL (`https://www.hutchrok.com/api/stripe/webhook`) and signing secret.
- Supabase project `xfcfycnowosrponbespe`.
- Google Workspace MX/SPF/DKIM records and the Resend DKIM record.

## Cutover record (2026-10-14)

Worker `hutchrok-solutions-site`, version `2719fbaf-759a-4b7c-8851-97a2622b716a`.
Staging URL (kept enabled): https://hutchrok-solutions-site.fee-627.workers.dev

1. Deployed the Worker and pushed 26 secrets from `.env.local`.
2. Deleted the two Vercel CNAMEs (`hutchrok.com`, `www.hutchrok.com` →
   `980025f0718a8c0c.vercel-dns-016.com`).
3. `wrangler deploy` attached both hostnames as Workers custom domains, creating proxied
   records (`104.21.33.131`, `172.67.190.24`). Both hostnames are now orange-clouded, where
   before they were DNS-only.

Verified after cutover, against the old Vercel deployment for parity:

| Check | Result |
| --- | --- |
| `www.hutchrok.com/` | 200, `x-opennext: 1`, `server: cloudflare` |
| `hutchrok.com/` | 308 → `https://www.hutchrok.com/` (middleware) |
| `/api/health` | 200, `db.reachable: true` |
| `/admin` | 401 (admin token guard) |
| `/dashboard` | 404 signed-out — identical to Vercel's Clerk `protect-rewrite` |
| `/login`, `/sign-up` | 200, Clerk loading from `clerk.www.hutchrok.com` |
| `/api/stripe/webhook` | GET 405, unsigned POST 400 (signature rejected) |
| Static pages, guides, images, `/robots.txt`, `/icon.svg` | 200 |
| `/pricing`, `/sitemap.xml`, `/favicon.ico` | 404 on both platforms — pre-existing |

## Rollback

DNS is the switch. The pre-cutover record set is saved at
`.vercel/production-repair/dns-before-cloudflare-cutover-20261014.json` (gitignored, local only).

To go back to Vercel: point `hutchrok.com` and `www.hutchrok.com` back at
`980025f0718a8c0c.vercel-dns-016.com` as **unproxied** CNAMEs. The Vercel project, its
production deployment and its env vars are left intact, so the old deployment starts serving
again as soon as DNS propagates.
