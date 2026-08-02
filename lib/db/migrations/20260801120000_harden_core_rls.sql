-- REVIEW ONLY: DO NOT APPLY TO PRODUCTION WITHOUT PREVIEW REGRESSION TESTS
-- Requires every Next.js database/storage operation to use SUPABASE_SECRET_KEY.
begin;

drop policy if exists "Allow all for anon" on public.intake_submissions;
drop policy if exists "Allow all for anon" on public.filing_cases;
drop policy if exists "Allow all for anon" on public.case_documents;
drop policy if exists "Allow all for anon" on public.audit_log;
drop policy if exists "Allow all for anon" on public.client_profiles;

revoke all on table public.intake_submissions from public, anon, authenticated;
revoke all on table public.filing_cases from public, anon, authenticated;
revoke all on table public.case_documents from public, anon, authenticated;
revoke all on table public.audit_log from public, anon, authenticated;
revoke all on table public.client_profiles from public, anon, authenticated;

grant all on table public.intake_submissions to service_role;
grant all on table public.filing_cases to service_role;
grant all on table public.case_documents to service_role;
grant all on table public.client_profiles to service_role;

-- Append-only application audit ledger: trusted server processes may read and
-- append, but not rewrite or delete history through the Data API.
revoke all on table public.audit_log from service_role;
grant select, insert on table public.audit_log to service_role;

drop policy if exists "Allow anon insert on case-documents" on storage.objects;
drop policy if exists "Allow anon select on case-documents" on storage.objects;
drop policy if exists "Allow anon delete on case-documents" on storage.objects;

-- Storage API requests made with the secret/service key bypass RLS. No anon or
-- authenticated object policy is intentionally recreated.

commit;
