-- =============================================================
-- Migration 009: Client account linkage (Clerk)
-- Run AFTER all previous migrations.
-- =============================================================
-- Links filing cases to authenticated client accounts so the dashboard
-- can show a user's own filings automatically. A case is "claimed" the
-- first time a signed-in user's verified email matches the intake email.

ALTER TABLE filing_cases
  ADD COLUMN IF NOT EXISTS clerk_user_id text,
  ADD COLUMN IF NOT EXISTS claimed_at    timestamptz;

CREATE INDEX IF NOT EXISTS idx_filing_cases_clerk_user
  ON filing_cases(clerk_user_id)
  WHERE clerk_user_id IS NOT NULL;
