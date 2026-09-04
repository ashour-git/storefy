import { withTenant } from '../../db';
import * as schema from '../../db/schema';
import { and, count, eq, lte } from 'drizzle-orm';

export const LOW_STOCK_THRESHOLD = 5;

export interface AttentionCounts {
  pendingOrders: number;
  lowStockVariants: number;
  failedPayments: number;
}

export interface AttentionItem {
  key: 'pending-orders' | 'low-stock' | 'failed-payments';
  label: string;
  count: number;
  href: string;
  severity: 'warning' | 'alert';
}

export function buildAttentionItems(counts: AttentionCounts): AttentionItem[] {
  const items: AttentionItem[] = [];
  if (counts.pendingOrders > 0) {
    items.push({
      key: 'pending-orders',
      label: `${counts.pendingOrders} order${counts.pendingOrders === 1 ? '' : 's'} waiting to be fulfilled`,
      count: counts.pendingOrders,
      href: '/admin/orders',
      severity: 'warning',
    });
  }
  if (counts.lowStockVariants > 0) {
    items.push({
      key: 'low-stock',
      label: `${counts.lowStockVariants} variant${counts.lowStockVariants === 1 ? '' : 's'} running low on stock`,
      count: counts.lowStockVariants,
      href: '/admin/products',
      severity: 'warning',
    });
  }
  if (counts.failedPayments > 0) {
    items.push({
      key: 'failed-payments',
      label: `${counts.failedPayments} failed payment${counts.failedPayments === 1 ? '' : 's'} need${counts.failedPayments === 1 ? 's' : ''} a look`,
      count: counts.failedPayments,
      href: '/admin/payments',
      severity: 'alert',
    });
  }
  return items;
}

export async function getAttentionItems(tenantId: string): Promise<AttentionItem[]> {
  const counts = await withTenant(tenantId, async (tx) => {
    const [pending] = await tx
      .select({ count: count() })
      .from(schema.orders)
      .where(and(eq(schema.orders.tenantId, tenantId), eq(schema.orders.status, 'pending')));
    const [lowStock] = await tx
      .select({ count: count() })
      .from(schema.productVariants)
      .where(and(eq(schema.productVariants.tenantId, tenantId), lte(schema.productVariants.stockQty, LOW_STOCK_THRESHOLD)));
    const [failed] = await tx
      .select({ count: count() })
      .from(schema.payments)
      .where(and(eq(schema.payments.tenantId, tenantId), eq(schema.payments.status, 'failed')));
    return {
      pendingOrders: pending?.count ?? 0,
      lowStockVariants: lowStock?.count ?? 0,
      failedPayments: failed?.count ?? 0,
    };
  });
  return buildAttentionItems(counts);
}
