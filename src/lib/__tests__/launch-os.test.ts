import { describe, expect, it } from 'vitest';
import { buildLaunchPlan, calculateDiscountTotal, calculateShippingTotal, sanitizeReview, slugify, summarizeReviews } from '../launch-os';

describe('launch-os helpers', () => {
  it('creates stable category slugs', () => {
    expect(slugify(' Summer Launch 2026! ')).toBe('summer-launch-2026');
  });

  it('calculates free shipping thresholds', () => {
    expect(calculateShippingTotal(499, { baseRate: '50', freeShippingThreshold: '500' })).toBe(50);
    expect(calculateShippingTotal(500, { baseRate: '50', freeShippingThreshold: '500' })).toBe(0);
  });

  it('caps discounts at subtotal', () => {
    expect(calculateDiscountTotal(100, { type: 'percent', value: '10' })).toBe(10);
    expect(calculateDiscountTotal(100, { type: 'fixed', value: '150' })).toBe(100);
  });

  it('keeps reviews pending by default', () => {
    expect(sanitizeReview({ rating: 5, body: 'Loved it' }).status).toBe('pending');
  });

  it('summarizes only approved reviews', () => {
    expect(summarizeReviews([{ rating: 5, status: 'approved' }, { rating: 1, status: 'pending' }])).toEqual({ count: 1, average: 5 });
  });

  it('builds a deterministic fallback launch plan', () => {
    const plan = buildLaunchPlan({ storeName: 'Demo', goal: 'first 10 orders' });
    expect(plan.headline).toContain('Demo');
    expect(plan.checklist.length).toBeGreaterThan(3);
  });
});
