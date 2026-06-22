import { auth } from '../../../../lib/auth';
import { headers } from 'next/headers';
import { db } from '../../../../db';
import * as schema from '../../../../db/schema';
import { eq } from 'drizzle-orm';
import { aiProvider } from '../../../../lib/providers/ai';
import { rateLimiter } from '../../../../lib/providers/rate-limit';
import { getErrorMessage } from '../../../../lib/errors';

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's first store to scope limit by tenant
    const stores = await db.select().from(schema.tenants).where(eq(schema.tenants.ownerId, session.user.id));
    const store = stores[0];
    if (!store) {
      return Response.json({ error: 'No store found' }, { status: 404 });
    }
    const tenantId = store.id;

    const limit = await rateLimiter.check(`ai-description:${tenantId}`, 10, 60_000);
    if (!limit.allowed) {
      return Response.json({ error: 'Too many requests. Limit is 10 requests per minute.' }, { status: 429 });
    }

    const body = await request.json();
    const { productName, category, locale } = body;

    const trimmedProductName = typeof productName === 'string' ? productName.trim() : '';
    const trimmedCategory = typeof category === 'string' ? category.trim() : '';
    const validLocale = locale === 'ar' ? 'ar' : 'en';

    if (!trimmedProductName) {
      return Response.json({ error: 'Product name is required for generation' }, { status: 400 });
    }

    const result = await aiProvider.generateProductDescription({
      productName: trimmedProductName,
      category: trimmedCategory,
      locale: validLocale,
    });

    return Response.json(result);
  } catch (error: unknown) {
    console.error('AI description generation error:', error);
    return Response.json({ error: 'Failed to generate description', details: getErrorMessage(error) }, { status: 500 });
  }
}
