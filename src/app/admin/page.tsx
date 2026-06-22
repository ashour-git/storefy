import { auth } from '../../lib/auth';
import { headers } from 'next/headers';
import { db, withTenant } from '../../db';
import * as schema from '../../db/schema';
import { eq, count, sql, desc } from 'drizzle-orm';
import { getStoreUrl } from '../../lib/store-utils';

export default async function AdminDashboard() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  // Get user's first store
  const userStores = await db
    .select()
    .from(schema.tenants)
    .where(eq(schema.tenants.ownerId, session.user.id));

  const store = userStores[0];

  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const storeUrl = store ? getStoreUrl(store.slug, host) : "";

  // If no store, show onboarding prompt
  if (!store) {
    return (
      <div className="admin-page">
        <div className="admin-empty-state">
          <div className="admin-empty-icon">🏪</div>
          <h1 className="admin-empty-title">Welcome to Storefy!</h1>
          <p className="admin-empty-desc">
            You haven&apos;t created a store yet. Let&apos;s get you started — it takes less than 60 seconds.
          </p>
          <a href="/admin/stores/new" className="btn-primary" style={{ marginTop: 16 }}>
            Create Your First Store →
          </a>
        </div>
      </div>
    );
  }

  // Fetch stats for this store
  let productCount = 0;
  let orderCount = 0;
  let totalRevenue = "0.00";
  let recentOrders: any[] = [];

  try {
    const [prodResult] = await withTenant(store.id, async (tx) => {
      return tx.select({ count: count() }).from(schema.products);
    });
    productCount = prodResult?.count || 0;

    const [orderResult] = await withTenant(store.id, async (tx) => {
      return tx.select({ count: count() }).from(schema.orders);
    });
    orderCount = orderResult?.count || 0;

    const [revResult] = await withTenant(store.id, async (tx) => {
      return tx.select({ total: sql<string>`COALESCE(SUM(grand_total), 0)` }).from(schema.orders);
    });
    totalRevenue = revResult?.total || "0.00";

    recentOrders = await withTenant(store.id, async (tx) => {
      return tx.select().from(schema.orders).orderBy(desc(schema.orders.createdAt)).limit(5);
    });
  } catch {
    // DB may not be available in all environments
  }

  const stats = [
    { label: "Total Products", value: productCount.toString(), icon: "📦" },
    { label: "Total Orders", value: orderCount.toString(), icon: "🛒" },
    { label: "Revenue", value: `${Number(totalRevenue).toLocaleString()} EGP`, icon: "💰" },
    { label: "Store Status", value: store.status === "active" ? "Active" : store.status, icon: "✅" },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">{store.name}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 6 }}>
            <a
              href={storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="admin-page-subtitle"
              style={{ 
                color: "var(--accent-primary)", 
                textDecoration: "underline", 
                fontWeight: 600, 
                display: "inline-flex", 
                alignItems: "center", 
                gap: 4 
              }}
            >
              <span>{storeUrl.replace("http://", "").replace("https://", "")}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>·</span>
            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{store.category || "General"}</span>
            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>·</span>
            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{store.defaultCurrency}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="admin-stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="admin-stat-card">
            <div className="admin-stat-icon">{stat.icon}</div>
            <div className="admin-stat-value">{stat.value}</div>
            <div className="admin-stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="admin-section">
        <h2 className="admin-section-title">Quick Actions</h2>
        <div className="admin-quick-actions">
          <a href="/admin/products" className="admin-action-card">
            <span className="admin-action-icon">📦</span>
            <span className="admin-action-label">Manage Products</span>
          </a>
          <a href="/admin/orders" className="admin-action-card">
            <span className="admin-action-icon">🛒</span>
            <span className="admin-action-label">View Orders</span>
          </a>
          <a href="/admin/settings" className="admin-action-card">
            <span className="admin-action-icon">⚙️</span>
            <span className="admin-action-label">Store Settings</span>
          </a>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="admin-section">
        <h2 className="admin-section-title">Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <p className="admin-muted-text">No orders yet. Share your store to start receiving orders!</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Channel</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="admin-mono">{order.id.slice(0, 8)}…</td>
                    <td>
                      <span className={`admin-badge admin-badge-${order.channel}`}>
                        {order.channel}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-badge admin-badge-${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{order.grandTotal} {order.currency}</td>
                    <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
