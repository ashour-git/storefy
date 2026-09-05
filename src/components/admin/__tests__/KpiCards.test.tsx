// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { KpiCards } from '../KpiCards';
import { SparkStrip } from '../SparkStrip';
import type { DayPoint } from '../../../lib/admin/revenue-series';

afterEach(() => cleanup());

describe('KpiCards', () => {
  it('renders every card label, value, and sub text', () => {
    render(
      <KpiCards
        cards={[
          { label: 'Revenue', value: '12,500 EGP', sub: 'this month' },
          { label: 'Orders', value: '42' },
        ]}
      />
    );
    expect(screen.getByText('Revenue')).toBeDefined();
    expect(screen.getByText('12,500 EGP')).toBeDefined();
    expect(screen.getByText('this month')).toBeDefined();
    expect(screen.getByText('42')).toBeDefined();
  });
});

describe('SparkStrip', () => {
  const SERIES: DayPoint[] = [
    { date: '2026-09-01', total: 100, orders: 2 },
    { date: '2026-09-02', total: 0, orders: 0 },
    { date: '2026-09-03', total: 50, orders: 1 },
  ];

  it('renders one bar per day with an accessible summary', () => {
    const { container } = render(<SparkStrip series={SERIES} />);
    expect(screen.getByRole('img', { name: /revenue.*3 days/i })).toBeDefined();
    expect(container.querySelectorAll('rect').length).toBe(3);
  });

  it('handles an all-zero series without invalid heights', () => {
    const { container } = render(
      <SparkStrip series={SERIES.map((d) => ({ ...d, total: 0 }))} />
    );
    const heights = Array.from(container.querySelectorAll('rect')).map((r) =>
      Number(r.getAttribute('height'))
    );
    expect(heights.every((h) => Number.isFinite(h) && h >= 0)).toBe(true);
  });
});
