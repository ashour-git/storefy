import type { DayPoint } from '../../lib/admin/revenue-series';

const BAR_WIDTH = 24;
const BAR_GAP = 8;
const HEIGHT = 80;

export function SparkStrip({ series }: { series: DayPoint[] }) {
  const max = Math.max(...series.map((d) => d.total), 0);
  const width = series.length * (BAR_WIDTH + BAR_GAP);
  const total = series.reduce((sum, d) => sum + d.total, 0);
  return (
    <svg
      role="img"
      aria-label={`Revenue over the last ${series.length} days, total ${Math.round(total)}`}
      width={width}
      height={HEIGHT + 16}
      className="admin-spark-strip"
    >
      {series.map((day, i) => {
        const height = max > 0 ? Math.max(4, (day.total / max) * HEIGHT) : 4;
        return (
          <rect
            key={day.date}
            x={i * (BAR_WIDTH + BAR_GAP)}
            y={HEIGHT - height}
            width={BAR_WIDTH}
            height={height}
            rx={4}
            fill={day.total > 0 ? 'var(--accent-primary)' : 'var(--border-subtle)'}
          >
            <title>{`${day.date}: ${Math.round(day.total)}`}</title>
          </rect>
        );
      })}
    </svg>
  );
}
