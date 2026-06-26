import { and, eq } from 'drizzle-orm';
import { withTenant } from '../../../../db';
import * as schema from '../../../../db/schema';
import { getErrorMessage } from '../../../../lib/errors';
import { sanitizeReview } from '../../../../lib/reviews';
import { resolveTenantBySlugOrDomain } from '../../../../lib/tenancy';

export async function POST(request: Request) {
  try {
    const body = await request.json() as { storeSlug?: string; productId?: string; rating: number | string; title?: string; body?: string; authorName?: string; authorEmail?: string };
    const tenant = body.storeSlug ? await resolveTenantBySlugOrDomain(body.storeSlug) : null;
    if (!tenant) return Response.json({ error: 'Store not found' }, { status: 404 });
    if (!body.productId) return Response.json({ error: 'Product is required' }, { status: 400 });
    const review = sanitizeReview(body);
    const created = await withTenant(tenant.id, async (tx) => {
      const product = await tx.query.products.findFirst({ where: and(eq(schema.products.id, body.productId as string), eq(schema.products.tenantId, tenant.id), eq(schema.products.status, 'active')) });
      if (!product) throw new Error('Product not found');
      const [inserted] = await tx.insert(schema.productReviews).values({ tenantId: tenant.id, productId: product.id, ...review }).returning();
      return inserted;
    });
    return Response.json({ review: created, moderation: 'pending' }, { status: 201 });
  } catch (error) {
    return Response.json({ error: getErrorMessage(error) }, { status: 400 });
  }
}
