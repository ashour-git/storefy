import { auth } from '../../../../lib/auth';
import { headers } from 'next/headers';
import { db } from '../../../../db';
import * as schema from '../../../../db/schema';
import { eq } from 'drizzle-orm';
import { aiProvider } from '../../../../lib/providers/ai';
import { rateLimiter } from '../../../../lib/providers/rate-limit';
import { logAiCall } from '../../../../lib/ai/logging';
import { checkMonthlyQuota } from '../../../../lib/ai/quotas';
import { moderateAgentInput } from '../../../../lib/ai/safety';
import { estimateTokens } from '../../../../lib/ai/groq';
import { getActiveStoreFromRequest } from '../../../../lib/admin/active-store';

export async function POST(request: Request) {
  const startedAt = Date.now();
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const store = await getActiveStoreFromRequest(request, session.user.id);
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

    if (trimmedProductName.length > 160 || trimmedCategory.length > 120) {
      return Response.json({ error: 'Product name or category is too long' }, { status: 400 });
    }

    const moderation = moderateAgentInput(`${trimmedProductName} ${trimmedCategory}`);
    if (!moderation.allowed) {
      return Response.json({ error: moderation.reason || 'Blocked request' }, { status: 400 });
    }

    const quota = await checkMonthlyQuota(tenantId, store.plan);
    if (!quota.allowed) {
      return Response.json({ error: 'AI usage limit reached for this month.', used: quota.used, limit: quota.limit }, { status: 402 });
    }

    const result = await aiProvider.generateProductDescription({
      productName: trimmedProductName,
      category: trimmedCategory,
      locale: validLocale,
    });

    await logAiCall({
      tenantId,
      processor: 'product_description',
      model: 'openai/gpt-oss-20b-or-mock',
      startedAt,
      inputTokens: estimateTokens(trimmedProductName + trimmedCategory),
      outputTokens: estimateTokens(result.description),
    });

    return Response.json(result);
  } catch (error: unknown) {
    console.error('AI description generation error:', error instanceof Error ? error.message : error);
    return Response.json({ error: 'Failed to generate description' }, { status: 500 });
  }
}
