import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import * as schema from './schema';

// Prefer direct connection (DATABASE_URL_UNPOOLED) over pooler (DATABASE_URL).
// Neon's pooler (DATABASE_URL with -pooler suffix) uses channel_binding=require
// which PgBouncer doesn't support, causing silent connection failures.
// Direct connections still get Neon's server-side pooling on the compute side.
const connectionString =
  process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!connectionString) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'DATABASE_URL or DATABASE_URL_UNPOOLED environment variable is required in production',
    );
  }
  console.warn('⚠️ No database URL set. Database operations will fail.');
}

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
