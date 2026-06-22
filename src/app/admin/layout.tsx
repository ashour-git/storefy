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
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/');
  }

  // Fetch user's tenants (stores)
  const userTenants = await db
    .select()
    .from(schema.tenants)
    .where(eq(schema.tenants.ownerId, session.user.id));

  return (
    <AdminShell
      user={{ id: session.user.id, name: session.user.name, email: session.user.email }}
      stores={userTenants.map((t) => ({ id: t.id, name: t.name, slug: t.slug, customDomain: t.customDomain }))}
    >
      {children}
    </AdminShell>
  );
}
