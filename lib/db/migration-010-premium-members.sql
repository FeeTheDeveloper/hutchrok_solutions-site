-- Premium/VVL member workspace.
-- Requires SUPABASE_SECRET_KEY for server-side access; no anon policies are granted.
create table if not exists premium_members (
  id                uuid primary key default gen_random_uuid(),
  clerk_user_id     text not null unique,
  member_code       text not null unique,
  legal_name        text not null,
  display_name      text not null,
  membership_tier   text not null default 'Premium' check (membership_tier = 'Premium'),
  vvl_enabled       boolean not null default false,
  account_status    text not null default 'ACTIVE' check (account_status in ('PENDING','ACTIVE','SUSPENDED')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table if not exists member_businesses (
  id                           uuid primary key default gen_random_uuid(),
  clerk_user_id                text not null,
  legal_name                   text not null,
  entity_type                  text not null,
  formation_status             text not null default 'Rostered',
  ein_status                   text not null default 'Pending document',
  veteran_certification_status text not null default 'Not Started',
  storage_reference            text,
  created_at                   timestamptz not null default now(),
  updated_at                   timestamptz not null default now(),
  unique (clerk_user_id, legal_name)
);

create table if not exists member_business_submissions (
  id                           uuid primary key default gen_random_uuid(),
  clerk_user_id                text not null,
  member_code                  text not null,
  legal_name                   text not null,
  entity_type                  text not null,
  formation_state              text not null,
  ownership_role               text not null,
  business_address             text not null,
  formation_status             text not null,
  ein_status                   text not null,
  veteran_certification_status text not null,
  notes                        text not null default '',
  review_status                text not null default 'MEMBER_SUBMITTED_REVIEW_REQUIRED'
    check (review_status in ('MEMBER_SUBMITTED_REVIEW_REQUIRED','IN_REVIEW','APPROVED','NEEDS_INFORMATION','REJECTED')),
  created_at                   timestamptz not null default now(),
  updated_at                   timestamptz not null default now()
);

create index if not exists idx_member_businesses_owner on member_businesses(clerk_user_id);
create index if not exists idx_member_business_submissions_owner on member_business_submissions(clerk_user_id, created_at desc);
create unique index if not exists idx_member_business_submissions_unique_name
  on member_business_submissions(clerk_user_id, lower(legal_name));

drop trigger if exists set_premium_members_updated_at on premium_members;
create trigger set_premium_members_updated_at before update on premium_members
  for each row execute function update_updated_at_column();
drop trigger if exists set_member_businesses_updated_at on member_businesses;
create trigger set_member_businesses_updated_at before update on member_businesses
  for each row execute function update_updated_at_column();
drop trigger if exists set_member_business_submissions_updated_at on member_business_submissions;
create trigger set_member_business_submissions_updated_at before update on member_business_submissions
  for each row execute function update_updated_at_column();

alter table premium_members enable row level security;
alter table member_businesses enable row level security;
alter table member_business_submissions enable row level security;

-- Intentionally no anon/authenticated policies. All access is through server routes
-- using SUPABASE_SECRET_KEY after Clerk session and member-code authorization.
