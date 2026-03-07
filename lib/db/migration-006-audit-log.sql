-- Migration 006: Audit log table
--
-- Lightweight audit trail for operator actions on filing cases.
-- Run this after all previous migrations.

CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES filing_cases(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  actor TEXT NOT NULL DEFAULT 'operator',
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_log_case ON audit_log(case_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at);

-- RLS: same pattern as other tables — API route auth controls access
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for anon" ON audit_log
  FOR ALL USING (true) WITH CHECK (true);

COMMENT ON TABLE audit_log IS 'Operator action audit trail for filing cases';
