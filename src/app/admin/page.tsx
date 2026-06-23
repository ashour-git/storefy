import { auth } from '../../lib/auth';
import { headers } from 'next/headers';
import { db, withTenant } from '../../db';
import * as schema from '../../db/schema';
import { eq, count, sql, desc, gte } from 'drizzle-orm';
import { getStoreUrl } from '../../lib/store-utils';
import { IconPackage, IconCart, IconRevenue, IconStore, IconSettings, IconCheck, IconUsers } from '../../components/IconLibrary';
import { calculateLaunchScore } from '../../lib/admin/launch-score';
import { LaunchScoreCard } from '../../components/admin/LaunchScoreCard';

export default async function AdminDashboard() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const userStores = await db
    .select()
    .from(schema.tenants)
    .where(eq(schema.tenants.ownerId, session.user.id));

  const store = userStores[0];

  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const storeUrl = store ? getStoreUrl(store.slug, host, store.customDomain) : "";

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
  let customerCount = 0;
  let pendingOrders = 0;
  let fulfilledOrders = 0;
  let avgOrderValue = "0";
  let topProducts: any[] = [];
  let revenueLast7Days: { date: string; total: number }[] = [];
  let recentCustomers: any[] = [];

  try {
    // Combine all stats queries into a single transaction
    const stats = await withTenant(store.id, async (tx) => {
      const [prodResult] = await tx.select({ count: count() }).from(schema.products);
      const [activeProdResult] = await tx.select({ count: count() }).from(schema.products).where(eq(schema.products.status, 'active'));
      const [orderResult] = await tx.select({ count: count() }).from(schema.orders);
      const [revResult] = await tx.select({ total: sql<string>`COALESCE(SUM(grand_total), 0)` }).from(schema.orders);
      const [avgResult] = await tx.select({ avg: sql<string>`COALESCE(AVG(grand_total), 0)` }).from(schema.orders);
      const [pendingResult] = await tx.select({ count: count() }).from(schema.orders).where(eq(schema.orders.status, 'pending'));
      const [fulfilledResult] = await tx.select({ count: count() }).from(schema.orders).where(eq(schema.orders.fulfillmentStatus, 'delivered'));
      const [custResult] = await tx.select({ count: count() }).from(schema.customers);
      return {
        productCount: prodResult?.count || 0,
        activeProductCount: activeProdResult?.count || 0,
        orderCount: orderResult?.count || 0,
        totalRevenue: revResult?.total || "0.00",
        avgOrderValue: avgResult?.avg || "0",
        pendingOrders: pendingResult?.count || 0,
        fulfilledOrders: fulfilledResult?.count || 0,
        customerCount: custResult?.count || 0,
      };
    });
    productCount = stats.productCount;
    activeProductCount = stats.activeProductCount;
    orderCount = stats.orderCount;
    totalRevenue = stats.totalRevenue;
    avgOrderValue = stats.avgOrderValue;
    pendingOrders = stats.pendingOrders;
    fulfilledOrders = stats.fulfilledOrders;
    customerCount = stats.customerCount;

    // Second transaction for list data
    const lists = await withTenant(store.id, async (tx) => {
      const orders = await tx.select().from(schema.orders).orderBy(desc(schema.orders.createdAt)).limit(5);
      const products = await tx.select({
        id: schema.products.id,
        name: schema.products.name,
        status: schema.products.status,
        basePrice: schema.products.basePrice,
      }).from(schema.products).where(eq(schema.products.status, 'active')).orderBy(desc(schema.products.createdAt)).limit(5);
      const customers = await tx.select().from(schema.customers).orderBy(desc(schema.customers.createdAt)).limit(3);
      return { orders, products, customers };
    });
    recentOrders = lists.orders;
    topProducts = lists.products;
    recentCustomers = lists.customers;

    // Third transaction for analytics
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const analytics = await withTenant(store.id, async (tx) => {
      const revenue = await tx.select({
        date: sql<string>`TO_CHAR(${schema.orders.createdAt}::date, 'Mon DD')`,
        total: sql<number>`COALESCE(SUM(${schema.orders.grandTotal}), 0)`,
      }).from(schema.orders).where(gte(schema.orders.createdAt, sevenDaysAgo)).groupBy(sql`${schema.orders.createdAt}::date`).orderBy(sql`${schema.orders.createdAt}::date`);
      const theme = await tx.query.themes.findFirst({ where: eq(schema.themes.tenantId, store.id) });
      const page = await tx.query.pages.findFirst({ where: eq(schema.pages.tenantId, store.id) });
      const [shippingResult] = await tx.select({ count: count() }).from(schema.shippingZones).where(eq(schema.shippingZones.active, true));
      const [discountResult] = await tx.select({ count: count() }).from(schema.discounts);
      const [categoryResult] = await tx.select({ count: count() }).from(schema.categories);
      const [reviewResult] = await tx.select({ count: count() }).from(schema.productReviews).where(eq(schema.productReviews.status, 'approved'));
      const [eventResult] = await tx.select({ count: count() }).from(schema.storefrontEvents);
      return { revenue, theme, page, shippingZones: shippingResult?.count || 0, discounts: discountResult?.count || 0, categories: categoryResult?.count || 0, reviews: reviewResult?.count || 0, events: eventResult?.count || 0 };
    });
    revenueLast7Days = analytics.revenue;
    hasTheme = Boolean(analytics.theme);
    hasHomepage = Boolean(analytics.page);
    shippingZones = analytics.shippingZones;
    activeDiscounts = analytics.discounts;
    categories = analytics.categories;
    approvedReviews = analytics.reviews;
    analyticsEvents = analytics.events;
  } catch {
    // DB may not be available in all environments
  }

  const stats = [
    { label: "Revenue", value: `${Number(totalRevenue).toLocaleString()} EGP`, icon: <IconRevenue size={22} style={{ color: '#34d399' }} />, accent: "#34d399" },
    { label: "Orders", value: orderCount.toString(), icon: <IconCart size={22} style={{ color: '#fbbf24' }} />, accent: "#fbbf24", sub: `${pendingOrders} pending` },
    { label: "Products", value: `${activeProductCount}/${productCount}`, icon: <IconPackage size={22} style={{ color: '#818cf8' }} />, accent: "#818cf8", sub: "active / total" },
    { label: "Customers", value: customerCount.toString(), icon: <IconUsers size={22} style={{ color: '#f472b6' }} />, accent: "#f472b6" },
    { label: "Avg Order", value: `${Math.round(Number(avgOrderValue))} EGP`, icon: <IconRevenue size={22} style={{ color: '#06b6d4' }} />, accent: "#06b6d4" },
    { label: "Fulfilled", value: `${orderCount > 0 ? Math.round((fulfilledOrders / orderCount) * 100) : 0}%`, icon: <IconCheck size={22} style={{ color: '#10b981' }} />, accent: "#10b981", sub: `${fulfilledOrders}/${orderCount} orders` },
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

  const maxRevenue = Math.max(...revenueLast7Days.map(d => d.total), 1);

  return (
    <div className="admin-page">
      {/* Header */}
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

      {/* Stats Grid - 6 cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        {stats.map((stat) => (
          <div key={stat.label} style={{
            background: 'var(--bg-surface)',
            borderRadius: 16,
            padding: '20px',
            border: '1px solid var(--border-subtle)',
            transition: 'border-color 0.2s, transform 0.2s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: `${stat.accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {stat.icon}
              </div>
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1.1, marginBottom: 4 }}>{stat.value}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>{stat.label}</div>
            {stat.sub && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>{stat.sub}</div>}
          </div>
        ))}
      </div>

      {/* Main grid: 2 columns */}
      <div className="admin-dashboard-grid">
        {/* Revenue Trend */}
        <div style={{ background: 'var(--bg-surface)', borderRadius: 16, padding: 24, border: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 20, color: 'var(--text-primary)' }}>Revenue — Last 7 Days</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
            {revenueLast7Days.length > 0 ? revenueLast7Days.map((day, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{day.total > 0 ? `${Math.round(day.total)}` : ''}</span>
                <div style={{
                  width: '100%',
                  height: `${Math.max(4, (day.total / maxRevenue) * 80)}px`,
                  background: 'linear-gradient(180deg, #818cf8, #6366f1)',
                  borderRadius: 6,
                  minHeight: 4,
                }} />
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{day.date}</span>
              </div>
            )) : (
              <div style={{ flex: 1, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', paddingTop: 40 }}>
                No revenue data yet
              </div>
            )}
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div style={{ background: 'var(--bg-surface)', borderRadius: 16, padding: 24, border: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 20, color: 'var(--text-primary)' }}>Order Status</h3>
          {orderCount > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Pending', count: pendingOrders, color: '#fbbf24' },
                { label: 'Paid', count: Math.max(0, orderCount - pendingOrders - fulfilledOrders), color: '#818cf8' },
                { label: 'Delivered', count: fulfilledOrders, color: '#10b981' },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
                    <span style={{ fontWeight: 600 }}>{s.count}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: 'var(--border-subtle)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${orderCount > 0 ? (s.count / orderCount) * 100 : 0}%`, background: s.color, borderRadius: 3, transition: 'width 0.3s' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', paddingTop: 40 }}>
              No orders yet
            </div>
          )}
        </div>
      </div>

      {/* Bottom grid: 2 columns */}
      <div className="admin-dashboard-grid">
        {/* Top Products */}
        <div style={{ background: 'var(--bg-surface)', borderRadius: 16, padding: 24, border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>Recent Products</h3>
            <a href="/admin/products" style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600 }}>View all →</a>
          </div>
          {topProducts.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {topProducts.map((p) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{p.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>{Number(p.basePrice).toLocaleString()} EGP</div>
                  </div>
                  <span className={`admin-badge admin-badge-${p.status}`} style={{ fontSize: '0.7rem' }}>{p.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', paddingTop: 20 }}>
              <a href="/admin/products/new" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>Add your first product →</a>
            </div>
          )}
        </div>

        {/* Recent Customers */}
        <div style={{ background: 'var(--bg-surface)', borderRadius: 16, padding: 24, border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>Recent Customers</h3>
            <a href="/admin/customers" style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600 }}>View all →</a>
          </div>
          {recentCustomers.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentCustomers.map((c) => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>
                    {c.name?.charAt(0)?.toUpperCase() || c.email?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name || 'Unknown'}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.email || c.phone || '—'}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', paddingTop: 20 }}>
              No customers yet
            </div>
          )}
        </div>
      </div>

      {/* Launch Score */}
      <LaunchScoreCard score={launch.score} passed={launch.passed} total={launch.total} checks={launch.checks} />

      {/* Quick Actions - Improved */}
      <div className="admin-section" style={{ marginBottom: 24 }}>
        <h2 className="admin-section-title">Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {[
            { href: '/admin/products', icon: <IconPackage size={20} />, label: 'Manage Products', desc: 'Add, edit, organize', color: '#818cf8' },
            { href: '/admin/orders', icon: <IconCart size={20} />, label: 'View Orders', desc: 'Fulfill & track', color: '#fbbf24' },
            { href: '/admin/customers', icon: <IconUsers size={20} />, label: 'Customers', desc: `${customerCount} total`, color: '#f472b6' },
            { href: '/admin/discounts', icon: <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>%</span>, label: 'Discounts', desc: 'Coupons & promos', color: '#f97316' },
            { href: '/admin/themes', icon: <IconStore size={20} />, label: 'Design Store', desc: 'Theme & layout', color: '#a78bfa' },
            { href: '/admin/ai', icon: <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>AI</span>, label: 'AI Advisor', desc: 'Insights & agent', color: '#06b6d4' },
          ].map((action) => (
            <a
              key={action.href}
              href={action.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '16px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 12,
                textDecoration: 'none',
                color: 'inherit',
                transition: 'border-color 0.2s, transform 0.15s',
              }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${action.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: action.color, flexShrink: 0 }}>
                {action.icon}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{action.label}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 1 }}>{action.desc}</div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="admin-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 className="admin-section-title" style={{ marginBottom: 0 }}>Recent Orders</h2>
          {orderCount > 0 && (
            <a href="/admin/orders" style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600 }}>View all →</a>
          )}
        </div>
        {recentOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No orders yet. Share your store to start receiving orders!
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
                    <td>
                      <span className={`admin-badge admin-badge-${order.fulfillmentStatus || 'pending'}`}>
                        {order.fulfillmentStatus || 'pending'}
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
