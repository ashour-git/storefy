import { auth } from '../../../lib/auth';
import { headers } from 'next/headers';
import { db, withTenant } from '../../../db';
import * as schema from '../../../db/schema';
import { eq, desc } from 'drizzle-orm';
import { IconUsers } from '../../../components/IconLibrary';
import { getActiveStore } from '../../../lib/admin/active-store';

export default async function CustomersPage() {
  let session;
  try {
    session = await auth.api.getSession({ headers: await headers() });
  } catch (e) {
    console.error('[customers/page] Session check failed:', e);
    return <div className="admin-page"><div className="admin-empty-state"><h1 className="admin-empty-title">Session Error</h1><p className="admin-empty-desc">Could not verify your session.</p><a href="/" className="btn-primary" style={{ marginTop: 16 }}>Go Home</a></div></div>;
  }
  if (!session) return null;

  let store;
  try {
    store = await getActiveStore(session.user.id);
  } catch (e) {
    console.error('[customers/page] Failed to fetch stores:', e);
    return <div className="admin-page"><div className="admin-empty-state"><h1 className="admin-empty-title">Database Error</h1><p className="admin-empty-desc">Could not load your stores.</p><a href="/" className="btn-primary" style={{ marginTop: 16 }}>Go Home</a></div></div>;
  }

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
