-- =============================================================
-- Migration 007: Expand intake_submissions with optional fields
-- Run AFTER all previous migrations.
-- =============================================================

ALTER TABLE intake_submissions ADD COLUMN IF NOT EXISTS dba_name           text;
ALTER TABLE intake_submissions ADD COLUMN IF NOT EXISTS nonprofit_purpose  text;
ALTER TABLE intake_submissions ADD COLUMN IF NOT EXISTS branch_of_service  text;
ALTER TABLE intake_submissions ADD COLUMN IF NOT EXISTS years_of_service   integer;
