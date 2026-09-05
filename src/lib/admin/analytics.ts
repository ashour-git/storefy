import { withTenant } from '../../db';
import * as schema from '../../db/schema';
import { desc, eq, sql } from 'drizzle-orm';

export interface ChannelSplit {
  channel: string;
  orders: number;
}

export interface TopProduct {
  name: string;
  orders: number;
}

export interface AnalyticsExtras {
  channels: ChannelSplit[];
  repeatCustomerRate: number;
  topProducts: TopProduct[];
}

export function summarizeOrders(rows: Array<{ channel: string; customerId: string | null }>): {
  channels: ChannelSplit[];
  repeatCustomerRate: number;
} {
  const byChannel = new Map<string, number>();
  const ordersPerCustomer = new Map<string, number>();
  for (const row of rows) {
    byChannel.set(row.channel, (byChannel.get(row.channel) ?? 0) + 1);
    if (row.customerId) {
      ordersPerCustomer.set(row.customerId, (ordersPerCustomer.get(row.customerId) ?? 0) + 1);
    }
  }
  const channels = [...byChannel.entries()]
    .map(([channel, orders]) => ({ channel, orders }))
    .sort((a, b) => b.orders - a.orders);
  const customers = [...ordersPerCustomer.values()];
  const repeat = customers.filter((count) => count > 1).length;
  return {
    channels,
    repeatCustomerRate: customers.length > 0 ? (repeat / customers.length) * 100 : 0,
  };
}

export async function getAnalyticsExtras(tenantId: string): Promise<AnalyticsExtras> {
  return withTenant(tenantId, async (tx) => {
    const rows = await tx
      .select({ channel: schema.orders.channel, customerId: schema.orders.customerId })
      .from(schema.orders);
    const topProducts = await tx
      .select({
        name: schema.products.name,
        orders: sql<number>`COALESCE(SUM(${schema.orderItems.quantity}), 0)`,
      })
      .from(schema.orderItems)
      .innerJoin(schema.products, eq(schema.orderItems.productId, schema.products.id))
      .groupBy(schema.products.id, schema.products.name)
      .orderBy(desc(sql`SUM(${schema.orderItems.quantity})`))
      .limit(5);
    const { channels, repeatCustomerRate } = summarizeOrders(rows);
    return {
      channels,
      repeatCustomerRate,
      topProducts: topProducts.map((row) => ({ name: row.name, orders: Number(row.orders) || 0 })),
    };
  });
}
