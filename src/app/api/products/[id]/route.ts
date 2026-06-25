import { auth } from '../../../../lib/auth';
import { headers } from 'next/headers';
import { db, withTenant } from '../../../../db';
import * as schema from '../../../../db/schema';
import { eq, and } from 'drizzle-orm';
import { jobRunner } from '../../../../lib/providers/jobs';
import { getErrorMessage } from '../../../../lib/errors';
import { getActiveStoreFromRequest } from '../../../../lib/admin/active-store';

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

    const store = await getActiveStoreFromRequest(request, session.user.id);
    if (!store) {
      return Response.json({ error: 'No store found' }, { status: 404 });
    }

    const { product, variant } = await withTenant(store.id, async (tx) => {
      const [p] = await tx.select().from(schema.products).where(
        and(
          eq(schema.products.id, id),
          eq(schema.products.tenantId, store.id)
        )
      );
      if (!p) return { product: null, variant: null };

      const [v] = await tx.select().from(schema.productVariants).where(
        and(
          eq(schema.productVariants.productId, id),
          eq(schema.productVariants.tenantId, store.id)
        )
      );
      return { product: p, variant: v || null };
    });

    if (!product) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }

    return Response.json({ 
      product: {
        ...product,
        sku: variant?.sku || '',
        stockQty: variant?.stockQty || 0,
      } 
    });
  } catch (error: unknown) {
    console.error('Error fetching product:', error);
    return Response.json({ error: 'Failed to fetch product', details: getErrorMessage(error) }, { status: 500 });
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

    const store = await getActiveStoreFromRequest(request, session.user.id);
    if (!store) {
      return Response.json({ error: 'No store found' }, { status: 404 });
    }

    // Update product and default variant within tenant scope
    const updatedProduct = await withTenant(store.id, async (tx) => {
      const [p] = await tx.update(schema.products)
        .set({
          name: trimmedName,
          description: trimmedDescription || null,
          basePrice: priceNum.toString(),
          status: validStatus,
          images: validImages,
        })
        .where(
          and(
            eq(schema.products.id, id),
            eq(schema.products.tenantId, store.id)
          )
        )
        .returning();

      if (!p) return null;

      // Upsert the default variant matching this product
      const finalSku = typeof sku === 'string' && sku.trim() ? sku.trim() : `SKU-${p.id.slice(0, 8).toUpperCase()}`;
      const finalStock = typeof stockQty === 'number' ? stockQty : Number(stockQty) || 0;

      const existingVariants = await tx.select().from(schema.productVariants).where(
        and(
          eq(schema.productVariants.productId, id),
          eq(schema.productVariants.tenantId, store.id)
        )
      );

      if (existingVariants.length > 0) {
        await tx.update(schema.productVariants)
          .set({
            sku: finalSku,
            stockQty: finalStock,
          })
          .where(
            and(
              eq(schema.productVariants.productId, id),
              eq(schema.productVariants.tenantId, store.id)
            )
          );
      } else {
        await tx.insert(schema.productVariants).values({
          tenantId: store.id,
          productId: p.id,
          sku: finalSku,
          stockQty: finalStock,
        });
      }

      return p;
    });

    if (!updatedProduct) {
      return Response.json({ error: 'Product not found or not owned by your store' }, { status: 404 });
    }

    await jobRunner.enqueue('product/updated', { tenantId: store.id }).catch((error) => console.warn('AI knowledge rebuild failed after product update', error));

    return Response.json({ product: updatedProduct });
  } catch (error: unknown) {
    console.error('Error updating product:', error);
    return Response.json({ error: 'Failed to update product', details: getErrorMessage(error) }, { status: 500 });
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

    const store = await getActiveStoreFromRequest(request, session.user.id);
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

    await jobRunner.enqueue('product/updated', { tenantId: store.id }).catch((error) => console.warn('AI knowledge rebuild failed after product archive', error));

    return Response.json({ product: deletedProduct, message: 'Product archived successfully' });
  } catch (error: unknown) {
    console.error('Error archiving product:', error);
    return Response.json({ error: 'Failed to archive product', details: getErrorMessage(error) }, { status: 500 });
  }
}
