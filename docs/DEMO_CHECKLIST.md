# Demo Checklist — Hutchrok Solutions Group

Use this checklist for quick demos and QA walkthroughs. Estimated time: **5 minutes**.

## Prerequisites

- [ ] App running locally (`npm run dev`) or deployed to Vercel
- [ ] Supabase project configured (tables + storage bucket created)
- [ ] Environment variables set (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `ADMIN_TOKEN`)

## 1. Public Site Walkthrough (~1 min)

- [ ] Visit `/` — verify hero, services overview, and navigation render correctly
- [ ] Click through to `/services`, `/formation-filings`, `/credit-enablement`
- [ ] Visit `/veteran-owned` and `/mission` to confirm brand pages load
- [ ] Footer links and navbar are consistent across all pages

## 2. Intake Submission (~1 min)

- [ ] Navigate to `/contact`
- [ ] Submit the intake form with valid data:
  - Full Name: `Demo User`
  - Email: `demo@example.com`
  - Phone: `(555) 000-1234`
  - Business Stage: any
  - Service Needed: any
  - Message: (optional)
- [ ] Verify success confirmation appears with a case number (e.g., `HSG-2026-0001`)
- [ ] **Note the case number** for the next steps

## 3. Validation Check (~30 sec)

- [ ] Submit the form with empty required fields — verify field-level errors appear
- [ ] Submit with an invalid email — verify "valid email" error appears
- [ ] Rapidly submit 6+ times — verify rate-limit error appears

## 4. Admin Console (~1.5 min)

- [ ] Visit `/admin?token=YOUR_ADMIN_TOKEN`
- [ ] Verify the case list loads with the submission from step 2
- [ ] Use the status filter dropdown to filter by `NEW` — verify it works
- [ ] Click on the case row to open `/admin/cases/[id]?token=...`

## 5. Case Detail & Editing (~1 min)

- [ ] On the case detail page, verify intake info displays correctly
- [ ] Update the status to `IN_REVIEW` — save — verify it persists
- [ ] Add a note (e.g., "Demo test note") — save — verify it persists
- [ ] Set a due date — save — verify it persists
- [ ] Set `assigned_to` — save — verify it persists

## 6. Document Upload (~1 min)

- [ ] On the case detail page, scroll to the Documents section
- [ ] Upload a PDF or image file (< 10 MB)
- [ ] Verify the file appears in the documents list with filename, size, and date
- [ ] Click the download link — verify a signed URL opens the file
- [ ] Delete the document — verify it is removed from the list

## Post-Demo Verification

- [ ] Check Supabase dashboard: `intake_submissions` table has the new row
- [ ] Check Supabase dashboard: `filing_cases` table has the new case
- [ ] Check Supabase Storage: `case-documents` bucket reflects upload/delete actions
- [ ] No PII visible in server console logs (only error codes and messages)

## Common Issues

| Symptom | Fix |
| --- | --- |
| "Unauthorized" on admin pages | Check `ADMIN_TOKEN` env var matches `?token=` query param |
| Intake 500 error | Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set correctly |
| Upload fails | Ensure `case-documents` storage bucket exists and is set to **private** |
| Signed URL returns 400 | Check that storage policies allow authenticated reads via signed URLs |
