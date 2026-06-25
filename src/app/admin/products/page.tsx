import { auth } from '../../../lib/auth';
import { headers } from 'next/headers';
import { db, withTenant } from '../../../db';
import * as schema from '../../../db/schema';
import { eq, desc } from 'drizzle-orm';
import { ProductTable } from '../../../components/admin/ProductTable';
import { IconPackage } from '../../../components/IconLibrary';
import { getActiveStore } from '../../../lib/admin/active-store';

export default async function ProductsPage() {
  let session;
  try {
    session = await auth.api.getSession({ headers: await headers() });
  } catch (e) {
    console.error('[products/page] Session check failed:', e);
    return <div className="admin-page"><div className="admin-empty-state"><h1 className="admin-empty-title">Session Error</h1><p className="admin-empty-desc">Could not verify your session.</p><a href="/" className="btn-primary" style={{ marginTop: 16 }}>Go Home</a></div></div>;
  }
  if (!session) return null;

  let store;
  try {
    store = await getActiveStore(session.user.id);
  } catch (e) {
    console.error('[products/page] Failed to fetch stores:', e);
    return <div className="admin-page"><div className="admin-empty-state"><h1 className="admin-empty-title">Database Error</h1><p className="admin-empty-desc">Could not load your stores.</p><a href="/" className="btn-primary" style={{ marginTop: 16 }}>Go Home</a></div></div>;
  }

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
