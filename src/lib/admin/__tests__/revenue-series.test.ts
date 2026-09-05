import { describe, expect, it } from 'vitest';
import { fillSeriesDays } from '../revenue-series';

const TODAY = new Date('2026-09-05T12:00:00Z');

describe('fillSeriesDays', () => {
  it('returns zero-filled days ending today when input is empty', () => {
    const series = fillSeriesDays([], 7, TODAY);
    expect(series).toHaveLength(7);
    expect(series[6].date).toBe('2026-09-05');
    expect(series.every((d) => d.total === 0 && d.orders === 0)).toBe(true);
  });

  it('fills gaps while keeping reported days in order', () => {
    const series = fillSeriesDays(
      [
        { date: '2026-09-01', total: '100.50', orders: 2 },
        { date: '2026-09-03', total: 50, orders: '1' },
      ],
      5,
      TODAY
    );
    expect(series.map((d) => d.date)).toEqual([
      '2026-09-01',
      '2026-09-02',
      '2026-09-03',
      '2026-09-04',
      '2026-09-05',
    ]);
    expect(series[0]).toMatchObject({ total: 100.5, orders: 2 });
    expect(series[1]).toMatchObject({ total: 0, orders: 0 });
    expect(series[2]).toMatchObject({ total: 50, orders: 1 });
  });

  it('ignores rows outside the window', () => {
    const series = fillSeriesDays([{ date: '2026-08-01', total: 999, orders: 9 }], 7, TODAY);
    expect(series.every((d) => d.total === 0)).toBe(true);
  });
});
