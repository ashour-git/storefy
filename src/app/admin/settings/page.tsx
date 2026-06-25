import { auth } from '../../../lib/auth';
import { headers } from 'next/headers';
import { db } from '../../../db';
import * as schema from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { SettingsForm } from '../../../components/admin/SettingsForm';
import { getActiveStore } from '../../../lib/admin/active-store';

export default async function SettingsPage() {
  let session;
  try {
    session = await auth.api.getSession({ headers: await headers() });
  } catch (e) {
    console.error('[settings/page] Session check failed:', e);
    return <div className="admin-page"><div className="admin-empty-state"><h1 className="admin-empty-title">Session Error</h1><p className="admin-empty-desc">Could not verify your session.</p><a href="/" className="btn-primary" style={{ marginTop: 16 }}>Go Home</a></div></div>;
  }
  if (!session) return null;

  let store;
  try {
    store = await getActiveStore(session.user.id);
  } catch (e) {
    console.error('[settings/page] Failed to fetch stores:', e);
    return <div className="admin-page"><div className="admin-empty-state"><h1 className="admin-empty-title">Database Error</h1><p className="admin-empty-desc">Could not load your stores.</p><a href="/" className="btn-primary" style={{ marginTop: 16 }}>Go Home</a></div></div>;
  }

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
