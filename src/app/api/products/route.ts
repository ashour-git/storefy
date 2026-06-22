import { auth } from '../../../lib/auth';
import { headers } from 'next/headers';
import { db, withTenant } from '../../../db';
import * as schema from '../../../db/schema';
import { eq, desc } from 'drizzle-orm';
import { rebuildTenantKnowledge } from '../../../lib/ai/knowledge';
import { getErrorMessage } from '../../../lib/errors';

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, basePrice, status, images, sku, stockQty } = body;

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
    const validImages = Array.isArray(images) ? images.filter(img => typeof img === 'string') : [];

    // Get user's first store
    const stores = await db.select().from(schema.tenants).where(eq(schema.tenants.ownerId, session.user.id));
    const store = stores[0];
    if (!store) {
      return Response.json({ error: 'No store found. Create a store first.' }, { status: 404 });
    }

    // Create product and default variant within tenant scope
    const { product } = await withTenant(store.id, async (tx) => {
      const [insertedProduct] = await tx.insert(schema.products).values({
        tenantId: store.id,
        name: trimmedName,
        description: trimmedDescription || null,
        basePrice: priceNum.toString(),
        status: validStatus,
        images: validImages,
      }).returning();

      // Create default SKU and stock level
      const finalSku = typeof sku === 'string' && sku.trim() ? sku.trim() : `SKU-${insertedProduct.id.slice(0, 8).toUpperCase()}`;
      const finalStock = typeof stockQty === 'number' ? stockQty : Number(stockQty) || 0;

      await tx.insert(schema.productVariants).values({
        tenantId: store.id,
        productId: insertedProduct.id,
        sku: finalSku,
        stockQty: finalStock,
      });

      return { product: insertedProduct };
    });

    await rebuildTenantKnowledge(store.id).catch((error) => console.warn('AI knowledge rebuild failed after product create', error));

    return Response.json({ product }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating product:', error);
    return Response.json({ error: 'Failed to create product', details: getErrorMessage(error) }, { status: 500 });
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
  } catch (error: unknown) {
    console.error('Error fetching products:', error);
    return Response.json({ error: 'Failed to fetch products', details: getErrorMessage(error) }, { status: 500 });
  }
}
