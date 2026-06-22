import { auth } from '../../../lib/auth';
import { headers } from 'next/headers';
import { db } from '../../../db';
import * as schema from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { SettingsForm } from '../../../components/admin/SettingsForm';

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const userStores = await db.select().from(schema.tenants).where(eq(schema.tenants.ownerId, session.user.id));
  const store = userStores[0];

  if (!store) {
    return (
      <div className="admin-page">
        <div className="admin-empty-state">
          <div className="admin-empty-icon">⚙️</div>
          <h1 className="admin-empty-title">No Store Found</h1>
          <p className="admin-empty-desc">Create a store first to manage settings.</p>
          <a href="/admin/stores/new" className="btn-primary" style={{ marginTop: 16 }}>Create Store →</a>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header" style={{ marginBottom: 24 }}>
        <h1 className="admin-page-title">Settings</h1>
        <p className="admin-page-subtitle">Configure parameters and details for {store.name}</p>
      </div>

      <SettingsForm store={store} />
    </div>
  );
}
