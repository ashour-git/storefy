import { and, desc, eq } from 'drizzle-orm';
import { withTenant } from '../../../../db';
import * as schema from '../../../../db/schema';
import { getOwnedStore } from '../../../../lib/admin/store-access';
import { OrderWorkflowForm } from '../../../../components/admin/OrderWorkflowForm';

type OrderDetailPageProps = { params: Promise<{ id: string }> };

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const { session, store } = await getOwnedStore();
  if (!session) return null;
  if (!store) return <div className="admin-page"><div className="admin-empty-state"><h1>No Store Found</h1></div></div>;

  const data = await withTenant(store.id, async (tx) => {
    const order = await tx.query.orders.findFirst({ where: and(eq(schema.orders.id, id), eq(schema.orders.tenantId, store.id)) });
    const events = await tx.select().from(schema.orderEvents).where(and(eq(schema.orderEvents.orderId, id), eq(schema.orderEvents.tenantId, store.id))).orderBy(desc(schema.orderEvents.createdAt));
    const items = await tx.select().from(schema.orderItems).where(and(eq(schema.orderItems.orderId, id), eq(schema.orderItems.tenantId, store.id)));
    const customer = order?.customerId ? await tx.query.customers.findFirst({ where: eq(schema.customers.id, order.customerId) }) : null;
    return { order, events, items, customer };
  }).catch(() => ({ order: null, events: [], items: [], customer: null }));

  if (!data.order) return <div className="admin-page"><div className="admin-empty-state"><h1>Order not found</h1><a className="btn-secondary" href="/admin/orders">Back to orders</a></div></div>;

  return (
    <div className="admin-page">
      <div className="admin-page-header"><div><h1 className="admin-page-title">Order {data.order.id.slice(0, 8)}</h1><p className="admin-page-subtitle">{data.customer?.name || 'Customer'} · {data.order.grandTotal} {data.order.currency}</p></div><a href="/admin/orders" className="btn-secondary">Back</a></div>
      <div className="launch-two-column">
        <OrderWorkflowForm order={data.order} />
        <div className="admin-settings-card launch-panel">
          <h2 className="admin-settings-card-title">Timeline</h2>
          <div className="launch-timeline">
            <div><strong>Order created</strong><p className="admin-muted-text">{data.order.createdAt ? new Date(data.order.createdAt).toLocaleString() : ''}</p></div>
            {data.events.map((event: any) => <div key={event.id}><strong>{event.type.replace('_', ' ')}</strong><p className="admin-muted-text">{event.note || `${event.fromStatus || ''} -> ${event.toStatus || ''}`} · {event.createdAt ? new Date(event.createdAt).toLocaleString() : ''}</p></div>)}
          </div>
          <h3>Items</h3>
          {data.items.map((item: any) => <p key={item.id}>{item.quantity} x {item.unitPrice} EGP</p>)}
        </div>
      </div>
    </div>
  );
}
