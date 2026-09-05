import type { ReactNode } from 'react';

export interface KpiCard {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
  icon?: ReactNode;
}

export function KpiCards({ cards }: { cards: KpiCard[] }) {
  return (
    <div className="admin-kpi-grid">
      {cards.map((card) => (
        <div key={card.label} className="admin-kpi-card">
          {card.icon && (
            <div
              className="admin-kpi-icon"
              style={card.accent ? { background: `${card.accent}15` } : undefined}
            >
              {card.icon}
            </div>
          )}
          <div className="admin-kpi-value">{card.value}</div>
          <div className="admin-kpi-label">{card.label}</div>
          {card.sub && <div className="admin-kpi-sub">{card.sub}</div>}
        </div>
      ))}
    </div>
  );
}
