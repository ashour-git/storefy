import { auth } from '../../../../lib/auth';
import { headers } from 'next/headers';
import { db, withTenant } from '../../../../db';
import * as schema from '../../../../db/schema';
import { eq, count, sql, desc } from 'drizzle-orm';
import { aiProvider, type BusinessInsight } from '../../../../lib/providers/ai';
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

    const body = await request.json() as { type?: string; question?: string };
    const aiPlan = getAiPlan(store.plan);
    if (!aiPlan.businessAdvisor) {
      return Response.json({ error: 'Business advisor is not enabled for this plan' }, { status: 403 });
    }

    const storeData = await getStoreData(store.id);
    const locale = store.defaultLocale === 'ar' ? 'ar' : 'en';
    const generated = await aiProvider.generateBusinessInsights({
      storeName: store.name,
      category: store.category,
      locale,
      storeData,
      question: body.type === 'chat' ? body.question : undefined,
    });

    const insights = generated.insights.length > 0 ? generated.insights : generateMockInsights(storeData, store.name);
    await logAiCall({ tenantId: store.id, processor: 'analytics_narrator', model: 'openai/gpt-oss-120b-or-mock', startedAt });

    return Response.json({ insights, storeData, aiPlan });
  } catch (error: unknown) {
    return Response.json({ error: 'Failed to generate insights', details: getErrorMessage(error) }, { status: 500 });
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

function generateMockInsights(data: StoreData, storeName: string): BusinessInsight[] {
  const insights: BusinessInsight[] = [];

  if (data.totalProducts === 0) {
    insights.push({
      type: 'alert',
      title: 'No Products Added Yet',
      description: `${storeName} has no products in the catalog. Customers cannot purchase without visible inventory.`,
      action: 'Add your first product to start selling.',
    });
  } else if (data.activeProducts < data.totalProducts * 0.5) {
    insights.push({
      type: 'warning',
      title: 'Many Products Are Inactive',
      description: `Only ${data.activeProducts} of ${data.totalProducts} products are published. You are losing potential revenue.`,
      action: 'Activate draft products to maximize your catalog visibility.',
    });
  } else {
    insights.push({
      type: 'success',
      title: 'Healthy Product Catalog',
      description: `You have ${data.activeProducts} active products. Keep adding new items to grow your catalog.`,
      action: 'Consider adding product variants or bundles to increase AOV.',
    });
  }

  insights.push({
    type: 'tip',
    title: data.totalOrders === 0 ? 'Drive Your First Sale' : 'Increase Average Order Value',
    description: data.totalOrders === 0
      ? 'Share your store link on WhatsApp, Instagram, and Facebook with a simple launch offer.'
      : `Your average order is ${Math.round(data.avgOrderValue)} EGP. A free-shipping threshold can increase basket size.`,
    action: data.totalOrders === 0 ? 'Promote one hero product today.' : 'Add a free-shipping promo bar above your current AOV.',
  });

  return insights;
}
