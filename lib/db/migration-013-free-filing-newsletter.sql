-- Migration 013: one free veteran filing per account + newsletter contacts.
--
-- free_filing_entitlements
--   One row per Clerk account (unique clerk_user_id) AND per email
--   (unique lower(email)) so a veteran cannot farm free filings by opening
--   extra accounts. Lifecycle:
--     PENDING_VERIFICATION -> VERIFIED (ops confirms VVL/TVC eligibility)
--     VERIFIED -> REDEEMED (member claims; ops links the filing case)
--     any -> REVOKED (ops only, with reason)
--
-- newsletter_contacts
--   Marketing contacts and leads. Consent is recorded explicitly; rows with
--   status UNSUBSCRIBED must never be emailed. unsubscribe_token supports
--   one-click unsubscribe links.

create table if not exists free_filing_entitlements (
  id                uuid primary key default gen_random_uuid(),
  clerk_user_id     text not null unique,
  email             text not null,
  status            text not null default 'PENDING_VERIFICATION'
    check (status in ('PENDING_VERIFICATION','VERIFIED','REDEEMED','REVOKED')),
  verified_at       timestamptz,
  verified_by       text,
  verification_note text,
  redeemed_at       timestamptz,
  filing_case_id    uuid,
  revoked_reason    text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create unique index if not exists uq_free_filing_entitlements_email
  on free_filing_entitlements (lower(email));

create table if not exists newsletter_contacts (
  id                uuid primary key default gen_random_uuid(),
  email             text not null,
  name              text,
  phone             text,
  business_name     text,
  source            text not null default 'newsletter',
  tags              text[] not null default '{}',
  interests         text[] not null default '{}',
  is_veteran        boolean,
  status            text not null default 'SUBSCRIBED'
    check (status in ('SUBSCRIBED','UNSUBSCRIBED','LEAD_ONLY')),
  consent_at        timestamptz,
  consent_source    text,
  unsubscribe_token uuid not null default gen_random_uuid(),
  unsubscribed_at   timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create unique index if not exists uq_newsletter_contacts_email
  on newsletter_contacts (lower(email));
create unique index if not exists uq_newsletter_contacts_unsub_token
  on newsletter_contacts (unsubscribe_token);
create index if not exists idx_newsletter_contacts_status
  on newsletter_contacts (status);

-- Service-role only. No anon/authenticated policies: all access goes through
-- server API routes that enforce Clerk identity or the admin token.
alter table free_filing_entitlements enable row level security;
alter table newsletter_contacts enable row level security;
