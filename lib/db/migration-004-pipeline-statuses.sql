-- =============================================================
-- Migration 004: Update filing_cases status pipeline
-- Replaces 6-status model with 9-status veteran filing pipeline.
-- Run this in the Supabase SQL Editor.
-- =============================================================

-- 1. Drop the old check constraint
ALTER TABLE filing_cases DROP CONSTRAINT IF EXISTS filing_cases_status_check;

-- 2. Migrate existing rows to new status values
UPDATE filing_cases SET status = 'LEAD'              WHERE status = 'NEW';
UPDATE filing_cases SET status = 'IN_REVIEW'         WHERE status = 'IN_REVIEW';
UPDATE filing_cases SET status = 'ELIGIBILITY_PENDING' WHERE status = 'NEEDS_INFO';
UPDATE filing_cases SET status = 'READY_FOR_FILING'  WHERE status = 'IN_PROGRESS';
UPDATE filing_cases SET status = 'SUBMITTED'         WHERE status = 'FILED';
-- COMPLETED stays COMPLETED

-- 3. Add new check constraint with 9-status pipeline
ALTER TABLE filing_cases ADD CONSTRAINT filing_cases_status_check
  CHECK (status IN (
    'LEAD',
    'ELIGIBILITY_PENDING',
    'VVL_PENDING',
    'READY_FOR_INTAKE',
    'IN_REVIEW',
    'READY_FOR_FILING',
    'SUBMITTED',
    'ACCEPTED',
    'COMPLETED'
  ));

-- 4. Update default
ALTER TABLE filing_cases ALTER COLUMN status SET DEFAULT 'LEAD';
