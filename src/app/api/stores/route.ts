import { auth } from '../../../lib/auth';
import { headers } from 'next/headers';
import { db, withTenant } from '../../../db';
import * as schema from '../../../db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name, slug, category } = body;

  if (!name || !slug) {
    return Response.json({ error: 'Name and slug are required' }, { status: 400 });
  }

  // Check slug uniqueness
  const existing = await db.select().from(schema.tenants).where(eq(schema.tenants.slug, slug));
  if (existing.length > 0) {
    return Response.json({ error: 'This store URL is already taken' }, { status: 409 });
  }

  // Create tenant
  const [tenant] = await db.insert(schema.tenants).values({
    slug,
    name,
    category: category || null,
    ownerId: session.user.id,
  }).returning();

  // Create tenant member (owner)
  await withTenant(tenant.id, async (tx) => {
    return tx.insert(schema.tenantMembers).values({
      tenantId: tenant.id,
      userId: session.user.id,
      role: 'owner',
    });
  });

  return Response.json({ store: tenant }, { status: 201 });
}

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const stores = await db
    .select()
    .from(schema.tenants)
    .where(eq(schema.tenants.ownerId, session.user.id));

  return Response.json({ stores });
}
