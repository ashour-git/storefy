import { auth } from '../../../../../lib/auth';
import { headers } from 'next/headers';
import { db } from '../../../../../db';
import * as schema from '../../../../../db/schema';
import { eq } from 'drizzle-orm';
import { rebuildTenantKnowledge } from '../../../../../lib/ai/knowledge';
import { getErrorMessage } from '../../../../../lib/errors';

export async function POST() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const stores = await db.select().from(schema.tenants).where(eq(schema.tenants.ownerId, session.user.id));
    const store = stores[0];
    if (!store) return Response.json({ error: 'No store found' }, { status: 404 });

    const chunks = await rebuildTenantKnowledge(store.id);
    return Response.json({ success: true, chunks });
  } catch (error: unknown) {
    return Response.json({ error: 'Failed to rebuild AI knowledge', details: getErrorMessage(error) }, { status: 500 });
  }
}
