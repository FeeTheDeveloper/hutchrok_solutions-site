-- =============================================================
-- Migration 005 — Handoff data for launch services
-- Run AFTER previous migrations.
-- =============================================================

-- Add handoff_data column (JSONB) to filing_cases
-- Stores: servicesInterested[], recommendedService, launchReady, handoffNotes
alter table filing_cases
  add column if not exists handoff_data jsonb;
