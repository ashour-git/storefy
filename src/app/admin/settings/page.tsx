import { auth } from '../../../lib/auth';
import { headers } from 'next/headers';
import { db } from '../../../db';
import * as schema from '../../../db/schema';
import { eq } from 'drizzle-orm';

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
      <div className="admin-page-header">
        <h1 className="admin-page-title">Settings</h1>
        <p className="admin-page-subtitle">Manage your store configuration</p>
      </div>

      <div className="admin-settings-grid">
        {/* Store Info */}
        <div className="admin-settings-card">
          <h2 className="admin-settings-card-title">Store Information</h2>
          <div className="admin-settings-row">
            <span className="admin-settings-label">Name</span>
            <span className="admin-settings-value">{store.name}</span>
          </div>
          <div className="admin-settings-row">
            <span className="admin-settings-label">URL</span>
            <span className="admin-settings-value admin-mono">{store.slug}.storefy.com</span>
          </div>
          <div className="admin-settings-row">
            <span className="admin-settings-label">Custom Domain</span>
            <span className="admin-settings-value">{store.customDomain || "Not configured"}</span>
          </div>
          <div className="admin-settings-row">
            <span className="admin-settings-label">Category</span>
            <span className="admin-settings-value">{store.category || "General"}</span>
          </div>
          <div className="admin-settings-row">
            <span className="admin-settings-label">Status</span>
            <span className={`admin-badge admin-badge-${store.status}`}>{store.status}</span>
          </div>
        </div>

        {/* Regional Settings */}
        <div className="admin-settings-card">
          <h2 className="admin-settings-card-title">Regional Settings</h2>
          <div className="admin-settings-row">
            <span className="admin-settings-label">Default Language</span>
            <span className="admin-settings-value">{store.defaultLocale === "ar" ? "Arabic (العربية)" : "English"}</span>
          </div>
          <div className="admin-settings-row">
            <span className="admin-settings-label">Default Currency</span>
            <span className="admin-settings-value">{store.defaultCurrency}</span>
          </div>
        </div>

        {/* Plan */}
        <div className="admin-settings-card">
          <h2 className="admin-settings-card-title">Subscription Plan</h2>
          <div className="admin-settings-row">
            <span className="admin-settings-label">Current Plan</span>
            <span className="admin-badge admin-badge-plan">{store.plan?.toUpperCase()}</span>
          </div>
          <p className="admin-muted-text" style={{ marginTop: 12 }}>
            Plan upgrades are coming soon. Stay on the free plan to get started.
          </p>
        </div>

        {/* Owner Info */}
        <div className="admin-settings-card">
          <h2 className="admin-settings-card-title">Account</h2>
          <div className="admin-settings-row">
            <span className="admin-settings-label">Owner</span>
            <span className="admin-settings-value">{session.user.name}</span>
          </div>
          <div className="admin-settings-row">
            <span className="admin-settings-label">Email</span>
            <span className="admin-settings-value">{session.user.email}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
