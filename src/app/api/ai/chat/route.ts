import { auth } from '../../../../lib/auth';
import { headers } from 'next/headers';
import { aiProvider } from '../../../../lib/providers/ai';
import { getAiPlan } from '../../../../lib/ai/plans';
import { logAiCall } from '../../../../lib/ai/logging';
import { getActiveStoreFromRequest } from '../../../../lib/admin/active-store';
import { getStoreMetrics } from '../../../../lib/admin/store-metrics';
import { capConversation, moderateAgentInput, redactPII } from '../../../../lib/ai/safety';
import { checkMonthlyQuota } from '../../../../lib/ai/quotas';
import { rateLimiter } from '../../../../lib/providers/rate-limit';

export async function POST(request: Request) {
  const startedAt = Date.now();
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const store = await getActiveStoreFromRequest(request, session.user.id);
    if (!store) return Response.json({ error: 'No store found' }, { status: 404 });

    const body = await request.json() as { question?: string; messageHistory?: Array<{ role: 'user' | 'assistant'; content: string }> };
    const aiPlan = getAiPlan(store.plan);
    if (!aiPlan.businessAdvisor) {
      return Response.json({ error: 'Business advisor is not enabled for this plan' }, { status: 403 });
    }

    const question = typeof body.question === 'string' ? body.question.trim().slice(0, 1000) : '';
    if (question) {
      const moderation = moderateAgentInput(question);
      if (!moderation.allowed) {
        await logAiCall({ tenantId: store.id, processor: 'analytics_narrator', model: 'safety-rules', startedAt, moderationFlagged: true });
        return Response.json({ error: moderation.reason || 'Blocked request' }, { status: 400 });
      }
    }

    const limit = await rateLimiter.check(`ai-advisor:${store.id}:${session.user.id}`, 15, 60_000);
    if (!limit.allowed) {
      return Response.json({ error: 'Too many advisor requests. Please wait a moment.' }, { status: 429 });
    }

    const quota = await checkMonthlyQuota(store.id, store.plan);
    if (!quota.allowed) {
      return Response.json({ error: 'AI usage limit reached for this month.', used: quota.used, limit: quota.limit }, { status: 402 });
    }

    const storeData = await getStoreMetrics(store.id);
    const safeStoreData = JSON.parse(redactPII(JSON.stringify(storeData).slice(0, 6000))) as unknown;
    const locale = store.defaultLocale === 'ar' ? 'ar' : 'en';

    const stream = aiProvider.streamChat({
      storeName: store.name.slice(0, 80),
      category: store.category,
      locale,
      storeData: safeStoreData,
      question: question || 'Give me a store performance overview with actionable recommendations.',
      messageHistory: capConversation((body.messageHistory || []).filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string'), 8, 1200),
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        let fullContent = '';
        try {
          for await (const token of stream) {
            fullContent += token;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token })}\n\n`));
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
        } catch (err) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Stream failed' })}\n\n`));
        } finally {
          controller.close();
        }
        await logAiCall({
          tenantId: store.id,
          processor: 'analytics_narrator',
          model: 'openai/gpt-oss-120b-stream',
          startedAt,
          inputTokens: 0,
          outputTokens: fullContent.length,
        });
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error: unknown) {
    console.error('[ai/chat] failed:', error instanceof Error ? error.message : error);
    return Response.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}
