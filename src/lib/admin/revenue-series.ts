import { withTenant } from '../../db';
import * as schema from '../../db/schema';
import { count, gte, sql } from 'drizzle-orm';

export interface DayPoint {
  date: string;
  total: number;
  orders: number;
}

interface RawDayPoint {
  date: string;
  total: string | number;
  orders: string | number;
}

function toDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function fillSeriesDays(raw: RawDayPoint[], days: number, today = new Date()): DayPoint[] {
  const byDate = new Map<string, DayPoint>();
  for (const row of raw) {
    if (typeof row.date !== 'string') continue;
    byDate.set(row.date.slice(0, 10), {
      date: row.date.slice(0, 10),
      total: Number(row.total) || 0,
      orders: Number(row.orders) || 0,
    });
  }
  const series: DayPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(today);
    day.setUTCDate(day.getUTCDate() - i);
    const key = toDayKey(day);
    series.push(byDate.get(key) ?? { date: key, total: 0, orders: 0 });
  }
  return series;
}

export async function getRevenueSeries(tenantId: string, days = 7): Promise<DayPoint[]> {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - (days - 1));
  since.setUTCHours(0, 0, 0, 0);
  const rows = await withTenant(tenantId, async (tx) => {
    return tx
      .select({
        date: sql<string>`${schema.orders.createdAt}::date::text`,
        total: sql<string>`COALESCE(SUM(${schema.orders.grandTotal}), 0)`,
        orders: count(),
      })
      .from(schema.orders)
      .where(gte(schema.orders.createdAt, since))
      .groupBy(sql`${schema.orders.createdAt}::date`);
  });
  return fillSeriesDays(rows, days);
}
