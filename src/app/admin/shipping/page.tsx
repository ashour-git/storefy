import { desc } from 'drizzle-orm';
import { withTenant } from '../../../db';
import * as schema from '../../../db/schema';
import { getOwnedStore } from '../../../lib/admin/store-access';
import { SimpleCrudPanel } from '../../../components/admin/SimpleCrudPanel';

export default async function ShippingPage() {
  const { session, store } = await getOwnedStore();
  if (!session) return null;
  if (!store) return <div className="admin-page"><div className="admin-empty-state"><h1>No Store Found</h1><a className="btn-primary" href="/admin/stores/new">Create Store</a></div></div>;
  const zones = await withTenant(store.id, (tx) => tx.select().from(schema.shippingZones).orderBy(desc(schema.shippingZones.createdAt))).catch(() => []);
  return (
    <div className="admin-page">
      <div className="admin-page-header"><div><h1 className="admin-page-title">Shipping and COD</h1><p className="admin-page-subtitle">Set free-tier delivery zones and cash-on-delivery availability.</p></div></div>
      <SimpleCrudPanel
        title="Delivery zones"
        description="Use comma-separated cities. Checkout can price against the first active matching zone."
        endpoint="/api/admin/shipping"
        fields={[{ name: 'name', label: 'Zone name' }, { name: 'cities', label: 'Cities' }, { name: 'baseRate', label: 'Base rate', type: 'number' }, { name: 'freeShippingThreshold', label: 'Free shipping threshold', type: 'number' }, { name: 'codEnabled', label: 'COD enabled', type: 'checkbox' }]}
        initialValues={{ baseRate: '50', codEnabled: true }}
        items={zones}
        renderItem={(zone: any) => <><strong>{zone.name}</strong><p className="admin-muted-text">{(zone.cities as string[] | null)?.join(', ') || 'All cities'} · {zone.baseRate} EGP · COD {zone.codEnabled ? 'on' : 'off'}</p></>}
      />
    </div>
  );
}
