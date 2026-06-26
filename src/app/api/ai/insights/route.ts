import { auth } from '../../../../lib/auth';
import { headers } from 'next/headers';
import { aiProvider, type BusinessInsight } from '../../../../lib/providers/ai';
import { getAiPlan } from '../../../../lib/ai/plans';
import { logAiCall } from '../../../../lib/ai/logging';
import { getErrorMessage } from '../../../../lib/errors';
import { getActiveStoreFromRequest } from '../../../../lib/admin/active-store';
import { getStoreMetrics, type StoreMetrics } from '../../../../lib/admin/store-metrics';

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

    const storeData = await getStoreMetrics(store.id);
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

function generateMockInsights(data: StoreMetrics, storeName: string): BusinessInsight[] {
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
