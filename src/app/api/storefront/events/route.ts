import { withTenant } from '../../../../db';
import * as schema from '../../../../db/schema';
import { getErrorMessage } from '../../../../lib/errors';
import { sanitizeStorefrontEvent } from '../../../../lib/storefront-events';
import { resolveTenantBySlugOrDomain } from '../../../../lib/tenancy';

export async function POST(request: Request) {
  try {
    const body = await request.json() as { storeSlug?: string; eventType?: unknown; sessionId?: unknown; path?: unknown; productId?: unknown; categoryId?: unknown; metadata?: unknown };
    const tenant = body.storeSlug ? await resolveTenantBySlugOrDomain(body.storeSlug) : null;
    if (!tenant) return Response.json({ error: 'Store not found' }, { status: 404 });
    const event = sanitizeStorefrontEvent(body);
    await withTenant(tenant.id, (tx) => tx.insert(schema.storefrontEvents).values({ tenantId: tenant.id, ...event }));
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: getErrorMessage(error) }, { status: 400 });
  }
}
