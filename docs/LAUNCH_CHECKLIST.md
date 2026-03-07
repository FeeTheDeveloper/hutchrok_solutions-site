# Launch Readiness Checklist — Hutchrok Solutions Group

Complete every section before opening the platform to real clients.

---

## 1. Infrastructure

### Supabase

- [ ] Production Supabase project created (separate from dev/staging)
- [ ] Database tables created via `lib/db/schema.sql`
- [ ] Ops tables created via `lib/db/schema-ops.sql`
- [ ] Storage bucket `case-documents` created and set to **private**
- [ ] Storage policy allows authenticated uploads and signed-URL reads
- [ ] Row-Level Security (RLS) enabled on all tables
- [ ] Database backups configured (point-in-time recovery enabled)

### Cloudflare Pages

- [ ] Project `hutchrok-solutions` deployed via `npx @opennextjs/cloudflare build`
- [ ] Custom domain configured and DNS pointing to Cloudflare Pages
- [ ] SSL/TLS set to Full (Strict) mode
- [ ] Environment variables set in Cloudflare Pages dashboard:
  - `SUPABASE_URL` — production Supabase URL
  - `SUPABASE_ANON_KEY` — production anon key
  - `ADMIN_TOKEN` — strong random secret (`openssl rand -base64 32`)
  - `OPS_TOKEN` — ops webhook secret (if using Power Automate integration)
  - `OPS_WEBHOOK_URL` — outbound webhook URL (if using ops integration)

### Security

- [ ] `ADMIN_TOKEN` is at least 32 characters, randomly generated
- [ ] `OPS_TOKEN` is distinct from `ADMIN_TOKEN`
- [ ] No secrets or tokens are committed to the repository
- [ ] `.env.local` is in `.gitignore`
- [ ] HTTPS enforced on all routes (Cloudflare handles this)
- [ ] Middleware blocks unauthenticated access to `/admin/*` pages

---

## 2. Application Verification

### Public Pages

- [ ] Homepage (`/`) loads with hero, service cards, and navigation
- [ ] `/services`, `/formation-filings`, `/credit-enablement` render correctly
- [ ] `/veteran-owned` and `/mission` brand pages load
- [ ] `/free-filing` has working "Start My Filing" and "Check My Eligibility" CTAs
- [ ] `/eligibility` quiz produces correct results for all 3 outcomes
- [ ] `/contact` intake form completes the 4-step veteran flow
- [ ] `/contact` intake form handles legacy (non-veteran) submissions
- [ ] All navigation links resolve (no dead links or `href="#"`)

### Intake Flow

- [ ] Veteran intake creates a `filing_cases` row with status `LEAD`
- [ ] Case numbers generate correctly (format: `HSG-YYYY-XXXX`)
- [ ] Eligibility quiz answers pre-populate the intake form via localStorage
- [ ] Rate limiting works (5 requests/60s per IP on intake endpoint)
- [ ] Validation errors display for missing/invalid fields
- [ ] Success screen shows case number and next steps

### Admin Console

- [ ] `/admin?token=...` loads the dashboard with pipeline summary
- [ ] All 9 status filters work correctly
- [ ] Case detail page loads with all sections (applicant, business, ownership, filing)
- [ ] Quick Actions advance status correctly
- [ ] Blocking alerts appear for missing VVL and incomplete intake
- [ ] Document upload accepts PDF/JPG/PNG, rejects other types
- [ ] Magic bytes validation blocks misnamed files
- [ ] Document download via signed URLs works
- [ ] Document deletion removes from both storage and database
- [ ] Internal notes, assignment, and due dates save correctly
- [ ] Launch Services Handoff appears for ACCEPTED/COMPLETED cases
- [ ] Save bar provides clear success/error feedback

### API Security

- [ ] All `/api/admin/*` routes require valid `ADMIN_TOKEN`
- [ ] All `/api/ops/*` routes require valid `OPS_TOKEN`
- [ ] UUID validation prevents injection on ID parameters
- [ ] Rate limiting active on intake (5/min) and admin list (30/min)
- [ ] File uploads validated by MIME type, extension, size, and magic bytes
- [ ] Filenames sanitized before storage
- [ ] Error responses do not leak stack traces or internal details

---

## 3. Operational Readiness

### Admin Access

- [ ] Admin token distributed securely to authorized operators
- [ ] Admin URL bookmarked: `https://YOUR_DOMAIN/admin?token=YOUR_TOKEN`
- [ ] Operators trained on the 9-step pipeline (see `OPERATOR_WORKFLOW.md`)

### Case Processing

- [ ] Operator understands the status progression:
  `LEAD → ELIGIBILITY_PENDING → VVL_PENDING → READY_FOR_INTAKE → IN_REVIEW → READY_FOR_FILING → SUBMITTED → ACCEPTED → COMPLETED`
- [ ] Blocking alerts understood (VVL missing, intake incomplete)
- [ ] Quick Actions understood (one-click status transitions)
- [ ] Document naming convention established for case files
- [ ] Launch services handoff process documented

### Monitoring

- [ ] Cloudflare Analytics enabled for traffic monitoring
- [ ] Supabase dashboard accessible for database monitoring
- [ ] Error logging reviewed (no PII in console output)
- [ ] Audit trail tables (`audit_logs`, `ops_event_log`) being populated

---

## 4. Business Readiness

### Content

- [ ] All service descriptions reviewed and approved
- [ ] Contact email (`contact@hutchrok.com`) is monitored
- [ ] Phone number in footer is correct and answered
- [ ] Brand assets in `/public/brand/` are final

### Legal

- [ ] Terms of service / privacy policy in place (if applicable)
- [ ] Veteran filing disclaimer text reviewed for accuracy
- [ ] Free filing eligibility criteria confirmed with legal

---

## Go / No-Go Decision

| Area | Status | Owner |
| --- | --- | --- |
| Infrastructure | ☐ Ready | DevOps |
| Application | ☐ Ready | Engineering |
| Operations | ☐ Ready | Operations |
| Business | ☐ Ready | Leadership |

**Launch approved by:** _____________________ **Date:** _____________
