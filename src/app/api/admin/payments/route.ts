import { and, eq } from 'drizzle-orm';
import { db } from '../../../../db';
import * as schema from '../../../../db/schema';
import { getOwnedStore } from '../../../../lib/admin/store-access';
import { getErrorMessage } from '../../../../lib/errors';

export async function PUT(request: Request) {
  try {
    const { session, store } = await getOwnedStore();
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!store) return Response.json({ error: 'No store found' }, { status: 404 });
    const body = await request.json() as { sandboxReady?: boolean; integrationId?: string; iframeId?: string; checklist?: Record<string, boolean> };
    const settings = {
      sandboxReady: Boolean(body.sandboxReady),
      integrationId: typeof body.integrationId === 'string' ? body.integrationId.trim().slice(0, 80) : '',
      iframeId: typeof body.iframeId === 'string' ? body.iframeId.trim().slice(0, 80) : '',
      checklist: body.checklist && typeof body.checklist === 'object' ? body.checklist : {},
      updatedAt: new Date().toISOString(),
    };
    const [updated] = await db.update(schema.tenants).set({ paymobSettings: settings }).where(and(eq(schema.tenants.id, store.id), eq(schema.tenants.ownerId, session.user.id))).returning();
    return Response.json({ store: updated });
  } catch (error) {
    return Response.json({ error: getErrorMessage(error) }, { status: 400 });
  }
}
