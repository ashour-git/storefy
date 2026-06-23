import { NextRequest, NextResponse } from 'next/server';
import { and, eq, inArray } from 'drizzle-orm';
import { db, withTenant } from '../../../../db';
import * as schema from '../../../../db/schema';
import { resolveTenantBySlugOrDomain } from '../../../../lib/tenancy';

interface ClientCartItem {
  productId: string;
  variantId: string;
  name: string;
  quantity: number;
  image?: string;
}

interface CartItem extends ClientCartItem {
  price: number;
}

export async function GET(req: NextRequest) {
  const storeSlug = req.nextUrl.searchParams.get('storeSlug');
  const sessionId = req.nextUrl.searchParams.get('sessionId');

  if (!storeSlug || !sessionId) {
    return NextResponse.json({ error: 'storeSlug and sessionId required' }, { status: 400 });
  }

  const tenant = await resolveTenantBySlugOrDomain(storeSlug);
  if (!tenant) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

  const cart = await withTenant(tenant.id, async (tx) => {
    return tx.query.carts.findFirst({
      where: and(
        eq(schema.carts.tenantId, tenant.id),
        eq(schema.carts.sessionId, sessionId),
        eq(schema.carts.status, 'active'),
      ),
    });
  });

  return NextResponse.json({ cart: cart || null });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      storeSlug?: string;
      sessionId?: string;
      items?: ClientCartItem[];
      customerEmail?: string;
    };

    if (!body.storeSlug || !body.sessionId || !Array.isArray(body.items)) {
      return NextResponse.json({ error: 'Invalid cart payload' }, { status: 400 });
    }

    const tenant = await resolveTenantBySlugOrDomain(body.storeSlug);
    if (!tenant) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

    const candidateItems = body.items
      .filter((item) => item.productId && item.variantId && item.quantity > 0)
      .slice(0, 50);

    const variantIds = Array.from(new Set(candidateItems.map((i) => i.variantId)));
    const productIds = Array.from(new Set(candidateItems.map((i) => i.productId)));

    const result = await withTenant(tenant.id, async (tx) => {
      const variants = await tx.query.productVariants.findMany({
        where: and(
          eq(schema.productVariants.tenantId, tenant.id),
          inArray(schema.productVariants.id, variantIds),
        ),
      });

      const products = await tx.query.products.findMany({
        where: and(
          eq(schema.products.tenantId, tenant.id),
          inArray(schema.products.id, productIds),
        ),
      });

      const variantMap = new Map(variants.map((v) => [v.id, v]));
      const productMap = new Map(products.map((p) => [p.id, p]));

      const sanitizedItems: CartItem[] = candidateItems.map((item) => {
        const variant = variantMap.get(item.variantId);
        const product = productMap.get(item.productId);
        const price = Number(variant?.priceOverride ?? product?.basePrice ?? 0);

        return {
          productId: item.productId,
          variantId: item.variantId,
          name: String(item.name || '').slice(0, 200),
          price,
          quantity: Math.min(99, Math.max(1, Number(item.quantity) || 1)),
          image: item.image || undefined,
        };
      });

      if (sanitizedItems.some((item) => item.price <= 0)) {
        return { error: 'Invalid product or variant' };
      }

      const existing = await tx.query.carts.findFirst({
        where: and(
          eq(schema.carts.tenantId, tenant.id),
          eq(schema.carts.sessionId, body.sessionId!),
          eq(schema.carts.status, 'active'),
        ),
      });

      if (existing) {
        const [updated] = await tx.update(schema.carts)
          .set({
            items: sanitizedItems,
            customerEmail: body.customerEmail || existing.customerEmail,
            status: 'active',
            updatedAt: new Date(),
            abandonedAt: null,
          })
          .where(eq(schema.carts.id, existing.id))
          .returning();
        return updated;
      }

      const [created] = await tx.insert(schema.carts).values({
        tenantId: tenant.id,
        sessionId: body.sessionId!,
        customerEmail: body.customerEmail || null,
        items: sanitizedItems,
      }).returning();
      return created;
    });

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ cart: result });
  } catch (error) {
    console.error('Cart update error:', error);
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
  }
}
