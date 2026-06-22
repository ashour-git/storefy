import { auth } from '../../../../lib/auth';
import { headers } from 'next/headers';
import { db, withTenant } from '../../../../db';
import * as schema from '../../../../db/schema';
import { eq } from 'drizzle-orm';
import { rebuildTenantKnowledge } from '../../../../lib/ai/knowledge';
import { getErrorMessage } from '../../../../lib/errors';

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { products } = body;

    if (!Array.isArray(products) || products.length === 0) {
      return Response.json({ error: 'Invalid or empty products list' }, { status: 400 });
    }

    // Limit maximum bulk import size to prevent payload overflow
    if (products.length > 100) {
      return Response.json({ error: 'Bulk import is limited to 100 products at a time' }, { status: 400 });
    }

    // Get user's first store
    const stores = await db.select().from(schema.tenants).where(eq(schema.tenants.ownerId, session.user.id));
    const store = stores[0];
    if (!store) {
      return Response.json({ error: 'No store found. Create a store first.' }, { status: 404 });
    }

    const imported = await withTenant(store.id, async (tx) => {
      const results = [];
      for (const item of products) {
        const { name, description, basePrice, status, images, sku, stockQty } = item;

        const trimmedName = typeof name === 'string' ? name.trim() : '';
        const trimmedDescription = typeof description === 'string' ? description.trim() : '';
        const priceNum = Number(basePrice);

        // Basic validation: skip or throw. Let's skip invalid entries to make it resilient, or log them
        if (!trimmedName || isNaN(priceNum) || priceNum <= 0) {
          continue;
        }

        const validStatus = status === 'active' || status === 'draft' || status === 'archived' ? status : 'draft';
        const validImages = Array.isArray(images) ? images.filter(img => typeof img === 'string') : [];

        // Insert product
        const [insertedProduct] = await tx.insert(schema.products).values({
          tenantId: store.id,
          name: trimmedName,
          description: trimmedDescription || null,
          basePrice: priceNum.toString(),
          status: validStatus,
          images: validImages,
        }).returning();

        // Create Default Variant for SKU & Stock
        const finalSku = typeof sku === 'string' && sku.trim() ? sku.trim() : `SKU-${insertedProduct.id.slice(0, 8).toUpperCase()}`;
        const finalStock = typeof stockQty === 'number' ? stockQty : Number(stockQty) || 0;

        await tx.insert(schema.productVariants).values({
          tenantId: store.id,
          productId: insertedProduct.id,
          sku: finalSku,
          stockQty: finalStock,
        });

        results.push(insertedProduct);
      }
      return results;
    });

    await rebuildTenantKnowledge(store.id).catch((error) => console.warn('AI knowledge rebuild failed after bulk product import', error));

    return Response.json({ message: `Successfully imported ${imported.length} products`, count: imported.length }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error in bulk import API:', error);
    return Response.json({ error: 'Failed to import products', details: getErrorMessage(error) }, { status: 500 });
  }
}
