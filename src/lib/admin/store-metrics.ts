import { withTenant } from '../../db';
import * as schema from '../../db/schema';
import { eq, count, sql, desc } from 'drizzle-orm';

export interface StoreMetrics {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  totalCustomers: number;
  recentOrders: Array<{ status: string; channel: string; total: string; currency: string }>;
}

export async function getStoreMetrics(tenantId: string): Promise<StoreMetrics> {
  return withTenant(tenantId, async (tx) => {
    const [prodResult] = await tx.select({ count: count() }).from(schema.products);
    const [activeProds] = await tx.select({ count: count() }).from(schema.products).where(eq(schema.products.status, 'active'));
    const [orderResult] = await tx.select({ count: count() }).from(schema.orders);
    const [revResult] = await tx.select({
      total: sql<string>`COALESCE(SUM(grand_total), 0)`,
      avgOrder: sql<string>`COALESCE(AVG(grand_total), 0)`,
    }).from(schema.orders);
    const [custResult] = await tx.select({ count: count() }).from(schema.customers);
    const recentOrders = await tx.select().from(schema.orders).orderBy(desc(schema.orders.createdAt)).limit(10);

    return {
      totalProducts: prodResult?.count || 0,
      activeProducts: activeProds?.count || 0,
      totalOrders: orderResult?.count || 0,
      totalRevenue: parseFloat(revResult?.total || '0'),
      avgOrderValue: parseFloat(revResult?.avgOrder || '0'),
      totalCustomers: custResult?.count || 0,
      recentOrders: recentOrders.map((order) => ({
        status: order.status,
        channel: order.channel,
        total: order.grandTotal,
        currency: order.currency,
      })),
    };
  });
}
