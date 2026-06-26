import { describe, expect, it } from 'vitest';
import type { StoreMetrics } from '../admin/store-metrics';

describe('StoreMetrics', () => {
  it('has correct shape', () => {
    const metrics: StoreMetrics = {
      totalProducts: 10,
      activeProducts: 8,
      totalOrders: 50,
      totalRevenue: 12500,
      avgOrderValue: 250,
      totalCustomers: 35,
      recentOrders: [
        { status: 'paid', channel: 'online', total: '250', currency: 'EGP' },
      ],
    };

    expect(metrics.totalProducts).toBe(10);
    expect(metrics.activeProducts).toBe(8);
    expect(metrics.totalOrders).toBe(50);
    expect(metrics.totalRevenue).toBe(12500);
    expect(metrics.avgOrderValue).toBe(250);
    expect(metrics.totalCustomers).toBe(35);
    expect(metrics.recentOrders).toHaveLength(1);
  });

  it('defaults to empty recentOrders', () => {
    const metrics: StoreMetrics = {
      totalProducts: 0,
      activeProducts: 0,
      totalOrders: 0,
      totalRevenue: 0,
      avgOrderValue: 0,
      totalCustomers: 0,
      recentOrders: [],
    };

    expect(metrics.recentOrders).toEqual([]);
  });
});
