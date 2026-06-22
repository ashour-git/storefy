import { auth } from '../../../../lib/auth';
import { headers } from 'next/headers';
import { db, withTenant } from '../../../../db';
import * as schema from '../../../../db/schema';
import { eq, and } from 'drizzle-orm';

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const params = await context.params;
    const { id } = params;

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's first store
    const stores = await db.select().from(schema.tenants).where(eq(schema.tenants.ownerId, session.user.id));
    const store = stores[0];
    if (!store) {
      return Response.json({ error: 'No store found' }, { status: 404 });
    }

    const products = await withTenant(store.id, async (tx) => {
      return tx.select().from(schema.products).where(
        and(
          eq(schema.products.id, id),
          eq(schema.products.tenantId, store.id)
        )
      );
    });

    const product = products[0];
    if (!product) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }

    return Response.json({ product });
  } catch (error: any) {
    console.error('Error fetching product:', error);
    return Response.json({ error: 'Failed to fetch product', details: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const params = await context.params;
    const { id } = params;

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
      return Response.json({ error: 'No store found' }, { status: 404 });
    }

    // Update product within tenant scope
    const [updatedProduct] = await withTenant(store.id, async (tx) => {
      return tx.update(schema.products)
        .set({
          name: trimmedName,
          description: trimmedDescription || null,
          basePrice: priceNum.toString(),
          status: validStatus,
        })
        .where(
          and(
            eq(schema.products.id, id),
            eq(schema.products.tenantId, store.id)
          )
        )
        .returning();
    });

    if (!updatedProduct) {
      return Response.json({ error: 'Product not found or not owned by your store' }, { status: 404 });
    }

    return Response.json({ product: updatedProduct });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return Response.json({ error: 'Failed to update product', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const params = await context.params;
    const { id } = params;

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's first store
    const stores = await db.select().from(schema.tenants).where(eq(schema.tenants.ownerId, session.user.id));
    const store = stores[0];
    if (!store) {
      return Response.json({ error: 'No store found' }, { status: 404 });
    }

    // Soft delete: update status to 'archived'
    const [deletedProduct] = await withTenant(store.id, async (tx) => {
      return tx.update(schema.products)
        .set({ status: 'archived' })
        .where(
          and(
            eq(schema.products.id, id),
            eq(schema.products.tenantId, store.id)
          )
        )
        .returning();
    });

    if (!deletedProduct) {
      return Response.json({ error: 'Product not found or not owned by your store' }, { status: 404 });
    }

    return Response.json({ product: deletedProduct, message: 'Product archived successfully' });
  } catch (error: any) {
    console.error('Error archiving product:', error);
    return Response.json({ error: 'Failed to archive product', details: error.message }, { status: 500 });
  }
}
