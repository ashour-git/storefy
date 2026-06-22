import { auth } from '../../../lib/auth';
import { headers } from 'next/headers';
import { db, withTenant } from '../../../db';
import * as schema from '../../../db/schema';
import { eq, desc } from 'drizzle-orm';
import { IconUsers } from '../../../components/IconLibrary';

export default async function CustomersPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const userStores = await db.select().from(schema.tenants).where(eq(schema.tenants.ownerId, session.user.id));
  const store = userStores[0];

  if (!store) {
    return (
      <div className="admin-page">
        <div className="admin-empty-state">
          <div className="admin-empty-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f472b6' }}>
            <IconUsers size={48} />
          </div>
          <h1 className="admin-empty-title">No Store Found</h1>
          <p className="admin-empty-desc">Create a store first to manage customers.</p>
          <a href="/admin/stores/new" className="btn-primary" style={{ marginTop: 16 }}>Create Store →</a>
        </div>
      </div>
    );
  }

  let customers: any[] = [];
  try {
    customers = await withTenant(store.id, async (tx) => {
      return tx.select().from(schema.customers).orderBy(desc(schema.customers.createdAt));
    });
  } catch {
    // DB may not be available
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Customers</h1>
          <p className="admin-page-subtitle">{customers.length} customer{customers.length !== 1 ? "s" : ""} in {store.name}</p>
        </div>
      </div>

      {customers.length === 0 ? (
        <div className="admin-empty-state">
          <div className="admin-empty-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f472b6' }}>
            <IconUsers size={48} />
          </div>
          <h2 className="admin-empty-title">No Customers Yet</h2>
          <p className="admin-empty-desc">
            Customers will appear here when they interact with your store.
          </p>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td><a href={`/admin/customers/${customer.id}`}>{customer.name || "—"}</a></td>
                  <td>{customer.email || "—"}</td>
                  <td>{customer.phone || "—"}</td>
                  <td>{customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
