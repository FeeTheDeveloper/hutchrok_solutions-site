# Deploying to Cloudflare Workers

This app runs on Cloudflare Workers via the [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare) adapter. (It also still builds/deploys on Vercel — the two are not mutually exclusive during the cutover.)

## Prerequisites
- Next.js **≥ 16.2.6** (the adapter excludes 16.0–16.2.5). This repo pins `16.2.10`.
- `wrangler` authenticated: `npx wrangler login`.

## Local commands
```bash
npm run cf:build     # next build + OpenNext transform → .open-next/
npm run cf:preview   # build + run the Worker locally (workerd)
npm run cf:deploy    # build + deploy to your Cloudflare account
npm run cf:typegen   # regenerate Cloudflare env types
```
For local secrets, copy `.dev.vars.example` → `.dev.vars` (gitignored).

## First-time setup
1. **Deploy once** to create the Worker: `npm run cf:deploy` (or connect Git — below).
2. **Set env vars & secrets** (Workers → your worker → Settings → Variables & Secrets), or via CLI:
   ```bash
   wrangler secret put SUPABASE_URL
   wrangler secret put SUPABASE_ANON_KEY
   wrangler secret put ADMIN_TOKEN
   wrangler secret put RESEND_API_KEY
   # ...RESEND_FROM_EMAIL, RESEND_TO_EMAIL, OPS_*, TWILIO_*, CLERK_SECRET_KEY as needed
   ```
   `NEXT_PUBLIC_*` are inlined at **build** time — provide them to the build environment
   (`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`), not as runtime secrets.

## Continuous deployment (Vercel-style)
Cloudflare **Workers Builds** → Connect to Git → select this repo.
- Build command: `npx opennextjs-cloudflare build`
- Deploy command: `npx opennextjs-cloudflare deploy`
- Add the build-time `NEXT_PUBLIC_*` vars in the build settings.

## Custom domain (DNS already on Cloudflare)
Worker → Settings → **Domains & Routes → Add Custom Domain** → `hutchrok.com` (and `www`).
Cloudflare creates the proxied records automatically — no nameserver change. Then remove
`hutchrok.com` from the Vercel project so the two don't contend for the domain.

## Runtime notes
- **Form 205 template** is served from `public/filings/205_boc.pdf` and fetched over HTTP by
  `/api/filings/document` — no filesystem, so it works on Workers, Vercel, and dev alike.
- **Rate limiter** (`lib/rate-limit.ts`) is in-memory; on Workers it resets per isolate.
  For durable limits, move it to KV or a Durable Object later.
- All server work uses `fetch`-based clients (Supabase, Resend, Twilio) — Workers-compatible.
