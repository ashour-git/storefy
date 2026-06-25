import { desc } from 'drizzle-orm';
import { withTenant } from '../../../db';
import * as schema from '../../../db/schema';
import { getOwnedStore } from '../../../lib/admin/store-access';
import { ShippingZonePanel } from './ShippingZonePanel';

export default async function ShippingPage() {
  let session: any = null;
  let store: any = null;
  try {
    const result = await getOwnedStore();
    session = result.session;
    store = result.store;
  } catch (e) {
    console.error('[shipping/page] getOwnedStore failed:', e);
  }
  if (!session) return null;
  if (!store) return <div className="admin-page"><div className="admin-empty-state"><h1>No Store Found</h1><a className="btn-primary" href="/admin/stores/new">Create Store</a></div></div>;
  let zones: any[] = [];
  try {
    zones = await withTenant(store.id, (tx) => tx.select().from(schema.shippingZones).orderBy(desc(schema.shippingZones.createdAt)));
  } catch (e) {
    console.error('[shipping/page] zones query failed:', e);
  }
  return (
    <div className="admin-page">
      <div className="admin-page-header"><div><h1 className="admin-page-title">Shipping and COD</h1><p className="admin-page-subtitle">Set free-tier delivery zones and cash-on-delivery availability.</p></div></div>
      <ShippingZonePanel zones={zones} />
    </div>
  );
}
