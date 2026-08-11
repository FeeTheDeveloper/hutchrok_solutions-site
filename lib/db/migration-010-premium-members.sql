-- Premium/VVL member business-submission queue.
-- Requires SUPABASE_SECRET_KEY for server-side access; no anon policies are granted.
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
    check (review_status in (
      'MEMBER_SUBMITTED_REVIEW_REQUIRED',
      'IN_REVIEW',
      'APPROVED',
      'NEEDS_INFORMATION',
      'REJECTED'
    )),
  created_at                   timestamptz not null default now(),
  updated_at                   timestamptz not null default now()
);

create index if not exists idx_member_business_submissions_owner
  on member_business_submissions(clerk_user_id, created_at desc);

create unique index if not exists idx_member_business_submissions_unique_name
  on member_business_submissions(clerk_user_id, lower(legal_name));

drop trigger if exists set_member_business_submissions_updated_at
  on member_business_submissions;
create trigger set_member_business_submissions_updated_at
  before update on member_business_submissions
  for each row execute function update_updated_at_column();

alter table member_business_submissions enable row level security;

-- Intentionally no anon/authenticated policy. Access is through server routes using
-- SUPABASE_SECRET_KEY, after Clerk session and member-code authorization.
