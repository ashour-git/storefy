import { describe, expect, it } from 'vitest';
import { calculateLaunchScore } from '../launch-score';

describe('calculateLaunchScore', () => {
  it('scores a launch-ready store at 100', () => {
    const result = calculateLaunchScore({
      activeProducts: 5,
      totalProducts: 5,
      hasTheme: true,
      hasHomepage: true,
      locale: 'ar',
      currency: 'EGP',
      status: 'active',
      shippingZones: 1,
      activeDiscounts: 1,
      categories: 1,
      hasPaymob: true,
      hasCod: true,
      approvedReviews: 1,
      analyticsEvents: 1,
    });

    expect(result.score).toBe(100);
    expect(result.passed).toBe(result.total);
  });

  it('shows exact missing launch work for a weak store', () => {
    const result = calculateLaunchScore({
      activeProducts: 1,
      totalProducts: 1,
      hasTheme: false,
      hasHomepage: false,
      locale: 'en',
      currency: 'EGP',
      status: 'draft',
    });

    expect(result.score).toBe(18);
    expect(result.checks.find((check) => check.key === 'products')?.passed).toBe(false);
    expect(result.checks.find((check) => check.key === 'ai')?.passed).toBe(true);
  });
});
