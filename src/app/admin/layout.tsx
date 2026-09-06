import { redirect } from 'next/navigation';
import { Fraunces, JetBrains_Mono } from 'next/font/google';
import { AdminShell } from '../../components/AdminShell';
import { resolveAllStores, resolveStore } from '../../lib/admin/active-store';

// Admin-only display fonts (Design Store studio system). Kept out of the root
// layout so public pages never download them.
const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

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
    <div className={`${fraunces.variable} ${jetbrainsMono.variable}`}>
      <AdminShell
        user={{ id: session.user.id, name: session.user.name, email: session.user.email }}
        stores={userTenants.map((t) => ({ id: t.id, name: t.name, slug: t.slug, customDomain: t.customDomain }))}
        activeStoreId={activeStoreId}
      >
        {children}
      </AdminShell>
    </div>
  );
}
