-- Fix: Re-grant app_user access to ALL tables after REVOKE
-- The 001_rls.sql REVOKE removed access from 'public' role, which broke
-- any connection that relied on public-schema grants (including auth tables
-- like sessions, accounts, platform_users, and the tenants table itself).

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON %I TO app_user', r.tablename);
  END LOOP;
END
$$;

-- Also grant USAGE on all sequences
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT sequencename
    FROM pg_sequences
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('GRANT USAGE ON SEQUENCE %I TO app_user', r.sequencename);
  END LOOP;
END
$$;
