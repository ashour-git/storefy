import { asc } from 'drizzle-orm';
import { withTenant } from '../../../../db';
import * as schema from '../../../../db/schema';
import { getOwnedStore } from '../../../../lib/admin/store-access';
import { getErrorMessage } from '../../../../lib/errors';
import { sanitizeCategoryInput } from '../../../../lib/launch-os';

export async function GET() {
  const { session, store } = await getOwnedStore();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  if (!store) return Response.json({ categories: [] });
  const categories = await withTenant(store.id, (tx) => tx.select().from(schema.categories).orderBy(asc(schema.categories.sortOrder), asc(schema.categories.name)));
  return Response.json({ categories });
}

export async function POST(request: Request) {
  try {
    const { session, store } = await getOwnedStore();
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!store) return Response.json({ error: 'No store found' }, { status: 404 });
    const category = sanitizeCategoryInput(await request.json());
    const [created] = await withTenant(store.id, (tx) => tx.insert(schema.categories).values({ tenantId: store.id, ...category }).returning());
    return Response.json({ category: created }, { status: 201 });
  } catch (error) {
    return Response.json({ error: getErrorMessage(error) }, { status: 400 });
  }
}
