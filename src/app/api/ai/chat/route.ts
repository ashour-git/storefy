import { auth } from '../../../../lib/auth';
import { headers } from 'next/headers';
import { aiProvider } from '../../../../lib/providers/ai';
import { getAiPlan } from '../../../../lib/ai/plans';
import { logAiCall } from '../../../../lib/ai/logging';
import { getErrorMessage } from '../../../../lib/errors';
import { getActiveStoreFromRequest } from '../../../../lib/admin/active-store';
import { getStoreMetrics } from '../../../../lib/admin/store-metrics';

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

    const storeData = await getStoreMetrics(store.id);
    const locale = store.defaultLocale === 'ar' ? 'ar' : 'en';

    const stream = aiProvider.streamChat({
      storeName: store.name,
      category: store.category,
      locale,
      storeData,
      question: body.question || 'Give me a store performance overview with actionable recommendations.',
      messageHistory: body.messageHistory || [],
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
    return Response.json({ error: 'Failed to generate response', details: getErrorMessage(error) }, { status: 500 });
  }
}
