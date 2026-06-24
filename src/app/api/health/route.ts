import { NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  const results: Record<string, unknown> = {};

  try {
    const hasUnpooled = !!process.env.DATABASE_URL_UNPOOLED;
    const rawUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || 'none';
    const host = rawUrl.replace(/\/\/[^:]+:[^@]+@/, '//***:***@').split('?')[0];
    results.source = hasUnpooled ? 'UNPOOLED' : 'POOLED';
    results.host = host;
    results.hasUnpooled = hasUnpooled;
    results.hasPooled = !!process.env.DATABASE_URL;

    const userResult = await db.execute(sql`SELECT current_user`);
    results.currentUser = userResult[0]?.current_user;

    const sessionResult = await db.execute(sql`SELECT session_user`);
    results.sessionUser = sessionResult[0]?.session_user;

    const privResult = await db.execute(sql`
      SELECT has_table_privilege(current_user, 'tenants', 'SELECT') as can_select
    `);
    results.canSelectTenants = privResult[0]?.can_select;

    const rlsResult = await db.execute(sql`
      SELECT relrowsecurity, relforcerowsecurity
      FROM pg_class WHERE relname = 'tenants'
    `);
    results.rlsEnabled = rlsResult[0]?.relrowsecurity;
    results.rlsForced = rlsResult[0]?.relforcerowsecurity;

    const tenantResult = await db.execute(sql`SELECT id, name FROM tenants LIMIT 1`);
    results.tenantsAccessible = true;
    results.tenantCount = tenantResult.length;

    // Check which columns exist in the tenants table
    const colResult = await db.execute(sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'tenants'
      ORDER BY ordinal_position
    `);
    results.tenantColumns = colResult.map((r: any) => r.column_name);

    // Test Drizzle ORM query with WHERE (no auth dependency)
    const drizzleResult = await db
      .select({ id: schema.tenants.id, name: schema.tenants.name })
      .from(schema.tenants)
      .where(eq(schema.tenants.ownerId, '00000000-0000-0000-0000-000000000000'));
    results.drizzleTest = { ok: true, rowCount: drizzleResult.length };
  } catch (err: any) {
    results.error = err.message;
    results.errorCode = err.code;
    results.errorDetail = err.detail;
    results.errorHint = err.hint;
    results.errorSeverity = err.severity;
  }

  return NextResponse.json(results, {
    status: results.error ? 500 : 200,
  });
}
