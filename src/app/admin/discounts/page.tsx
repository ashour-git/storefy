import { desc } from 'drizzle-orm';
import { withTenant } from '../../../db';
import * as schema from '../../../db/schema';
import { getOwnedStore } from '../../../lib/admin/store-access';
import { SimpleCrudPanel } from '../../../components/admin/SimpleCrudPanel';

export default async function DiscountsPage() {
  const { session, store } = await getOwnedStore();
  if (!session) return null;
  if (!store) return <div className="admin-page"><div className="admin-empty-state"><h1>No Store Found</h1><a className="btn-primary" href="/admin/stores/new">Create Store</a></div></div>;
  const discounts = await withTenant(store.id, (tx) => tx.select().from(schema.discounts).orderBy(desc(schema.discounts.startsAt))).catch(() => []);
  return (
    <div className="admin-page">
      <div className="admin-page-header"><div><h1 className="admin-page-title">Discounts</h1><p className="admin-page-subtitle">Create launch coupons without paid dependencies.</p></div></div>
      <SimpleCrudPanel
        title="Launch coupons"
        description="Coupons are stored in the existing discounts table and ready for checkout expansion."
        endpoint="/api/admin/discounts"
        fields={[{ name: 'code', label: 'Code' }, { name: 'type', label: 'Type', type: 'select', options: [{ label: 'Percent', value: 'percent' }, { label: 'Fixed EGP', value: 'fixed' }] }, { name: 'value', label: 'Value', type: 'number' }, { name: 'maxUses', label: 'Max uses', type: 'number' }]}
        initialValues={{ type: 'percent', value: '10' }}
        items={discounts}
        renderItem={(discount: any) => <><strong>{discount.code}</strong><p className="admin-muted-text">{discount.type} · {discount.value} · used {discount.usesCount || 0}{discount.maxUses ? `/${discount.maxUses}` : ''}</p></>}
      />
    </div>
  );
}
