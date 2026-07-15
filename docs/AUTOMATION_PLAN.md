# Website Automation Plan — TVC-First Accounts + Texas Filing + EIN

Goal: a veteran uploads their TVC Verification Letter, creates an account,
and files their Texas business — with the EIN handled right after formation.
This document maps the phases, what already exists, and what each phase adds.

---

## What Already Exists (foundation)

| Capability | Where |
| --- | --- |
| Veteran intake → case creation (`HSG-YYYY-XXXX`) | `/api/intake`, `components/veteran-intake-form.tsx` |
| Public VVL upload right after intake (30-min window) | `/api/intake/upload-vvl` |
| Case pipeline (9 statuses) + client-safe tracker | `lib/case-status.ts`, `/track`, `/api/track` |
| Form 205 (LLC) auto-fill from intake data | `lib/filings/fill-form-205.ts`, `/api/filings/document` |
| Entity type → SOS form routing | `lib/filings/template-map.ts`, `docs/filings/FORM_ROUTING.md` |
| Optional Clerk auth + dashboard shell | `app/providers.tsx`, `/dashboard` |
| Admin console (token-gated) | `/admin` |

---

## Phase A — TVC Upload → Account → Linked Dashboard  ✅ (this branch)

The flow the business wants: **upload TVC letter → create account → see your
filing in your own dashboard.**

1. **Account linkage** (`lib/db/migration-009-client-accounts.sql`)
   `filing_cases.clerk_user_id` + `claimed_at`. A case is *claimed* the first
   time a signed-in user's **verified email** matches the intake email.
2. **Client cases service** (`lib/services/client-cases.ts`)
   Claims unclaimed cases on dashboard load; returns client-safe case data
   (status label, milestone, narrative, documents, TVC-letter-on-file flag).
3. **Signup handoff** — the intake success screen now ends with
   **Create My Account** → `/sign-up?redirect_url=/dashboard` (only when Clerk
   keys are configured).
4. **Real dashboard** — `/dashboard` lists the user's actual filings with a
   milestone stepper, plus a **TVC letter upload** when none is attached.
5. **Authenticated upload** (`/api/client/cases/[id]/upload`)
   No 30-minute window: ownership is enforced by the Clerk session +
   `clerk_user_id`. Accepts PDF/JPG/PNG up to 10 MB, magic-byte validated.
6. **Form 05-904 auto-fill** (`lib/filings/fill-form-05-904.ts`)
   The veteran certification (fee waiver + franchise tax exemption) generates
   alongside Form 205 from the admin case page. The ID column is deliberately
   left blank — the veteran completes and signs it (we do not collect or
   store personal identification numbers).
7. **Storage policies fix** — RLS policies for the `case-documents` bucket
   (anon-role insert/select/delete). Without these, every upload failed.
   Applied to production; also in `lib/db/setup-all.sql` for fresh setups.

### Ops runbook (Phase A)
- Run `migration-009-client-accounts.sql` in the Supabase SQL editor (done for prod).
- Set Clerk keys in Vercel to activate accounts (app degrades gracefully without).
- Operator flow unchanged: verify the TVC letter in `/admin`, advance status.

---

## Phase B — Client Filing Wizard (next)

Move data collection from the one-shot intake into a resumable, authenticated
wizard at `/dashboard/file`:

1. `filing_drafts` table (JSONB payload keyed by `clerk_user_id`) — save and
   resume progress.
2. Steps: entity type → business details → registered agent → owners &
   management → veteran certification → review.
3. On submit: creates the intake + case (existing pipeline), attaches the
   draft, pre-generates Form 205/201/202 + 05-904 for operator review.
4. Extend auto-fill beyond LLC using the field maps below (201/202 are already
   fillable AcroForms with known field names).
5. Gate: filing steps require a TVC letter on file (`hasVvlDocument`),
   verified by an operator (`READY_FOR_INTAKE` or later).

### Form field inventory (extracted from the official fillable PDFs)

**Form 201 (For-Profit Corp)** — 63 fields, key ones:
`entity-name`, RA name/address fields (`RAMI`, `RALast Name`,
`RAStreetAddress`, `RACity`, `RAZip`), Directors 1–3 (first/middle/last/
suffix/address blocks), `NumberofShares`, `shareparvalue` + `ShareValue2`
(no-par checkbox), initial mailing address block, `art5supplemental`,
organizer block, effectiveness checkboxes, `ExecDate`, `PrintedTypedName`.

**Form 202 (Nonprofit Corp)** — 68 fields, key ones:
entity name, RA fields, Directors 1–3 blocks, membership checkboxes
(`nonprofit` = has members / `nonprofit2` = no members), purpose lines 1–3,
tax-exempt supplemental provisions box, mailing address, organizer block,
effectiveness checkboxes.

**Form 205 (LLC)** — mapped in `lib/filings/fill-form-205.ts`.

**Form 05-904 (Veteran Certification)** — mapped in
`lib/filings/fill-form-05-904.ts` (`Entity name`, `Owner1..7`, `ID1..7`,
`Percentage1..7` — note the form's own typos `Percentag3`/`Percentag5` —
and `TTLppg` total).

---

## Phase C — EIN Handoff (after formation)

The IRS provides **no third-party API** for EIN issuance, and the online EIN
Assistant must be completed by the responsible party (or a designee with a
signed SS-4 line-7b/Form 2848 authorization). So the automation target is a
**guided handoff**, not a robo-filing:

1. **SS-4 pre-fill** — generate a completed Form SS-4 PDF from case data
   (entity name, formation date, responsible party, reason: "Started new
   business"), stored on the case like Form 205.
2. **Guided EIN step on the dashboard** — unlocks when status reaches
   `ACCEPTED`: a checklist that walks the client through the IRS online EIN
   Assistant with their pre-filled SS-4 beside them (10 minutes, immediate
   EIN issuance Mon–Fri).
3. **EIN capture** — client enters the issued EIN; stored on the case
   (`filing_cases.ein` — Phase C migration) and echoed into the handoff
   summary for launch services (bank account, DUNS, etc.).
4. Operator alternative: for clients who opt into full service, the operator
   files the SS-4 by fax with a signed authorization; status tracked via the
   existing notes/audit trail.

### Not recommended
Scripted submission to SOSDirect or the IRS EIN Assistant (RPA). Both are
session-guarded, change without notice, and failures are silent. The current
operator-review model with pre-filled official PDFs is faster than RPA
maintenance and keeps a human check before anything is legally filed.

---

## Sequence at a glance

```mermaid
flowchart LR
  A[Eligibility quiz] --> B[Veteran intake]
  B --> C[TVC letter upload]
  C --> D[Create account]
  D --> E[Dashboard: case linked by email]
  E --> F[Operator verifies letter]
  F --> G[Forms 205/201/202 + 05-904 auto-filled]
  G --> H[Operator files with TX SOS]
  H --> I[Accepted]
  I --> J[EIN guided step + SS-4 pre-fill]
  J --> K[Launch services handoff]
```
