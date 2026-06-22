import { desc } from 'drizzle-orm';
import { withTenant } from '../../../../db';
import * as schema from '../../../../db/schema';
import { getOwnedStore } from '../../../../lib/admin/store-access';
import { getErrorMessage } from '../../../../lib/errors';
import { sanitizeDiscount } from '../../../../lib/launch-os';

export async function GET() {
  const { session, store } = await getOwnedStore();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  if (!store) return Response.json({ discounts: [] });
  const discounts = await withTenant(store.id, (tx) => tx.select().from(schema.discounts).orderBy(desc(schema.discounts.startsAt)));
  return Response.json({ discounts });
}

export async function POST(request: Request) {
  try {
    const { session, store } = await getOwnedStore();
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!store) return Response.json({ error: 'No store found' }, { status: 404 });
    const discount = sanitizeDiscount(await request.json());
    const [created] = await withTenant(store.id, (tx) => tx.insert(schema.discounts).values({ tenantId: store.id, ...discount }).returning());
    return Response.json({ discount: created }, { status: 201 });
  } catch (error) {
    return Response.json({ error: getErrorMessage(error) }, { status: 400 });
  }
}
