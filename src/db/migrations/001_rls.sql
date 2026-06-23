-- ============================================================
-- Phase 0.2: Row-Level Security (RLS) for multi-tenant isolation
-- ============================================================
-- Run this migration BEFORE deploying the app to production.
-- The app must connect as `app_user` (not the migration owner).

-- Create the restricted application role
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_user') THEN
    CREATE ROLE app_user LOGIN PASSWORD 'CHANGE_ME_IN_PRODUCTION';
  END IF;
END
$$;

-- ============================================================
-- PLATFORM-LEVEL TABLES (no RLS needed — shared across tenants)
-- ============================================================
-- platform_users, sessions, accounts, verifications — accessed by auth system
-- tenant_members — accessed by auth system, scoped by user membership

-- ============================================================
-- STORE-LEVEL TABLES — apply RLS policy template
-- ============================================================

-- Helper: create RLS policy for a table that has tenant_id
CREATE OR REPLACE FUNCTION enable_tenant_isolation(table_name text)
RETURNS void AS $$
BEGIN
  EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
  EXECUTE format(
    'CREATE POLICY tenant_isolation ON %I
     USING (tenant_id = current_setting(''app.tenant_id'')::uuid)
     WITH CHECK (tenant_id = current_setting(''app.tenant_id'')::uuid)',
    table_name
  );
  EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON %I TO app_user', table_name);
END;
$$ LANGUAGE plpgsql;

-- Apply to all tenant-scoped tables
SELECT enable_tenant_isolation('categories');
SELECT enable_tenant_isolation('products');
SELECT enable_tenant_isolation('product_variants');
SELECT enable_tenant_isolation('media');
SELECT enable_tenant_isolation('customers');
SELECT enable_tenant_isolation('discounts');
SELECT enable_tenant_isolation('shipping_zones');
SELECT enable_tenant_isolation('product_reviews');
SELECT enable_tenant_isolation('orders');
SELECT enable_tenant_isolation('order_items');
SELECT enable_tenant_isolation('order_events');
SELECT enable_tenant_isolation('payments');
SELECT enable_tenant_isolation('storefront_events');
SELECT enable_tenant_isolation('themes');
SELECT enable_tenant_isolation('pages');
SELECT enable_tenant_isolation('knowledge_chunks');
SELECT enable_tenant_isolation('ai_conversations');
SELECT enable_tenant_isolation('ai_agent_logs');
SELECT enable_tenant_isolation('audit_log');
SELECT enable_tenant_isolation('carts');

-- Revoke broad access; policies will re-grant per-tenant
REVOKE SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public FROM public;
REVOKE SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public FROM anon;

-- Cleanup the helper function
DROP FUNCTION enable_tenant_isolation;

-- Grant usage on sequences to app_user (needed for INSERT with default random IDs)
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

-- ============================================================
-- TENANT MEMBERS — custom policy (user can only see their own memberships)
-- ============================================================
ALTER TABLE tenant_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_members_user_isolation ON tenant_members
  USING (user_id = current_setting('app.user_id', true)::uuid);

GRANT SELECT, INSERT, UPDATE, DELETE ON tenant_members TO app_user;
