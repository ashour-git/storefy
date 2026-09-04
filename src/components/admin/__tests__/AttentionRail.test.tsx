// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { AttentionRail } from '../AttentionRail';
import type { AttentionItem } from '../../../lib/admin/attention';

afterEach(() => cleanup());

const ITEMS: AttentionItem[] = [
  { key: 'pending-orders', label: '3 orders waiting to be fulfilled', count: 3, href: '/admin/orders', severity: 'warning' },
  { key: 'failed-payments', label: '1 failed payment needs a look', count: 1, href: '/admin/payments', severity: 'alert' },
];

describe('AttentionRail', () => {
  it('renders nothing when there is nothing needing attention', () => {
    const { container } = render(<AttentionRail items={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('links each item to its fix screen with status conveyed in text', () => {
    render(<AttentionRail items={ITEMS} />);
    expect(screen.getByRole('region', { name: /needs attention/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /3 orders waiting/i }).getAttribute('href')).toBe('/admin/orders');
    expect(screen.getByText(/1 failed payment needs a look/i)).toBeDefined();
  });
});
