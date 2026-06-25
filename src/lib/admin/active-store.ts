import { cookies } from 'next/headers';
import { db } from '../../db';
import * as schema from '../../db/schema';
import { eq, and } from 'drizzle-orm';

export const ACTIVE_STORE_COOKIE = 'sf-active-store';

export async function getActiveStore(userId: string) {
  const userStores = await db.select().from(schema.tenants).where(eq(schema.tenants.ownerId, userId));
  if (userStores.length === 0) return null;

  try {
    const cookieStore = await cookies();
    const activeId = cookieStore.get(ACTIVE_STORE_COOKIE)?.value;
    if (activeId) {
      const match = userStores.find(s => s.id === activeId);
      if (match) return match;
    }
  } catch {}

  return userStores[0];
}

export async function getActiveStoreWithAll(userId: string) {
  const userStores = await db.select().from(schema.tenants).where(eq(schema.tenants.ownerId, userId));
  if (userStores.length === 0) return { store: null, allStores: [] as typeof userStores };

  try {
    const cookieStore = await cookies();
    const activeId = cookieStore.get(ACTIVE_STORE_COOKIE)?.value;
    if (activeId) {
      const match = userStores.find(s => s.id === activeId);
      if (match) return { store: match, allStores: userStores };
    }
  } catch {}

  return { store: userStores[0], allStores: userStores };
}

export async function getActiveStoreFromRequest(request: Request, userId: string) {
  let storeId = request.headers.get('x-store-id');

  if (!storeId) {
    const cookieHeader = request.headers.get('cookie') || '';
    const match = cookieHeader.match(new RegExp(`(?:^|;)\\s*${ACTIVE_STORE_COOKIE}=([^;]+)`));
    if (match) storeId = match[1];
  }

  if (storeId) {
    const store = await db.query.tenants.findFirst({
      where: and(eq(schema.tenants.id, storeId), eq(schema.tenants.ownerId, userId)),
    });
    if (store) return store;
  }

  return getActiveStore(userId);
}
