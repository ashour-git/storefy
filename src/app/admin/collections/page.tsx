import { asc } from 'drizzle-orm';
import { withTenant } from '../../../db';
import * as schema from '../../../db/schema';
import { getOwnedStore } from '../../../lib/admin/store-access';
import { CategoryPanel } from './CategoryPanel';

export default async function CollectionsPage() {
  let session: any = null;
  let store: any = null;
  try {
    const result = await getOwnedStore();
    session = result.session;
    store = result.store;
  } catch (e) {
    console.error('[collections/page] getOwnedStore failed:', e);
  }
  if (!session) return null;
  if (!store) return <div className="admin-page"><div className="admin-empty-state"><h1>No Store Found</h1><a className="btn-primary" href="/admin/stores/new">Create Store</a></div></div>;
  let categories: any[] = [];
  try {
    categories = await withTenant(store.id, (tx) => tx.select().from(schema.categories).orderBy(asc(schema.categories.sortOrder), asc(schema.categories.name)));
  } catch (e) {
    console.error('[collections/page] categories query failed:', e);
  }
  return (
    <div className="admin-page">
      <div className="admin-page-header"><div><h1 className="admin-page-title">Collections</h1><p className="admin-page-subtitle">Manage storefront category pages and campaign landing collections.</p></div></div>
      <CategoryPanel categories={categories} />
    </div>
  );
}
