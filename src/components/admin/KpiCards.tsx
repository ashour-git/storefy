import type { ReactNode } from 'react';
import { IconCart, IconCheck, IconPackage, IconRevenue, IconUsers } from '../IconLibrary';

export interface KpiCard {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
  icon?: ReactNode;
}

export interface OverviewMetrics {
  totalRevenue: string;
  orderCount: number;
  pendingOrders: number;
  activeProductCount: number;
  productCount: number;
  customerCount: number;
  avgOrderValue: string;
  fulfilledOrders: number;
}

export function buildOverviewCards(metrics: OverviewMetrics): KpiCard[] {
  const fulfilledRate =
    metrics.orderCount > 0 ? Math.round((metrics.fulfilledOrders / metrics.orderCount) * 100) : 0;
  return [
    { label: 'Revenue', value: `${Number(metrics.totalRevenue).toLocaleString()} EGP`, icon: <IconRevenue size={22} style={{ color: '#34d399' }} />, accent: '#34d399' },
    { label: 'Orders', value: metrics.orderCount.toString(), icon: <IconCart size={22} style={{ color: '#fbbf24' }} />, accent: '#fbbf24', sub: `${metrics.pendingOrders} pending` },
    { label: 'Products', value: `${metrics.activeProductCount}/${metrics.productCount}`, icon: <IconPackage size={22} style={{ color: '#818cf8' }} />, accent: '#818cf8', sub: 'active / total' },
    { label: 'Customers', value: metrics.customerCount.toString(), icon: <IconUsers size={22} style={{ color: '#f472b6' }} />, accent: '#f472b6' },
    { label: 'Avg Order', value: `${Math.round(Number(metrics.avgOrderValue))} EGP`, icon: <IconRevenue size={22} style={{ color: '#06b6d4' }} />, accent: '#06b6d4' },
    { label: 'Fulfilled', value: `${fulfilledRate}%`, icon: <IconCheck size={22} style={{ color: '#10b981' }} />, accent: '#10b981', sub: `${metrics.fulfilledOrders}/${metrics.orderCount} orders` },
  ];
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
