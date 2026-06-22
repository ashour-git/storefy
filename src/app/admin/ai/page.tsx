import { auth } from '../../../lib/auth';
import { headers } from 'next/headers';
import { db, withTenant } from '../../../db';
import * as schema from '../../../db/schema';
import { eq, count, sql, desc } from 'drizzle-orm';
import { AIAgentDashboard } from '../../../components/admin/AIAgentDashboard';
import { getAiPlan } from '../../../lib/ai/plans';
import { IconBrain } from '../../../components/IconLibrary';

export default async function AIPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const userStores = await db.select().from(schema.tenants).where(eq(schema.tenants.ownerId, session.user.id));
  const store = userStores[0];

  if (!store) {
    return (
      <div className="admin-page">
        <div className="admin-empty-state">
          <div className="admin-empty-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
            <IconBrain size={48} />
          </div>
          <h1 className="admin-empty-title">No Store Found</h1>
          <p className="admin-empty-desc">Create a store first to access AI tools.</p>
          <a href="/admin/stores/new" className="btn-primary" style={{ marginTop: 16 }}>Create Store →</a>
        </div>
      </div>
    );
  }

  // Gather metrics
  let metrics = {
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    totalCustomers: 0,
    recentOrders: [] as any[],
    topProducts: [] as any[],
  };

  try {
    const data = await withTenant(store.id, async (tx) => {
      const [p] = await tx.select({ count: count() }).from(schema.products);
      const [pa] = await tx.select({ count: count() }).from(schema.products).where(eq(schema.products.status, 'active'));
      const [o] = await tx.select({ count: count() }).from(schema.orders);
      const [r] = await tx.select({
        total: sql<string>`COALESCE(SUM(grand_total), 0)`,
        avg: sql<string>`COALESCE(AVG(grand_total), 0)`,
      }).from(schema.orders);
      const [c] = await tx.select({ count: count() }).from(schema.customers);
      const recent = await tx.select().from(schema.orders).orderBy(desc(schema.orders.createdAt)).limit(5);
      const prods = await tx.select().from(schema.products).where(eq(schema.products.status, 'active')).limit(5);

      return {
        totalProducts: p?.count || 0,
        activeProducts: pa?.count || 0,
        totalOrders: o?.count || 0,
        totalRevenue: parseFloat(r?.total || '0'),
        avgOrderValue: parseFloat(r?.avg || '0'),
        totalCustomers: c?.count || 0,
        recentOrders: recent,
        topProducts: prods,
      };
    });
    metrics = data;
  } catch {
    // ignore
  }

  return (
      <AIAgentDashboard
      store={store}
      metrics={metrics}
      aiPlan={getAiPlan(store.plan)}
    />
  );
}
