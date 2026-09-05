import { redirect } from 'next/navigation';
import { AdminShell } from '../../components/AdminShell';
import { resolveAllStores, resolveStore } from '../../lib/admin/active-store';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Single resolution seam shared with every admin page: sidebar and content
  // can never disagree about which store is active.
  const { session, store } = await resolveStore();
  if (!session) {
    redirect('/');
  }

  let userTenants: { id: string; name: string; slug: string; customDomain: string | null }[] = [];
  try {
    const all = await resolveAllStores();
    userTenants = all.stores;
  } catch (e) {
    console.error('[admin/layout] DB query failed:', e);
  }

  const activeStoreId = store?.id || userTenants[0]?.id || '';

  return (
    <AdminShell
      user={{ id: session.user.id, name: session.user.name, email: session.user.email }}
      stores={userTenants.map((t) => ({ id: t.id, name: t.name, slug: t.slug, customDomain: t.customDomain }))}
      activeStoreId={activeStoreId}
    >
      {children}
    </AdminShell>
  );
}
