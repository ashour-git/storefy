import { describe, expect, it } from 'vitest';
import { summarizeOrders } from '../analytics';

describe('summarizeOrders', () => {
  it('splits channels by volume and rates repeat customers', () => {
    const { channels, repeatCustomerRate } = summarizeOrders([
      { channel: 'online', customerId: 'a' },
      { channel: 'online', customerId: 'a' },
      { channel: 'pos', customerId: 'b' },
      { channel: 'online', customerId: null },
    ]);
    expect(channels).toEqual([
      { channel: 'online', orders: 3 },
      { channel: 'pos', orders: 1 },
    ]);
    expect(repeatCustomerRate).toBe(50);
  });

  it('returns zeros for no orders', () => {
    expect(summarizeOrders([])).toEqual({ channels: [], repeatCustomerRate: 0 });
  });
});
