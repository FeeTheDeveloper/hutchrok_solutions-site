-- =============================================================
-- Hutchrok Solutions Group — COMPLETE one-shot database setup
-- =============================================================
-- Run this ONCE in the Supabase SQL Editor on a fresh project.
-- It is idempotent (safe to re-run) and consolidates schema.sql +
-- all migrations (003–007) + ops schema + the storage bucket.
-- =============================================================

-- 1) intake_submissions ---------------------------------------
create table if not exists intake_submissions (
  id                          uuid primary key default gen_random_uuid(),
  created_at                  timestamptz not null default now(),
  name                        text not null,
  email                       text not null,
  phone                       text not null,
  message                     text,
  business_stage              text,
  service_needed              text,
  veteran_status              boolean,
  vvl_status                  text check (vvl_status in ('have_vvl','applied','not_started')),
  business_name               text,
  entity_type                 text default 'llc',
  business_purpose            text,
  principal_address           text,
  mailing_address             text,
  texas_confirmed             boolean,
  launch_timeline             text,
  all_owners_veterans         boolean,
  fully_veteran_owned         boolean,
  owner_details               jsonb,
  organizer_name              text,
  organizer_title             text,
  registered_agent_preference text,
  operator_review_confirmed   boolean default false,
  eligibility_answers         jsonb,
  -- migration 007 (intake expansion)
  dba_name                    text,
  nonprofit_purpose           text,
  branch_of_service           text,
  years_of_service            integer,
  -- migration 008 (structured detail for form-specific intakes)
  intake_detail               jsonb
);

-- 2) filing_cases ---------------------------------------------
create table if not exists filing_cases (
  id                    uuid primary key default gen_random_uuid(),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  intake_id             uuid not null references intake_submissions(id) on delete cascade,
  case_number           text not null unique,
  status                text not null default 'LEAD'
                          check (status in ('LEAD','ELIGIBILITY_PENDING','VVL_PENDING','READY_FOR_INTAKE','IN_REVIEW','READY_FOR_FILING','SUBMITTED','ACCEPTED','COMPLETED')),
  assigned_to           text,
  due_date              date,
  notes                 text,
  sharepoint_folder_url text,
  ms_list_item_id       text,
  ops_synced_at         timestamptz,
  handoff_data          jsonb
);

create index if not exists idx_filing_cases_status on filing_cases(status);
create index if not exists idx_filing_cases_intake on filing_cases(intake_id);

create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on filing_cases;
create trigger set_updated_at
  before update on filing_cases
  for each row execute function update_updated_at_column();

-- 3) case_documents -------------------------------------------
create table if not exists case_documents (
  id                 uuid primary key default gen_random_uuid(),
  case_id            uuid not null references filing_cases(id) on delete cascade,
  filename           text not null,
  mime               text not null,
  size               int not null,
  storage_path       text not null,
  uploaded_at        timestamptz not null default now(),
  sharepoint_item_id text
);

create index if not exists idx_case_documents_case on case_documents(case_id);

-- 4) audit_log (migration 006) --------------------------------
create table if not exists audit_log (
  id         uuid primary key default gen_random_uuid(),
  case_id    uuid not null references filing_cases(id) on delete cascade,
  action     text not null,
  actor      text not null default 'operator',
  old_value  text,
  new_value  text,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_log_case on audit_log(case_id);
create index if not exists idx_audit_log_created on audit_log(created_at);

-- 5) Row Level Security + permissive anon policies ------------
-- (API routes enforce auth; tighten these later if desired.)
alter table intake_submissions enable row level security;
alter table filing_cases       enable row level security;
alter table case_documents     enable row level security;
alter table audit_log          enable row level security;

drop policy if exists "Allow all for anon" on intake_submissions;
drop policy if exists "Allow all for anon" on filing_cases;
drop policy if exists "Allow all for anon" on case_documents;
drop policy if exists "Allow all for anon" on audit_log;

create policy "Allow all for anon" on intake_submissions for all using (true) with check (true);
create policy "Allow all for anon" on filing_cases       for all using (true) with check (true);
create policy "Allow all for anon" on case_documents     for all using (true) with check (true);
create policy "Allow all for anon" on audit_log          for all using (true) with check (true);

-- 6) Private storage bucket for case documents ----------------
insert into storage.buckets (id, name, public)
  values ('case-documents', 'case-documents', false)
  on conflict (id) do nothing;
