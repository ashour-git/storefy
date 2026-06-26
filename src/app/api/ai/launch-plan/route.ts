import { db } from '../../../../db';
import * as schema from '../../../../db/schema';
import { aiProvider } from '../../../../lib/providers/ai';
import { getOwnedStore } from '../../../../lib/admin/store-access';
import { buildLaunchPlan } from '../../../../lib/launch-plan';
import { getErrorMessage } from '../../../../lib/errors';

export async function POST(request: Request) {
  try {
    const { session, store } = await getOwnedStore();
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!store) return Response.json({ error: 'No store found' }, { status: 404 });
    const body = await request.json() as { audience?: string; goal?: string; channels?: string[]; products?: string[] };
    const locale = store.defaultLocale === 'ar' ? 'ar' : 'en';
    const fallback = buildLaunchPlan({ storeName: store.name, category: store.category, locale, ...body });

    const generated = await aiProvider.generateBusinessInsights({
      storeName: store.name,
      category: store.category,
      locale,
      storeData: fallback,
      question: `Create a launch operating plan for audience ${body.audience || 'local customers'} and goal ${body.goal || 'first 10 orders'}`,
    });

    await db.insert(schema.auditLog).values({
      tenantId: store.id,
      actorId: session.user.id,
      action: 'ai_launch_plan_generated',
      entity: 'tenant',
      entityId: store.id,
      diff: { input: body },
    }).catch(() => undefined);

    return Response.json({ plan: fallback, insights: generated.insights });
  } catch (error) {
    return Response.json({ error: getErrorMessage(error) }, { status: 400 });
  }
}
