import { auth } from '../../../lib/auth';
import { headers } from 'next/headers';
import { db, withTenant } from '../../../db';
import * as schema from '../../../db/schema';
import { eq, desc } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, basePrice, status } = body;

    const trimmedName = typeof name === 'string' ? name.trim() : '';
    const trimmedDescription = typeof description === 'string' ? description.trim() : '';

    if (!trimmedName) {
      return Response.json({ error: 'Name is required' }, { status: 400 });
    }
    if (trimmedName.length > 200) {
      return Response.json({ error: 'Product name cannot exceed 200 characters' }, { status: 400 });
    }
    if (trimmedDescription.length > 5000) {
      return Response.json({ error: 'Product description cannot exceed 5000 characters' }, { status: 400 });
    }

    if (basePrice === undefined || basePrice === null) {
      return Response.json({ error: 'Price is required' }, { status: 400 });
    }

    const priceNum = Number(basePrice);
    if (isNaN(priceNum) || priceNum <= 0 || priceNum >= 10000000) {
      return Response.json({ error: 'Price must be a positive number less than 10,000,000' }, { status: 400 });
    }

    const validStatus = status === 'active' || status === 'draft' || status === 'archived' ? status : 'draft';

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
        name: trimmedName,
        description: trimmedDescription || null,
        basePrice: priceNum.toString(),
        status: validStatus,
      }).returning();
    });

    return Response.json({ product }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return Response.json({ error: 'Failed to create product', details: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
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
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return Response.json({ error: 'Failed to fetch products', details: error.message }, { status: 500 });
  }
}
