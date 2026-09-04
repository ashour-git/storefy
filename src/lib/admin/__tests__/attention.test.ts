import { describe, expect, it } from 'vitest';
import { buildAttentionItems } from '../attention';

describe('buildAttentionItems', () => {
  it('hides the rail when everything is zero', () => {
    expect(buildAttentionItems({ pendingOrders: 0, lowStockVariants: 0, failedPayments: 0 })).toEqual([]);
  });

  it('shows only non-zero items with fix links', () => {
    const items = buildAttentionItems({ pendingOrders: 3, lowStockVariants: 0, failedPayments: 1 });
    expect(items.map((i) => i.key)).toEqual(['pending-orders', 'failed-payments']);
    expect(items[0].href).toBe('/admin/orders');
    expect(items[1].href).toBe('/admin/payments');
  });

  it('labels counts in plain merchant language', () => {
    const items = buildAttentionItems({ pendingOrders: 1, lowStockVariants: 2, failedPayments: 0 });
    expect(items[0].label).toContain('1');
    expect(items[0].label).toMatch(/order/i);
    expect(items[1].label).toMatch(/low on stock/i);
  });
});
