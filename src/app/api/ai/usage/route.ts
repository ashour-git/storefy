import { auth } from '../../../../lib/auth';
import { headers } from 'next/headers';
import { db, withTenant } from '../../../../db';
import * as schema from '../../../../db/schema';
import { eq, count, and, gte } from 'drizzle-orm';
import { getAiPlan } from '../../../../lib/ai/plans';
import { getErrorMessage } from '../../../../lib/errors';

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const stores = await db.select().from(schema.tenants).where(eq(schema.tenants.ownerId, session.user.id));
    const store = stores[0];
    if (!store) return Response.json({ error: 'No store found' }, { status: 404 });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const { used } = await withTenant(store.id, async (tx) => {
      const [row] = await tx.select({ count: count() })
        .from(schema.aiAgentLogs)
        .where(and(eq(schema.aiAgentLogs.tenantId, store.id), gte(schema.aiAgentLogs.createdAt, startOfMonth)));

      return { used: row?.count ?? 0 };
    });

    const aiPlan = getAiPlan(store.plan);

    return Response.json({ used, limit: aiPlan.monthlyGenerations });
  } catch (error: unknown) {
    return Response.json({ error: getErrorMessage(error), details: getErrorMessage(error) }, { status: 500 });
  }
}
