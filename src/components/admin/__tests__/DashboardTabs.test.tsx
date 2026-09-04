// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { DashboardTabs } from '../DashboardTabs';

afterEach(() => cleanup());

describe('DashboardTabs', () => {
  it('links to all four tabs with the active one marked current', () => {
    render(<DashboardTabs activeTab="tasks" />);
    const nav = screen.getByRole('navigation', { name: /dashboard sections/i });
    expect(nav.textContent).toContain('Overview');
    const active = screen.getByRole('link', { name: 'Tasks' });
    expect(active.getAttribute('aria-current')).toBe('page');
    expect(active.getAttribute('href')).toBe('/admin?tab=tasks');
    expect(screen.getByRole('link', { name: 'Overview' }).hasAttribute('aria-current')).toBe(false);
  });

  it('renders tabs as real links for keyboard and screen-reader users', () => {
    render(<DashboardTabs activeTab="overview" />);
    expect(screen.getAllByRole('link')).toHaveLength(4);
  });
});
