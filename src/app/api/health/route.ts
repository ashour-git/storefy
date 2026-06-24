import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

export async function GET() {
  const results: Record<string, unknown> = {};

  try {
    // Check which URL is configured (masked)
    const rawUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || 'none';
    const urlHost = rawUrl.replace(/\/\/[^:]+:[^@]+@/, '//***:***@').split('?')[0];
    results.databaseUrl = urlHost;
    results.hasUnpooled = !!process.env.DATABASE_URL_UNPOOLED;

    // Check current_user
    const userResult = await db.execute(sql`SELECT current_user`);
    results.currentUser = userResult[0]?.current_user;

    // Check session_user
    const sessionResult = await db.execute(sql`SELECT session_user`);
    results.sessionUser = sessionResult[0]?.session_user;

    // Check if neondb_owner can access tenants
    const privResult = await db.execute(sql`
      SELECT has_table_privilege(current_user, 'tenants', 'SELECT') as can_select
    `);
    results.canSelectTenants = privResult[0]?.can_select;

    // Check RLS on tenants
    const rlsResult = await db.execute(sql`
      SELECT relrowsecurity, relforcerowsecurity
      FROM pg_class WHERE relname = 'tenants'
    `);
    results.rlsEnabled = rlsResult[0]?.relrowsecurity;
    results.rlsForced = rlsResult[0]?.relforcerowsecurity;

    // Try actual query
    const tenantResult = await db.execute(sql`
      SELECT id, name FROM tenants LIMIT 1
    `);
    results.tenantsAccessible = true;
    results.tenantCount = tenantResult.length;

    // Check if channel_binding param was stripped
    const hasChannelBinding = (process.env.DATABASE_URL || '').includes('channel_binding');
    results.channelBindingInUrl = hasChannelBinding;
  } catch (err: any) {
    results.error = err.message;
    results.errorCode = err.code;
    results.errorDetail = err.detail;
  }

  return NextResponse.json(results, {
    status: results.error ? 500 : 200,
  });
}
