import { describe, expect, it } from 'vitest';
import { shouldShowOnboarding } from '../dashboard-tabs';

describe('shouldShowOnboarding', () => {
  it('shows the checklist for a brand-new store', () => {
    expect(shouldShowOnboarding({ orderCount: 0, pendingOrders: 0, onboardingComplete: false })).toBe(true);
  });

  it('keeps the checklist while the only orders are still pending', () => {
    expect(shouldShowOnboarding({ orderCount: 2, pendingOrders: 2, onboardingComplete: false })).toBe(true);
  });

  it('hides the checklist once an order moves past pending', () => {
    expect(shouldShowOnboarding({ orderCount: 3, pendingOrders: 1, onboardingComplete: false })).toBe(false);
  });

  it('stays hidden once the merchant marked setup complete', () => {
    expect(shouldShowOnboarding({ orderCount: 0, pendingOrders: 0, onboardingComplete: true })).toBe(false);
  });
});
