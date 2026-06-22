import { asc } from 'drizzle-orm';
import { withTenant } from '../../../db';
import * as schema from '../../../db/schema';
import { getOwnedStore } from '../../../lib/admin/store-access';
import { SimpleCrudPanel } from '../../../components/admin/SimpleCrudPanel';

export default async function CollectionsPage() {
  const { session, store } = await getOwnedStore();
  if (!session) return null;
  if (!store) return <div className="admin-page"><div className="admin-empty-state"><h1>No Store Found</h1><a className="btn-primary" href="/admin/stores/new">Create Store</a></div></div>;
  const categories = await withTenant(store.id, (tx) => tx.select().from(schema.categories).orderBy(asc(schema.categories.sortOrder), asc(schema.categories.name))).catch(() => []);
  return (
    <div className="admin-page">
      <div className="admin-page-header"><div><h1 className="admin-page-title">Collections</h1><p className="admin-page-subtitle">Manage storefront category pages and campaign landing collections.</p></div></div>
      <SimpleCrudPanel
        title="Storefront collections"
        description="Each collection gets a public category page. Use short slugs for links in ads and social posts."
        endpoint="/api/admin/categories"
        fields={[{ name: 'name', label: 'Name' }, { name: 'slug', label: 'Slug' }, { name: 'description', label: 'Description', type: 'textarea' }, { name: 'image', label: 'Image URL' }, { name: 'sortOrder', label: 'Sort order', type: 'number' }]}
        initialValues={{ sortOrder: '0' }}
        items={categories}
        renderItem={(category: any) => <><strong>{category.name}</strong><p className="admin-muted-text">/{category.slug || category.id} · {category.description || 'No description'}</p></>}
      />
    </div>
  );
}
