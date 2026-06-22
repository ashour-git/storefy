import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('DATABASE_URL environment variable is required in production');
  }
  console.warn('⚠️ DATABASE_URL not set. Database operations will fail.');
}

// Runtime database client connects as the restricted app_user role
const client = postgres(connectionString || '', { max: 10 });
export const db = drizzle(client, { schema });

/**
 * Execute database queries scoped to a specific tenant ID.
 * This runs inside a SQL transaction where the app.tenant_id setting is set locally,
 * triggering the PostgreSQL Row Level Security (RLS) policies.
 */
export async function withTenant<T>(
  tenantId: string,
  callback: (tx: typeof db) => Promise<T>
): Promise<T> {
  return db.transaction(async (tx) => {
    // Set the local tenant ID for the current transaction using set_config
    await tx.execute(sql`SELECT set_config('app.tenant_id', ${tenantId}, true)`);
    return callback(tx as any);
  });
}
