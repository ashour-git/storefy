import { getOwnedStore } from '../../../lib/admin/store-access';
import { PaymobSettingsForm } from '../../../components/admin/PaymobSettingsForm';
import { env } from '../../../lib/env';

interface PaymobSettings {
  sandboxReady?: boolean;
  integrationId?: string;
  iframeId?: string;
  checklist?: Record<string, boolean>;
}

export default async function PaymentsPage() {
  const { session, store } = await getOwnedStore();
  if (!session) return null;
  if (!store) return <div className="admin-page"><div className="admin-empty-state"><h1>No Store Found</h1><a className="btn-primary" href="/admin/stores/new">Create Store</a></div></div>;
  return (
    <div className="admin-page">
      <div className="admin-page-header"><div><h1 className="admin-page-title">Payments</h1><p className="admin-page-subtitle">Configure Paymob readiness while keeping secrets in environment variables.</p></div></div>
      <PaymobSettingsForm settings={(store.paymobSettings || {}) as PaymobSettings} envReady={Boolean(env.paymobApiKey && env.paymobIntegrationId)} />
    </div>
  );
}
