import { auth } from '../../../../../lib/auth';
import { headers } from 'next/headers';
import { db, withTenant } from '../../../../../db';
import * as schema from '../../../../../db/schema';
import { eq, and } from 'drizzle-orm';
import { getErrorMessage } from '../../../../../lib/errors';

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const stores = await db.select().from(schema.tenants).where(eq(schema.tenants.ownerId, session.user.id));
    const store = stores[0];
    if (!store) return Response.json({ error: 'No store found' }, { status: 404 });

    const { id } = await context.params;

    await withTenant(store.id, async (tx) => {
      await tx.delete(schema.aiConversations)
        .where(and(eq(schema.aiConversations.id, id), eq(schema.aiConversations.tenantId, store.id)));
    });

    return Response.json({ success: true });
  } catch (error: unknown) {
    return Response.json({ error: getErrorMessage(error), details: getErrorMessage(error) }, { status: 500 });
  }
}
