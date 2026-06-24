import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import * as schema from './schema';

// Prefer direct connection (DATABASE_URL_UNPOOLED) over pooler (DATABASE_URL).
// Then strip channel_binding=require which postgres.js doesn't support and
// causes silent connection/query failures on Neon.
function resolveDatabaseUrl(): string {
  const raw =
    process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!raw) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'DATABASE_URL or DATABASE_URL_UNPOOLED environment variable is required in production',
      );
    }
    console.warn('⚠️ No database URL set. Database operations will fail.');
    return '';
  }
  // Remove channel_binding=require (not supported by postgres.js)
  return raw.replace(/[&?]channel_binding=require/, '').replace(/^([^?]*\?)$/, '$1');
}

const connectionString = resolveDatabaseUrl();

const globalForDb = globalThis as unknown as {
  client: postgres.Sql | undefined;
};

const client = globalForDb.client ?? postgres(connectionString || '', { max: 10 });
if (process.env.NODE_ENV !== 'production') globalForDb.client = client;

export const db = drizzle(client, { schema });

/**
 * Execute database queries scoped to a specific tenant ID.
 * This runs inside a SQL transaction where the app.tenant_id setting is set locally,
 * triggering the PostgreSQL Row Level Security (RLS) policies.
 */
export async function withTenant<T>(
  tenantId: string,
  callback: (tx: typeof db) => Promise<T>,
  userId?: string,
): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`SELECT set_config('app.tenant_id', ${tenantId}, true)`);
    if (userId) {
      await tx.execute(sql`SELECT set_config('app.user_id', ${userId}, true)`);
    }
    return callback(tx as any);
  });
}
