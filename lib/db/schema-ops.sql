-- =============================================================
-- Microsoft 365 Ops Integration — Schema Additions
-- Run this in the Supabase SQL Editor AFTER the base schema.
-- =============================================================

-- Add SharePoint / M365 columns to filing_cases
alter table filing_cases
  add column if not exists sharepoint_folder_url text,
  add column if not exists ms_list_item_id       text,
  add column if not exists ops_synced_at          timestamptz;

-- Add optional SharePoint metadata to case_documents
alter table case_documents
  add column if not exists sharepoint_item_id text;
