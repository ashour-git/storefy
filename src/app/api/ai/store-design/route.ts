import { auth } from '../../../../lib/auth';
import { headers } from 'next/headers';
import { getActiveStoreFromRequest } from '../../../../lib/admin/active-store';
import { getAiPlan } from '../../../../lib/ai/plans';
import { checkMonthlyQuota } from '../../../../lib/ai/quotas';
import { moderateAgentInput, sanitizeModelInput } from '../../../../lib/ai/safety';
import { generateStoreDesign } from '../../../../lib/ai/store-design';
import { estimateTokens } from '../../../../lib/ai/groq';
import { logAiCall } from '../../../../lib/ai/logging';

interface StoreDesignBody {
  mood?: string;
  audience?: string;
  colorInstinct?: string;
  seed?: number;
  locale?: string;
}

function cleanField(value: unknown, max = 120): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim().slice(0, max);
  return trimmed ? trimmed : undefined;
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const store = await getActiveStoreFromRequest(request, session.user.id);
    if (!store) return Response.json({ error: 'No store found' }, { status: 404 });

    const aiPlan = getAiPlan(store.plan);
    if (!aiPlan.storeDesigner) {
      return Response.json({ error: 'Store designer is not enabled for this plan' }, { status: 403 });
    }

    const body = (await request.json()) as StoreDesignBody;
    const locale: 'ar' | 'en' = body.locale === 'ar' ? 'ar' : store.defaultLocale === 'ar' ? 'ar' : 'en';
    const brief = {
      storeName: store.name.slice(0, 80),
      category: (store.category || 'general').slice(0, 80),
      locale,
      mood: cleanField(body.mood),
      audience: cleanField(body.audience),
      colorInstinct: cleanField(body.colorInstinct),
      seed: typeof body.seed === 'number' ? body.seed : undefined,
    };

    const quota = await checkMonthlyQuota(store.id, store.plan);
    if (!quota.allowed) {
      await logAiCall({
        tenantId: store.id,
        processor: 'store_design',
        model: 'quota-exhausted',
        startedAt,
        moderationFlagged: false,
      });
      return Response.json(
        {
          error: 'AI usage limit reached for this month.',
          used: quota.used,
          limit: quota.limit,
          tokens: {},
          blocks: [{ type: 'hero' }, { type: 'collection' }, { type: 'footer' }],
          source: 'fallback',
          warnings: ['Monthly AI limit reached; applied the default look instead.'],
        },
        { status: 402 }
      );
    }

    const moderation = moderateAgentInput(
      [brief.mood, brief.audience, brief.colorInstinct].filter(Boolean).join(' ')
    );
    if (!moderation.allowed) {
      await logAiCall({
        tenantId: store.id,
        processor: 'store_design',
        model: 'safety-rules',
        startedAt,
        moderationFlagged: true,
      });
      return Response.json({ error: moderation.reason || 'Blocked request' }, { status: 400 });
    }

    const result = await generateStoreDesign({
      ...brief,
      mood: brief.mood ? sanitizeModelInput(brief.mood, 120) : undefined,
      audience: brief.audience ? sanitizeModelInput(brief.audience, 120) : undefined,
      colorInstinct: brief.colorInstinct ? sanitizeModelInput(brief.colorInstinct, 120) : undefined,
    });

    await logAiCall({
      tenantId: store.id,
      processor: 'store_design',
      model: result.source === 'ai' ? 'openai/gpt-oss-120b-or-mock' : 'preset-fallback',
      startedAt,
      inputTokens: estimateTokens(JSON.stringify(brief)),
      outputTokens: estimateTokens(JSON.stringify(result.design)),
    });

    return Response.json({
      tokens: result.design.tokens,
      blocks: result.design.blocks,
      source: result.source,
      warnings: result.warnings,
    });
  } catch (error: unknown) {
    console.error('[ai/store-design] failed:', error instanceof Error ? error.message : error);
    return Response.json({ error: 'Failed to generate store design' }, { status: 500 });
  }
}
