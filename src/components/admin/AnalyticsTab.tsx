export interface AnalyticsData {
  channels: Array<{ channel: string; orders: number }>;
  repeatCustomerRate: number;
  topProducts: Array<{ name: string; orders: number }>;
}

export function AnalyticsTab({ data }: { data: AnalyticsData }) {
  const hasData = data.channels.length > 0 || data.topProducts.length > 0;
  if (!hasData) {
    return (
      <div role="status" className="admin-section-state">
        <p>No sales data yet. Your first orders will appear here.</p>
      </div>
    );
  }
  return (
    <div className="admin-analytics-grid">
      <section aria-label="Orders by channel">
        <h3>Orders by channel</h3>
        <ul>
          {data.channels.map((row) => (
            <li key={row.channel}>
              {row.channel} — {row.orders}
            </li>
          ))}
        </ul>
      </section>
      <section aria-label="Repeat customers">
        <h3>Repeat customers</h3>
        <p>{Math.round(data.repeatCustomerRate)}% ordered more than once</p>
      </section>
      <section aria-label="Top products">
        <h3>Top products</h3>
        <ul>
          {data.topProducts.map((product) => (
            <li key={product.name}>
              {product.name} — {product.orders}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
