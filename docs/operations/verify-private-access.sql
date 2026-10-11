-- Read-only metadata check. Expected: 10,10,10,10,true,0,0,true,true.
select
 count(*) as application_tables,
 count(*) filter (where not has_table_privilege('anon',c.oid,'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER') and not has_any_column_privilege('anon',c.oid,'SELECT,INSERT,UPDATE,REFERENCES')) as anon_denied,
 count(*) filter (where not has_table_privilege('authenticated',c.oid,'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER') and not has_any_column_privilege('authenticated',c.oid,'SELECT,INSERT,UPDATE,REFERENCES')) as authenticated_denied,
 count(*) filter (where has_table_privilege('service_role',c.oid,'SELECT') and has_table_privilege('service_role',c.oid,'INSERT') and has_table_privilege('service_role',c.oid,'UPDATE') and has_table_privilege('service_role',c.oid,'DELETE')) as server_access_preserved,
 bool_and(c.relrowsecurity) as all_rls_enabled,
 (select count(*) from pg_policies where schemaname='public') as public_table_policies,
 (select count(*) from pg_policies where schemaname='storage' and tablename='objects') as storage_object_policies,
 (select not public from storage.buckets where id='case-documents') as documents_bucket_private,
 (select rolbypassrls from pg_roles where rolname='service_role') as service_role_bypasses_rls
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relkind='r';

-- Run each transaction separately in the dashboard to see its result.
-- These count object visibility without retrieving names or contents.
begin;
set local role anon;
select current_user as checked_role, count(*) as visible_document_objects
from storage.objects where bucket_id='case-documents';
rollback;

begin;
set local role authenticated;
select current_user as checked_role, count(*) as visible_document_objects
from storage.objects where bucket_id='case-documents';
rollback;
