import { describe, expect, it } from 'vitest';
import { DASHBOARD_TABS, resolveDashboardTab } from '../dashboard-tabs';

describe('resolveDashboardTab', () => {
  it('accepts the four pinned tab values', () => {
    expect(resolveDashboardTab('overview')).toBe('overview');
    expect(resolveDashboardTab('tasks')).toBe('tasks');
    expect(resolveDashboardTab('analytics')).toBe('analytics');
    expect(resolveDashboardTab('briefing')).toBe('briefing');
  });

  it('falls back to overview for missing or unknown values', () => {
    expect(resolveDashboardTab(undefined)).toBe('overview');
    expect(resolveDashboardTab('')).toBe('overview');
    expect(resolveDashboardTab('revenue')).toBe('overview');
    expect(resolveDashboardTab(42)).toBe('overview');
  });

  it('keeps the tab registry pinned to four entries', () => {
    expect(DASHBOARD_TABS.map((t) => t.id)).toEqual(['overview', 'tasks', 'analytics', 'briefing']);
  });

  it('resolves every registered tab id back to itself', () => {
    for (const tab of DASHBOARD_TABS) {
      expect(resolveDashboardTab(tab.id)).toBe(tab.id);
    }
  });
});
