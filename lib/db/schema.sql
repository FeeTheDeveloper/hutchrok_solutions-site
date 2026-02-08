-- =============================================================
-- Hutchrok Solutions Group — Play 03 Schema
-- Run this in the Supabase SQL Editor to create the tables.
-- =============================================================

-- 1) intake_submissions
create table if not exists intake_submissions (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null,
  email       text not null,
  phone       text not null,
  business_stage text not null,
  service_needed text not null,
  message     text
);

-- 2) filing_cases
create table if not exists filing_cases (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  intake_id   uuid not null references intake_submissions(id) on delete cascade,
  case_number text not null unique,
  status      text not null default 'NEW'
                check (status in ('NEW','IN_REVIEW','NEEDS_INFO','IN_PROGRESS','FILED','COMPLETED')),
  assigned_to text,
  due_date    date,
  notes       text
);

-- Index for common queries
create index if not exists idx_filing_cases_status on filing_cases(status);
create index if not exists idx_filing_cases_intake on filing_cases(intake_id);

-- Auto-update updated_at on filing_cases
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
  for each row
  execute function update_updated_at_column();

-- Enable Row Level Security (policies can be added later)
alter table intake_submissions enable row level security;
alter table filing_cases enable row level security;

-- Permissive policy so the anon key can read/write (tighten later with auth)
create policy "Allow all for anon" on intake_submissions
  for all using (true) with check (true);

create policy "Allow all for anon" on filing_cases
  for all using (true) with check (true);

-- 3) case_documents (Play 03B)
create table if not exists case_documents (
  id            uuid primary key default gen_random_uuid(),
  case_id       uuid not null references filing_cases(id) on delete cascade,
  filename      text not null,
  mime          text not null,
  size          int not null,
  storage_path  text not null,
  uploaded_at   timestamptz not null default now()
);

create index if not exists idx_case_documents_case on case_documents(case_id);

alter table case_documents enable row level security;

create policy "Allow all for anon" on case_documents
  for all using (true) with check (true);

-- Storage bucket (run via Supabase Dashboard or SQL):
-- insert into storage.buckets (id, name, public)
--   values ('case-documents', 'case-documents', false)
--   on conflict do nothing;
