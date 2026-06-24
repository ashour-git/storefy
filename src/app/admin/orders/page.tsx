import { auth } from '../../../lib/auth';
import { headers } from 'next/headers';
import { db, withTenant } from '../../../db';
import * as schema from '../../../db/schema';
import { eq, desc } from 'drizzle-orm';
import { IconCart, IconScroll } from '../../../components/IconLibrary';

export default async function OrdersPage() {
  let session;
  try {
    session = await auth.api.getSession({ headers: await headers() });
  } catch (e) {
    console.error('[orders/page] Session check failed:', e);
    return <div className="admin-page"><div className="admin-empty-state"><h1 className="admin-empty-title">Session Error</h1><p className="admin-empty-desc">Could not verify your session.</p><a href="/" className="btn-primary" style={{ marginTop: 16 }}>Go Home</a></div></div>;
  }
  if (!session) return null;

  let store;
  try {
    const userStores = await db.select().from(schema.tenants).where(eq(schema.tenants.ownerId, session.user.id));
    store = userStores[0];
  } catch (e) {
    console.error('[orders/page] Failed to fetch stores:', e);
    return <div className="admin-page"><div className="admin-empty-state"><h1 className="admin-empty-title">Database Error</h1><p className="admin-empty-desc">Could not load your stores.</p><a href="/" className="btn-primary" style={{ marginTop: 16 }}>Go Home</a></div></div>;
  }

  if (!store) {
    return (
      <div className="admin-page">
        <div className="admin-empty-state">
          <div className="admin-empty-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24' }}>
            <IconCart size={48} />
          </div>
          <h1 className="admin-empty-title">No Store Found</h1>
          <p className="admin-empty-desc">Create a store first to manage orders.</p>
          <a href="/admin/stores/new" className="btn-primary" style={{ marginTop: 16 }}>Create Store →</a>
        </div>
      </div>
    );
  }

  let orders: any[] = [];
  try {
    orders = await withTenant(store.id, async (tx) => {
      return tx.select().from(schema.orders).orderBy(desc(schema.orders.createdAt));
    });
  } catch {
    // DB may not be available
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Orders</h1>
          <p className="admin-page-subtitle">{orders.length} order{orders.length !== 1 ? "s" : ""} in {store.name}</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="admin-empty-state">
          <div className="admin-empty-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            <IconScroll size={48} />
          </div>
          <h2 className="admin-empty-title">No Orders Yet</h2>
          <p className="admin-empty-desc">
            When customers place orders on your storefront, they&apos;ll appear here.
          </p>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Channel</th>
                <th>Status</th>
                <th>Fulfillment</th>
                <th>Subtotal</th>
                <th>Discount</th>
                <th>Total</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td><a className="admin-mono" href={`/admin/orders/${order.id}`}>{order.id.slice(0, 8)}...</a></td>
                  <td><span className={`admin-badge admin-badge-${order.channel}`}>{order.channel}</span></td>
                  <td><span className={`admin-badge admin-badge-${order.status}`}>{order.status}</span></td>
                  <td><span className="admin-badge">{order.fulfillmentStatus || 'unfulfilled'}</span></td>
                  <td>{order.subtotal} {order.currency}</td>
                  <td>{order.discountTotal || "0.00"} {order.currency}</td>
                  <td className="admin-bold">{order.grandTotal} {order.currency}</td>
                  <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
