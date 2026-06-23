import { and, eq, sql } from 'drizzle-orm';
import { withTenant } from '../../../../../db';
import * as schema from '../../../../../db/schema';
import { getOwnedStore } from '../../../../../lib/admin/store-access';
import { getErrorMessage } from '../../../../../lib/errors';

type RouteContext = { params: Promise<{ id: string }> | { id: string } };
const orderStatuses = ['pending', 'paid', 'fulfilled', 'cancelled', 'refunded'] as const;
const fulfillmentStatuses = ['unfulfilled', 'packed', 'shipped', 'delivered', 'returned'] as const;
type OrderStatus = typeof orderStatuses[number];
type FulfillmentStatus = typeof fulfillmentStatuses[number];

function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === 'string' && (orderStatuses as readonly string[]).includes(value);
}

function isFulfillmentStatus(value: unknown): value is FulfillmentStatus {
  return typeof value === 'string' && (fulfillmentStatuses as readonly string[]).includes(value);
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { session, store } = await getOwnedStore();
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!store) return Response.json({ error: 'No store found' }, { status: 404 });
    const body = await request.json() as { status?: string; fulfillmentStatus?: string; trackingNumber?: string; internalNotes?: string; note?: string };
    const status = isOrderStatus(body.status) ? body.status : undefined;
    const fulfillmentStatus = isFulfillmentStatus(body.fulfillmentStatus) ? body.fulfillmentStatus : undefined;

    const result = await withTenant(store.id, async (tx) => {
      const existing = await tx.query.orders.findFirst({ where: and(eq(schema.orders.id, id), eq(schema.orders.tenantId, store.id)) });
      if (!existing) return null;

      const [updated] = await tx.update(schema.orders).set({
        status: status || existing.status,
        fulfillmentStatus: fulfillmentStatus || existing.fulfillmentStatus,
        trackingNumber: typeof body.trackingNumber === 'string' ? body.trackingNumber.trim().slice(0, 120) || null : existing.trackingNumber,
        internalNotes: typeof body.internalNotes === 'string' ? body.internalNotes.trim().slice(0, 2000) || null : existing.internalNotes,
      }).where(and(eq(schema.orders.id, id), eq(schema.orders.tenantId, store.id))).returning();

      await tx.insert(schema.orderEvents).values({
        tenantId: store.id,
        orderId: id,
        type: status && status !== existing.status ? 'status_changed' : fulfillmentStatus && fulfillmentStatus !== existing.fulfillmentStatus ? 'fulfilled' : 'note',
        fromStatus: existing.status,
        toStatus: status || existing.status,
        note: typeof body.note === 'string' ? body.note.trim().slice(0, 1000) || null : null,
        metadata: { fulfillmentStatus: fulfillmentStatus || existing.fulfillmentStatus, trackingNumber: body.trackingNumber || null },
      });

      const newStatus = status || existing.status;
      const wasPaid = existing.status === 'paid' || existing.status === 'fulfilled';
      const isCancelled = newStatus === 'cancelled' || newStatus === 'refunded';

      if (wasPaid && isCancelled) {
        const items = await tx.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, id));
        for (const item of items) {
          await tx.update(schema.productVariants)
            .set({ stockQty: sql`${schema.productVariants.stockQty} + ${item.quantity}` })
            .where(eq(schema.productVariants.id, item.variantId));
        }
      }

      return updated;
    });

    if (!result) return Response.json({ error: 'Order not found' }, { status: 404 });
    return Response.json({ order: result });
  } catch (error) {
    return Response.json({ error: getErrorMessage(error) }, { status: 400 });
  }
}
