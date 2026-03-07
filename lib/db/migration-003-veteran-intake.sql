-- =============================================================
-- Migration 003: Veteran Filing Intake Fields
-- Run AFTER base schema (schema.sql) and ops schema (schema-ops.sql).
-- =============================================================

-- Make legacy fields optional (new veteran form does not use them)
ALTER TABLE intake_submissions ALTER COLUMN business_stage DROP NOT NULL;
ALTER TABLE intake_submissions ALTER COLUMN service_needed DROP NOT NULL;

-- Veteran / eligibility fields
ALTER TABLE intake_submissions ADD COLUMN IF NOT EXISTS veteran_status            boolean;
ALTER TABLE intake_submissions ADD COLUMN IF NOT EXISTS vvl_status               text
  CHECK (vvl_status IN ('have_vvl', 'applied', 'not_started'));

-- Business formation fields
ALTER TABLE intake_submissions ADD COLUMN IF NOT EXISTS business_name            text;
ALTER TABLE intake_submissions ADD COLUMN IF NOT EXISTS entity_type              text DEFAULT 'llc';
ALTER TABLE intake_submissions ADD COLUMN IF NOT EXISTS business_purpose         text;
ALTER TABLE intake_submissions ADD COLUMN IF NOT EXISTS principal_address        text;
ALTER TABLE intake_submissions ADD COLUMN IF NOT EXISTS mailing_address          text;
ALTER TABLE intake_submissions ADD COLUMN IF NOT EXISTS texas_confirmed          boolean;
ALTER TABLE intake_submissions ADD COLUMN IF NOT EXISTS launch_timeline          text;

-- Ownership / structure fields
ALTER TABLE intake_submissions ADD COLUMN IF NOT EXISTS all_owners_veterans      boolean;
ALTER TABLE intake_submissions ADD COLUMN IF NOT EXISTS fully_veteran_owned      boolean;
ALTER TABLE intake_submissions ADD COLUMN IF NOT EXISTS owner_details            jsonb;
ALTER TABLE intake_submissions ADD COLUMN IF NOT EXISTS organizer_name           text;
ALTER TABLE intake_submissions ADD COLUMN IF NOT EXISTS organizer_title          text;
ALTER TABLE intake_submissions ADD COLUMN IF NOT EXISTS registered_agent_preference text;
ALTER TABLE intake_submissions ADD COLUMN IF NOT EXISTS operator_review_confirmed boolean DEFAULT false;

-- Eligibility context (raw quiz answers for operator reference)
ALTER TABLE intake_submissions ADD COLUMN IF NOT EXISTS eligibility_answers      jsonb;
