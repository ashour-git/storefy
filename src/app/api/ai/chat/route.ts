import { auth } from '../../../../lib/auth';
import { headers } from 'next/headers';
import { db, withTenant } from '../../../../db';
import * as schema from '../../../../db/schema';
import { eq, count, sql, desc } from 'drizzle-orm';
import { aiProvider } from '../../../../lib/providers/ai';
import { getAiPlan } from '../../../../lib/ai/plans';
import { logAiCall } from '../../../../lib/ai/logging';
import { getErrorMessage } from '../../../../lib/errors';
import { getActiveStoreFromRequest } from '../../../../lib/admin/active-store';

interface StoreData {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  totalCustomers: number;
  recentOrders: Array<{ status: string; channel: string; total: string; currency: string }>;
}

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

    const storeData = await getStoreData(store.id);
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

async function getStoreData(tenantId: string): Promise<StoreData> {
  return withTenant(tenantId, async (tx) => {
    const [prodResult] = await tx.select({ count: count() }).from(schema.products);
    const [activeProds] = await tx.select({ count: count() }).from(schema.products).where(eq(schema.products.status, 'active'));
    const [orderResult] = await tx.select({ count: count() }).from(schema.orders);
    const [revResult] = await tx.select({
      total: sql<string>`COALESCE(SUM(grand_total), 0)`,
      avgOrder: sql<string>`COALESCE(AVG(grand_total), 0)`,
    }).from(schema.orders);
    const [custResult] = await tx.select({ count: count() }).from(schema.customers);
    const recentOrders = await tx.select().from(schema.orders).orderBy(desc(schema.orders.createdAt)).limit(10);

    return {
      totalProducts: prodResult?.count || 0,
      activeProducts: activeProds?.count || 0,
      totalOrders: orderResult?.count || 0,
      totalRevenue: parseFloat(revResult?.total || '0'),
      avgOrderValue: parseFloat(revResult?.avgOrder || '0'),
      totalCustomers: custResult?.count || 0,
      recentOrders: recentOrders.map((order) => ({
        status: order.status,
        channel: order.channel,
        total: order.grandTotal,
        currency: order.currency,
      })),
    };
  });
}
