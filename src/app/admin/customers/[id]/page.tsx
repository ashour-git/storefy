import { and, desc, eq } from 'drizzle-orm';
import { withTenant } from '../../../../db';
import * as schema from '../../../../db/schema';
import { getOwnedStore } from '../../../../lib/admin/store-access';

type CustomerDetailPageProps = { params: Promise<{ id: string }> };

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { id } = await params;
  const { session, store } = await getOwnedStore();
  if (!session) return null;
  if (!store) return <div className="admin-page"><div className="admin-empty-state"><h1>No Store Found</h1></div></div>;
  const data = await withTenant(store.id, async (tx) => {
    const customer = await tx.query.customers.findFirst({ where: and(eq(schema.customers.id, id), eq(schema.customers.tenantId, store.id)) });
    const orders = await tx.select().from(schema.orders).where(and(eq(schema.orders.customerId, id), eq(schema.orders.tenantId, store.id))).orderBy(desc(schema.orders.createdAt));
    return { customer, orders };
  }).catch(() => ({ customer: null, orders: [] }));

  if (!data.customer) return <div className="admin-page"><div className="admin-empty-state"><h1>Customer not found</h1><a className="btn-secondary" href="/admin/customers">Back to customers</a></div></div>;
  const total = data.orders.reduce((sum: number, order: any) => sum + Number(order.grandTotal || 0), 0);
  return (
    <div className="admin-page">
      <div className="admin-page-header"><div><h1 className="admin-page-title">{data.customer.name || 'Customer profile'}</h1><p className="admin-page-subtitle">{data.customer.email || 'No email'} · {data.customer.phone || 'No phone'}</p></div></div>
      <div className="admin-stats-grid"><div className="admin-stat-card"><div className="admin-stat-value">{data.orders.length}</div><div className="admin-stat-label">Orders</div></div><div className="admin-stat-card"><div className="admin-stat-value">{Math.round(total).toLocaleString()} EGP</div><div className="admin-stat-label">Lifetime value</div></div></div>
      <div className="admin-table-wrapper"><table className="admin-table"><thead><tr><th>Order</th><th>Status</th><th>Total</th><th>Date</th></tr></thead><tbody>{data.orders.map((order: any) => <tr key={order.id}><td><a className="admin-mono" href={`/admin/orders/${order.id}`}>{order.id.slice(0, 8)}</a></td><td>{order.status}</td><td>{order.grandTotal} {order.currency}</td><td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}</td></tr>)}</tbody></table></div>
    </div>
  );
}
