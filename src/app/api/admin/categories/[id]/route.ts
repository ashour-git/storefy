import { and, eq } from 'drizzle-orm';
import { withTenant } from '../../../../../db';
import * as schema from '../../../../../db/schema';
import { getOwnedStore } from '../../../../../lib/admin/store-access';
import { getErrorMessage } from '../../../../../lib/errors';
import { sanitizeCategoryInput } from '../../../../../lib/launch-os';

type RouteContext = { params: Promise<{ id: string }> | { id: string } };

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { session, store } = await getOwnedStore();
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!store) return Response.json({ error: 'No store found' }, { status: 404 });
    const category = sanitizeCategoryInput(await request.json());
    const [updated] = await withTenant(store.id, (tx) => tx.update(schema.categories).set(category).where(and(eq(schema.categories.id, id), eq(schema.categories.tenantId, store.id))).returning());
    if (!updated) return Response.json({ error: 'Collection not found' }, { status: 404 });
    return Response.json({ category: updated });
  } catch (error) {
    return Response.json({ error: getErrorMessage(error) }, { status: 400 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const { session, store } = await getOwnedStore();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  if (!store) return Response.json({ error: 'No store found' }, { status: 404 });
  await withTenant(store.id, (tx) => tx.delete(schema.categories).where(and(eq(schema.categories.id, id), eq(schema.categories.tenantId, store.id))));
  return Response.json({ ok: true });
}
