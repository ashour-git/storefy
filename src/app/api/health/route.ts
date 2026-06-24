import { db } from '../../../db';
import { sql } from 'drizzle-orm';

export async function GET() {
  const results: Record<string, any> = {};

  // Test 1: Basic connectivity
  try {
    const [r] = await db.execute(sql`SELECT 1 as ok`);
    results.connectivity = 'ok';
  } catch (e: any) {
    results.connectivity = e?.message || String(e);
  }

  // Test 2: Can we query the tenants table?
  try {
    const [r] = await db.execute(sql`SELECT COUNT(*) as count FROM tenants`);
    results.tenants_table = `ok (count: ${r?.count ?? 'unknown'})`;
  } catch (e: any) {
    results.tenants_table = e?.message || String(e);
  }

  // Test 3: Current role
  try {
    const [r] = await db.execute(sql`SELECT current_user as role, current_database() as db`);
    results.current_role = r?.role;
    results.current_db = r?.db;
  } catch (e: any) {
    results.current_role = e?.message || String(e);
  }

  // Test 4: Check if RLS is enabled on tenants
  try {
    const [r] = await db.execute(sql`SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'tenants'`);
    results.tenants_rls = r?.relrowsecurity ? 'ENABLED' : 'disabled';
  } catch (e: any) {
    results.tenants_rls = e?.message || String(e);
  }

  // Test 5: Check app_user grants on tenants
  try {
    const [r] = await db.execute(sql`
      SELECT has_table_privilege('app_user', 'tenants', 'SELECT') as has_select
    `);
    results.app_user_tenants_select = r?.has_select ? 'YES' : 'NO';
  } catch (e: any) {
    results.app_user_tenants_select = e?.message || String(e);
  }

  return Response.json(results, { status: 200 });
}
