-- Hutchrok production project: igiuifkvunrnmgamyzqw
-- Requires the deployed server-only service-key client from commit 562d8ef.
-- Permission changes only. No client records or stored objects are modified.
-- Review the saved permission preimage before execution.
begin;
set local lock_timeout = '5s';
set local statement_timeout = '30s';

do $repair$
declare
  target text;
  principal text;
  private_tables text[] := array['intake_submissions','filing_cases','case_documents','audit_log','client_profiles','premium_members','member_businesses','member_business_submissions'];
begin
  foreach target in array private_tables loop
    if not (
      has_table_privilege('service_role', format('public.%I', target), 'SELECT') and
      has_table_privilege('service_role', format('public.%I', target), 'INSERT') and
      has_table_privilege('service_role', format('public.%I', target), 'UPDATE') and
      has_table_privilege('service_role', format('public.%I', target), 'DELETE')
    ) then
      raise exception 'Missing existing service access on %', target;
    end if;
  end loop;

  if exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = any(private_tables)
      and not (policyname = 'Allow all for anon' and cmd = 'ALL'
        and qual = 'true' and with_check = 'true')
  ) then
    raise exception 'Unexpected private-table policy; inspect before proceeding';
  end if;

  if not exists (select 1 from storage.buckets where id = 'case-documents' and not public) then
    raise exception 'Expected private case-documents bucket not found';
  end if;

  if exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects'
      and policyname not in (
        'Allow anon select on case-documents',
        'Allow anon insert on case-documents',
        'Allow anon delete on case-documents')
  ) then
    raise exception 'Unexpected storage policy; inspect before proceeding';
  end if;

  foreach target in array private_tables loop
    execute format('alter table public.%I enable row level security', target);
    execute format('revoke all privileges on table public.%I from anon, authenticated, public', target);
    execute format('drop policy if exists "Allow all for anon" on public.%I', target);
  end loop;

  foreach target in array private_tables loop
    foreach principal in array array['anon','authenticated'] loop
      if has_table_privilege(principal, format('public.%I', target),
           'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER')
        or has_any_column_privilege(principal, format('public.%I', target),
           'SELECT,INSERT,UPDATE,REFERENCES') then
        raise exception 'Residual access for % on %', principal, target;
      end if;
    end loop;
  end loop;
end
$repair$;

-- Preserve shared Storage grants and the private bucket. Existing service_role
-- access and signed URLs remain; only the three verified public policies go.
drop policy if exists "Allow anon select on case-documents" on storage.objects;
drop policy if exists "Allow anon insert on case-documents" on storage.objects;
drop policy if exists "Allow anon delete on case-documents" on storage.objects;

-- New application tables created by postgres require explicitly reviewed grants.
-- Managed supabase_admin defaults are unchanged.
alter default privileges for role postgres in schema public
  revoke all privileges on tables from anon, authenticated, public;

commit;
