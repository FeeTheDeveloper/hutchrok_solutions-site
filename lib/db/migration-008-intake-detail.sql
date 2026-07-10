-- =============================================================
-- Migration 008: Structured intake detail (JSONB)
-- Run AFTER all previous migrations.
-- =============================================================
-- Adds a flexible JSON column to intake_submissions used by intakes that
-- carry structured, form-specific answers (e.g. gov-housing consulting).
-- The existing filing_cases trigger/flow is unchanged.

ALTER TABLE intake_submissions
  ADD COLUMN IF NOT EXISTS intake_detail jsonb;
