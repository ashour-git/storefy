// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { TasksTab } from '../TasksTab';
import { AnalyticsTab } from '../AnalyticsTab';

afterEach(() => cleanup());

describe('TasksTab', () => {
  it('lists actionable tasks as links and marks done ones', () => {
    render(
      <TasksTab
        tasks={[
          { label: 'Fulfill 3 waiting orders', href: '/admin/orders', done: false },
          { label: 'Add your first product', href: '/admin/products/new', done: true },
        ]}
      />
    );
    expect(screen.getByRole('link', { name: /fulfill 3 waiting orders/i }).getAttribute('href')).toBe('/admin/orders');
    expect(screen.getByText(/add your first product/i).closest('li')?.className).toMatch(/done/);
  });

  it('invites action when there is nothing to do', () => {
    render(<TasksTab tasks={[]} />);
    expect(screen.getByText(/all caught up/i)).toBeDefined();
  });
});

describe('AnalyticsTab', () => {
  it('shows channel split, repeat rate, and top products', () => {
    render(
      <AnalyticsTab
        data={{
          channels: [
            { channel: 'online', orders: 8 },
            { channel: 'pos', orders: 2 },
          ],
          repeatCustomerRate: 25,
          topProducts: [{ name: 'Amber Oud', orders: 5 }],
        }}
      />
    );
    const panel = screen.getByLabelText('Top products').textContent ?? '';
    expect(panel).toContain('Amber Oud');
    const channels = screen.getByLabelText('Orders by channel').textContent ?? '';
    expect(channels).toContain('online');
    expect(screen.getByLabelText('Repeat customers').textContent).toContain('25%');
  });

  it('handles empty analytics without breaking', () => {
    render(<AnalyticsTab data={{ channels: [], repeatCustomerRate: 0, topProducts: [] }} />);
    expect(screen.getByText(/no sales data yet/i)).toBeDefined();
  });
});
