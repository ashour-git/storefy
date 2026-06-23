import { auth } from '../../lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../../db';
import * as schema from '../../db/schema';
import { eq } from 'drizzle-orm';
import { AdminShell } from '../../components/AdminShell';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session;
  try {
    session = await auth.api.getSession({
      headers: await headers(),
    });
  } catch (e) {
    console.error('[admin/layout] Session check failed:', e);
    redirect('/');
  }

  if (!session) {
    redirect('/');
  }

  let userTenants: { id: string; name: string; slug: string; customDomain: string | null }[] = [];
  try {
    userTenants = await db
      .select()
      .from(schema.tenants)
      .where(eq(schema.tenants.ownerId, session!.user.id));
  } catch (e) {
    console.error('[admin/layout] DB query failed:', e);
  }

  return (
    <AdminShell
      user={{ id: session.user.id, name: session.user.name, email: session.user.email }}
      stores={userTenants.map((t) => ({ id: t.id, name: t.name, slug: t.slug, customDomain: t.customDomain }))}
    >
      {children}
    </AdminShell>
  );
}
