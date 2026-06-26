import { describe, expect, it } from 'vitest';
import { buildLaunchPlan } from '../launch-plan';
import { calculateDiscountTotal } from '../discounts';
import { calculateShippingTotal } from '../shipping';
import { sanitizeReview, summarizeReviews } from '../reviews';
import { slugify } from '../categories';

describe('domain modules', () => {
  describe('categories', () => {
    it('creates stable category slugs', () => {
      expect(slugify(' Summer Launch 2026! ')).toBe('summer-launch-2026');
    });

    it('truncates long slugs to 80 chars', () => {
      const long = 'a'.repeat(100);
      expect(slugify(long).length).toBeLessThanOrEqual(80);
    });

    it('returns collection for empty input', () => {
      expect(slugify('')).toBe('collection');
    });
  });

  describe('shipping', () => {
    it('calculates free shipping thresholds', () => {
      expect(calculateShippingTotal(499, { baseRate: '50', freeShippingThreshold: '500' })).toBe(50);
      expect(calculateShippingTotal(500, { baseRate: '50', freeShippingThreshold: '500' })).toBe(0);
    });

    it('returns 0 for missing zone', () => {
      expect(calculateShippingTotal(100)).toBe(0);
    });

    it('handles null threshold', () => {
      expect(calculateShippingTotal(100, { baseRate: '25', freeShippingThreshold: null })).toBe(25);
    });
  });

  describe('discounts', () => {
    it('caps discounts at subtotal', () => {
      expect(calculateDiscountTotal(100, { type: 'percent', value: '10' })).toBe(10);
      expect(calculateDiscountTotal(100, { type: 'fixed', value: '150' })).toBe(100);
    });

    it('returns 0 for missing discount', () => {
      expect(calculateDiscountTotal(100)).toBe(0);
    });

    it('respects max uses', () => {
      expect(calculateDiscountTotal(100, { type: 'percent', value: '10', maxUses: 5, usesCount: 5 })).toBe(0);
      expect(calculateDiscountTotal(100, { type: 'percent', value: '10', maxUses: 5, usesCount: 4 })).toBe(10);
    });
  });

  describe('reviews', () => {
    it('keeps reviews pending by default', () => {
      expect(sanitizeReview({ rating: 5, body: 'Loved it' }).status).toBe('pending');
    });

    it('summarizes only approved reviews', () => {
      expect(summarizeReviews([{ rating: 5, status: 'approved' }, { rating: 1, status: 'pending' }])).toEqual({ count: 1, average: 5 });
    });

    it('clamps rating between 1 and 5', () => {
      expect(sanitizeReview({ rating: 0, body: 'Bad' }).rating).toBe(1);
      expect(sanitizeReview({ rating: 10, body: 'Great' }).rating).toBe(5);
    });
  });

  describe('launch-plan', () => {
    it('builds a deterministic fallback launch plan', () => {
      const plan = buildLaunchPlan({ storeName: 'Demo', goal: 'first 10 orders' });
      expect(plan.headline).toContain('Demo');
      expect(plan.checklist.length).toBeGreaterThan(3);
    });

    it('uses default goal when not provided', () => {
      const plan = buildLaunchPlan({ storeName: 'Test' });
      expect(plan.headline).toContain('first 10 orders');
    });
  });
});
