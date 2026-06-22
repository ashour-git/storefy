import { auth } from '../../../lib/auth';
import { headers } from 'next/headers';
import { db, withTenant } from '../../../db';
import * as schema from '../../../db/schema';
import { eq, desc } from 'drizzle-orm';

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
          <div className="admin-empty-icon">📦</div>
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
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Products</h1>
          <p className="admin-page-subtitle">{products.length} product{products.length !== 1 ? "s" : ""} in {store.name}</p>
        </div>
        <a href="/admin/products/new" className="btn-primary">Add Product</a>
      </div>

      {products.length === 0 ? (
        <div className="admin-empty-state">
          <div className="admin-empty-icon">📦</div>
          <h2 className="admin-empty-title">No Products Yet</h2>
          <p className="admin-empty-desc">
            Add your first product to start building your catalog.
          </p>
          <a href="/admin/products/new" className="btn-primary" style={{ marginTop: 16 }}>Add Your First Product →</a>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="admin-product-name">{product.name}</div>
                    {product.description && (
                      <div className="admin-product-desc">{product.description.slice(0, 60)}…</div>
                    )}
                  </td>
                  <td>{product.basePrice} {product.currency}</td>
                  <td>
                    <span className={`admin-badge admin-badge-${product.status}`}>
                      {product.status}
                    </span>
                  </td>
                  <td>{product.createdAt ? new Date(product.createdAt).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
