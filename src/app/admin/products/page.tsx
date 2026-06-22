import { auth } from '../../../lib/auth';
import { headers } from 'next/headers';
import { db, withTenant } from '../../../db';
import * as schema from '../../../db/schema';
import { eq, desc } from 'drizzle-orm';
import { ProductTable } from '../../../components/admin/ProductTable';
import { IconPackage } from '../../../components/IconLibrary';

export default async function ProductsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const userStores = await db
    .select()
    .from(schema.tenants)
    .where(eq(schema.tenants.ownerId, session.user.id));

  const store = userStores[0];

  if (!store) {
    return (
      <div className="admin-page">
        <div className="admin-empty-state">
          <div className="admin-empty-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
            <IconPackage size={48} />
          </div>
          <h1 className="admin-empty-title">No Store Found</h1>
          <p className="admin-empty-desc">Create a store first to manage products.</p>
          <a href="/admin/stores/new" className="btn-primary" style={{ marginTop: 16 }}>Create Store →</a>
        </div>
      </div>
    );
  }

  let products: any[] = [];
  try {
    products = await withTenant(store.id, async (tx) => {
      return tx.select().from(schema.products).orderBy(desc(schema.products.createdAt));
    });
  } catch {
    // DB may not be available
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h1 className="admin-page-title" style={{ margin: 0 }}>Products</h1>
            <span style={{ 
              background: "var(--accent-glow)", 
              color: "var(--accent-primary)", 
              padding: "4px 10px", 
              borderRadius: "var(--radius-full)", 
              fontSize: "0.85rem", 
              fontWeight: 700 
            }}>
              {products.length}
            </span>
          </div>
          <p className="admin-page-subtitle">Manage catalog for {store.name}</p>
        </div>
        <a href="/admin/products/new" className="btn-primary">Add Product</a>
      </div>

      {products.length === 0 ? (
        <div className="admin-empty-state">
          <div className="admin-empty-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
            <IconPackage size={48} />
          </div>
          <h2 className="admin-empty-title">No Products Yet</h2>
          <p className="admin-empty-desc">
            Add your first product to start building your catalog.
          </p>
          <a href="/admin/products/new" className="btn-primary" style={{ marginTop: 16 }}>Add Your First Product →</a>
        </div>
      ) : (
        <ProductTable initialProducts={products} />
      )}
    </div>
  );
}
