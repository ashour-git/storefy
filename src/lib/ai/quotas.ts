import { and, count, eq, gte } from 'drizzle-orm';
import { withTenant } from '../../db';
import * as schema from '../../db/schema';
import { getAiPlan } from './plans';

export async function getMonthlyUsage(tenantId: string, plan: string | null | undefined): Promise<{ used: number; limit: number }> {
  const result = await checkMonthlyQuota(tenantId, plan);
  return { used: result.used, limit: result.limit };
}

export async function checkMonthlyQuota(tenantId: string, plan: string | null | undefined): Promise<{ allowed: boolean; used: number; limit: number }> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const aiPlan = getAiPlan(plan);
  const { used } = await withTenant(tenantId, async (tx) => {
    const [row] = await tx.select({ count: count() })
      .from(schema.aiAgentLogs)
      .where(and(eq(schema.aiAgentLogs.tenantId, tenantId), gte(schema.aiAgentLogs.createdAt, startOfMonth)));
    return { used: row?.count ?? 0 };
  });
  return { allowed: used < aiPlan.monthlyGenerations, used, limit: aiPlan.monthlyGenerations };
}
