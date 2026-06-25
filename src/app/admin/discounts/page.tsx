import { desc } from 'drizzle-orm';
import { withTenant } from '../../../db';
import * as schema from '../../../db/schema';
import { getOwnedStore } from '../../../lib/admin/store-access';
import { DiscountPanel } from './DiscountPanel';

export default async function DiscountsPage() {
  let session: any = null;
  let store: any = null;
  try {
    const result = await getOwnedStore();
    session = result.session;
    store = result.store;
  } catch (e) {
    console.error('[discounts/page] getOwnedStore failed:', e);
  }
  if (!session) return null;
  if (!store) return <div className="admin-page"><div className="admin-empty-state"><h1>No Store Found</h1><a className="btn-primary" href="/admin/stores/new">Create Store</a></div></div>;
  let discounts: any[] = [];
  try {
    discounts = await withTenant(store.id, (tx) => tx.select().from(schema.discounts).orderBy(desc(schema.discounts.startsAt)));
  } catch (e) {
    console.error('[discounts/page] discounts query failed:', e);
  }
  return (
    <div className="admin-page">
      <div className="admin-page-header"><div><h1 className="admin-page-title">Discounts</h1><p className="admin-page-subtitle">Create launch coupons without paid dependencies.</p></div></div>
      <DiscountPanel discounts={discounts} />
    </div>
  );
}
