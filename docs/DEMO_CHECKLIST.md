# Demo Checklist — Hutchrok Solutions Group

Use this checklist for quick demos and QA walkthroughs. Estimated time: **8 minutes**.

## Prerequisites

- [ ] App running locally (`npm run dev`) or deployed to Cloudflare Pages
- [ ] Supabase project configured (tables via `lib/db/schema.sql` + `schema-ops.sql`, storage bucket `case-documents`)
- [ ] Environment variables set: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `ADMIN_TOKEN` (see `.env.example`)
- [ ] Optional: `OPS_TOKEN` and `OPS_WEBHOOK_URL` for ops integration

## 1. Public Site Walkthrough (~1 min)

- [ ] Visit `/` — verify hero, services overview, and navigation render correctly
- [ ] Click through to `/services`, `/formation-filings`, `/credit-enablement`
- [ ] Visit `/veteran-owned` and `/mission` to confirm brand pages load
- [ ] Visit `/free-filing` — verify hero has "Start My Filing" and "Check My Eligibility" CTAs
- [ ] Footer links and navbar are consistent across all pages

## 2. Eligibility Quiz (~1 min)

- [ ] Navigate to `/eligibility`
- [ ] Complete the quiz selecting: veteran = yes, honorable discharge, Texas, 51%+ ownership
- [ ] Verify "You Qualify" result with links to verification help and free filing info
- [ ] Restart and select non-qualifying answers — verify "not-qualified" result with services CTA
- [ ] Confirm quiz answers are stored in localStorage for intake pre-population

## 3. Veteran Intake Submission (~1.5 min)

- [ ] Navigate to `/contact`
- [ ] Complete the 4-step veteran intake form:
  - **Step 1** — Contact: Name, email, phone, veteran status, VVL status
  - **Step 2** — Business: LLC name, entity type, purpose, principal address, Texas confirmed
  - **Step 3** — Ownership: Organizer name, all owners veterans, 51%+ owned, registered agent, owner list
  - **Step 4** — Review: Confirm operator review checkbox, submit
- [ ] Verify success screen shows case number (e.g., `HSG-2026-1234`) and VVL upload status
- [ ] **Note the case number** for admin steps

## 4. Legacy Intake (~30 sec)

- [ ] Navigate to `/contact` without prior eligibility quiz data
- [ ] Submit with basic fields (name, email, phone, business stage, service, message)
- [ ] Verify success confirmation with case number

## 5. Validation & Rate Limiting (~30 sec)

- [ ] Submit form with empty required fields — verify field-level errors appear
- [ ] Submit with an invalid email — verify "valid email" error appears
- [ ] Rapidly submit 6+ times in 60 seconds — verify rate-limit error appears

## 6. Admin Dashboard (~1 min)

- [ ] Visit `/admin?token=YOUR_ADMIN_TOKEN`
- [ ] Verify pipeline summary cards: Needs Action / In Progress / Closed counts
- [ ] Click status filter buttons (LEAD, VVL_PENDING, IN_REVIEW, etc.) — verify list filters
- [ ] Verify case cards show VVL status indicator, intake badge, veteran badge
- [ ] Click a case card to open `/admin/cases/[id]?token=...`

## 7. Case Detail & Pipeline (~1.5 min)

- [ ] Verify pipeline progress bar (9 stages: Lead → … → Completed)
- [ ] Check blocking alerts (orange card for missing VVL or incomplete intake)
- [ ] Use Quick Actions to advance status (e.g., "Mark VVL Received" → "Mark Intake Complete")
- [ ] Verify applicant info, business details, ownership, and filing sections display correctly
- [ ] Add an internal note — save — verify it persists
- [ ] Set assigned_to and due_date — save — verify they persist

## 8. Document Upload (~1 min)

- [ ] Scroll to Documents section
- [ ] Upload a PDF or image file (< 10 MB)
- [ ] Verify the file appears with filename, size, and date
- [ ] Click download — verify signed URL opens the file
- [ ] Delete the document — verify it is removed
- [ ] Try uploading a non-PDF/JPG/PNG file — verify rejection

## 9. Launch Services Handoff (~30 sec)

- [ ] On a case with status ACCEPTED or COMPLETED, verify the Handoff section appears
- [ ] Check/uncheck service interest checkboxes
- [ ] Set recommended next service and toggle "launch-ready"
- [ ] Add handoff notes — save — verify all persist

## Post-Demo Verification

- [ ] Check Supabase dashboard: `intake_submissions` table has the new row
- [ ] Check Supabase dashboard: `filing_cases` table has the new case with correct status
- [ ] Check Supabase Storage: `case-documents` bucket reflects upload/delete actions
- [ ] No PII visible in server console logs (only error codes and messages)

## Common Issues

| Symptom | Fix |
| --- | --- |
| "Unauthorized" on admin pages | Check `ADMIN_TOKEN` env var matches `?token=` query param |
| Intake 500 error | Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set correctly |
| Upload fails | Ensure `case-documents` storage bucket exists and is set to **private** |
| Signed URL returns 400 | Check that storage policies allow authenticated reads via signed URLs |
| Middleware blocks admin | `ADMIN_TOKEN` must be set in both env and Cloudflare Pages settings |
| Upload claims invalid type | Magic bytes validation enforces PDF/JPG/PNG — file content must match extension |
