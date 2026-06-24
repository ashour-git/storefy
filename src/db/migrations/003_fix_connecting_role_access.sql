-- Fix: Ensure the connecting role (neondb_owner) has access to all tables
-- The app connects as neondb_owner via DATABASE_URL, not app_user.
-- 001_rls.sql REVOKE FROM public broke access for neondb_owner through PgBouncer.
-- 002_fix_rls_grants.sql only re-granted to app_user.

-- Disable RLS on platform-level tables (should never have RLS)
ALTER TABLE IF EXISTS tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS platform_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS verifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tenant_members DISABLE ROW LEVEL SECURITY;

-- Grant full access to the connecting role and app_user on ALL tables
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('GRANT ALL ON %I TO neondb_owner', r.tablename);
    EXECUTE format('GRANT ALL ON %I TO app_user', r.tablename);
  END LOOP;
END
$$;

-- Grant usage on all sequences
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT sequencename
    FROM pg_sequences
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('GRANT USAGE ON SEQUENCE %I TO neondb_owner', r.sequencename);
    EXECUTE format('GRANT USAGE ON SEQUENCE %I TO app_user', r.sequencename);
  END LOOP;
END
$$;

-- Grant schema usage
GRANT USAGE ON SCHEMA public TO neondb_owner;
GRANT USAGE ON SCHEMA public TO app_user;
