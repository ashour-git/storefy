import { auth } from '../../../../lib/auth';
import { headers } from 'next/headers';
import { db } from '../../../../db';
import * as schema from '../../../../db/schema';
import { eq, and } from 'drizzle-orm';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { storeId } = await request.json();
    if (!storeId || typeof storeId !== 'string') {
      return Response.json({ error: 'storeId is required' }, { status: 400 });
    }

    const store = await db.query.tenants.findFirst({
      where: and(eq(schema.tenants.id, storeId), eq(schema.tenants.ownerId, session.user.id)),
    });

    if (!store) return Response.json({ error: 'Store not found' }, { status: 404 });

    const cookieStore = await cookies();
    cookieStore.set('sf-active-store', storeId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });

    return Response.json({ success: true, store: { id: store.id, name: store.name, slug: store.slug } });
  } catch (e) {
    console.error('[stores/switch] Error:', e);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
