import { cookies, headers } from 'next/headers';
import { auth } from '../auth';
import { db } from '../../db';
import * as schema from '../../db/schema';
import { eq, and, ne } from 'drizzle-orm';

export const ACTIVE_STORE_COOKIE = 'sf-active-store';

export interface StoreResolution {
  session: { user: { id: string } } | null;
  store: typeof schema.tenants.$inferSelect | null;
}

/**
 * Resolve the active store for a user.
 * Handles auth check + store lookup in one call.
 */
export async function resolveStore(request?: Request): Promise<StoreResolution> {
  try {
    const session = await auth.api.getSession({
      headers: request ? await headers() : await headers(),
    });
    if (!session) return { session: null, store: null };

    const userId = session.user.id;

    // If request provided, try x-store-id header or cookie first
    if (request) {
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
        if (store) return { session, store };
      }
    }

    // Fall back to cookie-based resolution
    let userStores: typeof schema.tenants.$inferSelect[] = [];
    try {
      userStores = await db.select().from(schema.tenants).where(and(eq(schema.tenants.ownerId, userId), ne(schema.tenants.status, 'deleted')));
    } catch (e) {
      console.error('[resolve-store] DB query failed:', e);
      return { session, store: null };
    }
    if (userStores.length === 0) return { session, store: null };

    try {
      const cookieStore = await cookies();
      const activeId = cookieStore.get(ACTIVE_STORE_COOKIE)?.value;
      if (activeId) {
        const match = userStores.find(s => s.id === activeId);
        if (match) return { session, store: match };
      }
    } catch {}

    return { session, store: userStores[0] };
  } catch (e) {
    console.error('[resolve-store] Failed:', e);
    return { session: null, store: null };
  }
}

/**
 * Get all stores for the current user (for store switcher).
 */
export async function resolveAllStores(): Promise<{ session: StoreResolution['session']; stores: typeof schema.tenants.$inferSelect[] }> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { session: null, stores: [] };

    const userStores = await db.select().from(schema.tenants).where(
      and(eq(schema.tenants.ownerId, session.user.id), ne(schema.tenants.status, 'deleted'))
    );
    return { session, stores: userStores };
  } catch (e) {
    console.error('[resolve-all-stores] Failed:', e);
    return { session: null, stores: [] };
  }
}

/**
 * Switch the active store (sets cookie).
 */
export async function switchStore(storeId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_STORE_COOKIE, storeId, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });
}
