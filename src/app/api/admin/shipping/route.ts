import { withTenant } from '../../../../db';
import * as schema from '../../../../db/schema';
import { getOwnedStore } from '../../../../lib/admin/store-access';
import { getErrorMessage } from '../../../../lib/errors';
import { sanitizeShippingZone } from '../../../../lib/launch-os';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    const { session, store } = await getOwnedStore();
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!store) return Response.json({ zones: [] });
    const zones = await withTenant(store.id, (tx) => tx.select().from(schema.shippingZones).orderBy(desc(schema.shippingZones.createdAt)));
    return Response.json({ zones });
  } catch (e) {
    console.error('[api/admin/shipping] GET failed:', e);
    return Response.json({ error: 'Failed to fetch shipping zones', details: getErrorMessage(e) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { session, store } = await getOwnedStore();
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!store) return Response.json({ error: 'No store found' }, { status: 404 });
    const zone = sanitizeShippingZone(await request.json());
    const [created] = await withTenant(store.id, (tx) => tx.insert(schema.shippingZones).values({ tenantId: store.id, ...zone }).returning());
    return Response.json({ zone: created }, { status: 201 });
  } catch (error) {
    return Response.json({ error: getErrorMessage(error) }, { status: 400 });
  }
}
