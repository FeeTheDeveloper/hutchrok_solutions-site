-- =============================================================
-- Migration 010: Client account profiles + Stripe linkage
-- Run AFTER migration-009-client-accounts.sql.
-- =============================================================

CREATE TABLE IF NOT EXISTS client_profiles (
  id                     uuid primary key default gen_random_uuid(),
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  clerk_user_id          text not null unique,
  email                  text not null,
  personal_info          jsonb not null default '{}'::jsonb,
  business_info          jsonb not null default '{}'::jsonb,
  stripe_customer_id     text,
  stripe_last_checkout_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_client_profiles_email
  ON client_profiles(email);

CREATE INDEX IF NOT EXISTS idx_client_profiles_stripe_customer
  ON client_profiles(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

DROP TRIGGER IF EXISTS set_client_profiles_updated_at ON client_profiles;
CREATE TRIGGER set_client_profiles_updated_at
  BEFORE UPDATE ON client_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for anon" ON client_profiles;
CREATE POLICY "Allow all for anon" ON client_profiles
  FOR ALL USING (true) WITH CHECK (true);
