import { auth } from '../../../lib/auth';
import { headers } from 'next/headers';
import { db, withTenant } from '../../../db';
import * as schema from '../../../db/schema';
import { eq, desc } from 'drizzle-orm';

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name, description, basePrice, status } = body;

  if (!name || !basePrice) {
    return Response.json({ error: 'Name and price are required' }, { status: 400 });
  }

  // Get user's first store
  const stores = await db.select().from(schema.tenants).where(eq(schema.tenants.ownerId, session.user.id));
  const store = stores[0];
  if (!store) {
    return Response.json({ error: 'No store found. Create a store first.' }, { status: 404 });
  }

  // Create product within tenant scope
  const [product] = await withTenant(store.id, async (tx) => {
    return tx.insert(schema.products).values({
      tenantId: store.id,
      name,
      description: description || null,
      basePrice: basePrice.toString(),
      status: status || 'draft',
    }).returning();
  });

  return Response.json({ product }, { status: 201 });
}

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const stores = await db.select().from(schema.tenants).where(eq(schema.tenants.ownerId, session.user.id));
  const store = stores[0];
  if (!store) {
    return Response.json({ products: [] });
  }

  const products = await withTenant(store.id, async (tx) => {
    return tx.select().from(schema.products).orderBy(desc(schema.products.createdAt));
  });

  return Response.json({ products });
}
