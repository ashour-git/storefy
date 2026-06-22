import { auth } from '../../lib/auth';
import { headers } from 'next/headers';
import { db, withTenant } from '../../db';
import * as schema from '../../db/schema';
import { eq, count, sql, desc } from 'drizzle-orm';
import { getStoreUrl } from '../../lib/store-utils';
import { IconPackage, IconCart, IconRevenue, IconStore, IconSettings, IconCheck } from '../../components/IconLibrary';
import { calculateLaunchScore } from '../../lib/admin/launch-score';
import { LaunchScoreCard } from '../../components/admin/LaunchScoreCard';

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
  const storeUrl = store ? getStoreUrl(store.slug, host, store.customDomain) : "";

  // If no store, show onboarding prompt
  if (!store) {
    return (
      <div className="admin-page">
        <div className="admin-empty-state">
          <div className="admin-empty-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
            <IconStore size={48} />
          </div>
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
  let activeProductCount = 0;
  let orderCount = 0;
  let totalRevenue = "0.00";
  let recentOrders: any[] = [];
  let hasTheme = false;
  let hasHomepage = false;
  let shippingZones = 0;
  let activeDiscounts = 0;
  let categories = 0;
  let approvedReviews = 0;
  let analyticsEvents = 0;

  try {
    const [prodResult] = await withTenant(store.id, async (tx) => {
      return tx.select({ count: count() }).from(schema.products);
    });
    productCount = prodResult?.count || 0;

    const [activeProdResult] = await withTenant(store.id, async (tx) => {
      return tx.select({ count: count() }).from(schema.products).where(eq(schema.products.status, 'active'));
    });
    activeProductCount = activeProdResult?.count || 0;

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

    const theme = await withTenant(store.id, async (tx) => tx.query.themes.findFirst({ where: eq(schema.themes.tenantId, store.id) }));
    const page = await withTenant(store.id, async (tx) => tx.query.pages.findFirst({ where: eq(schema.pages.tenantId, store.id) }));
    hasTheme = Boolean(theme);
    hasHomepage = Boolean(page);

    const [shippingResult] = await withTenant(store.id, async (tx) => tx.select({ count: count() }).from(schema.shippingZones).where(eq(schema.shippingZones.active, true)));
    const [discountResult] = await withTenant(store.id, async (tx) => tx.select({ count: count() }).from(schema.discounts));
    const [categoryResult] = await withTenant(store.id, async (tx) => tx.select({ count: count() }).from(schema.categories));
    const [reviewResult] = await withTenant(store.id, async (tx) => tx.select({ count: count() }).from(schema.productReviews).where(eq(schema.productReviews.status, 'approved')));
    const [eventResult] = await withTenant(store.id, async (tx) => tx.select({ count: count() }).from(schema.storefrontEvents));
    shippingZones = shippingResult?.count || 0;
    activeDiscounts = discountResult?.count || 0;
    categories = categoryResult?.count || 0;
    approvedReviews = reviewResult?.count || 0;
    analyticsEvents = eventResult?.count || 0;
  } catch {
    // DB may not be available in all environments
  }

  const stats = [
    { label: "Total Products", value: productCount.toString(), icon: <IconPackage size={24} style={{ color: '#818cf8' }} /> },
    { label: "Total Orders", value: orderCount.toString(), icon: <IconCart size={24} style={{ color: '#fbbf24' }} /> },
    { label: "Revenue", value: `${Number(totalRevenue).toLocaleString()} EGP`, icon: <IconRevenue size={24} style={{ color: '#34d399' }} /> },
    { label: "Store Status", value: store.status === "active" ? "Active" : store.status, icon: <IconCheck size={24} style={{ color: '#10b981' }} /> },
  ];

  const launch = calculateLaunchScore({
    activeProducts: activeProductCount,
    totalProducts: productCount,
    hasTheme,
    hasHomepage,
    locale: store.defaultLocale,
    currency: store.defaultCurrency,
    status: store.status,
    shippingZones,
    activeDiscounts,
    categories,
    hasPaymob: Boolean(process.env.PAYMOB_API_KEY),
    hasCod: shippingZones > 0,
    approvedReviews,
    analyticsEvents,
  });

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
            <div className="admin-stat-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{stat.icon}</div>
            <div className="admin-stat-value">{stat.value}</div>
            <div className="admin-stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <LaunchScoreCard score={launch.score} passed={launch.passed} total={launch.total} checks={launch.checks} />

      {/* Quick Actions */}
      <div className="admin-section">
        <h2 className="admin-section-title">Quick Actions</h2>
        <div className="admin-quick-actions">
          <a href="/admin/products" className="admin-action-card">
            <span className="admin-action-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
              <IconPackage size={24} />
            </span>
            <span className="admin-action-label">Manage Products</span>
          </a>
          <a href="/admin/orders" className="admin-action-card">
            <span className="admin-action-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24' }}>
              <IconCart size={24} />
            </span>
            <span className="admin-action-label">View Orders</span>
          </a>
          <a href="/admin/settings" className="admin-action-card">
            <span className="admin-action-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              <IconSettings size={24} />
            </span>
            <span className="admin-action-label">Store Settings</span>
          </a>
          <a href="/admin/shipping" className="admin-action-card">
            <span className="admin-action-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
              COD
            </span>
            <span className="admin-action-label">Setup Shipping</span>
          </a>
          <a href="/admin/discounts" className="admin-action-card">
            <span className="admin-action-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316' }}>
              %
            </span>
            <span className="admin-action-label">Launch Coupon</span>
          </a>
          <a href="/admin/ai" className="admin-action-card">
            <span className="admin-action-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa' }}>
              AI
            </span>
            <span className="admin-action-label">Train AI Agent</span>
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
