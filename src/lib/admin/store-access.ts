import { headers } from 'next/headers';
import { auth } from '../auth';
import { db } from '../../db';
import * as schema from '../../db/schema';
import { eq } from 'drizzle-orm';

export async function getOwnedStore() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { session: null, store: null };
  const stores = await db.select().from(schema.tenants).where(eq(schema.tenants.ownerId, session.user.id));
  return { session, store: stores[0] ?? null };
}
