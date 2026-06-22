import { withTenant } from '../../db';
import * as schema from '../../db/schema';

export async function logAiCall(input: {
  tenantId: string;
  processor: string;
  model: string;
  startedAt: number;
  moderationFlagged?: boolean;
}) {
  await withTenant(input.tenantId, async (tx) => {
    await tx.insert(schema.aiAgentLogs).values({
      tenantId: input.tenantId,
      processor: input.processor,
      model: input.model,
      latencyMs: Date.now() - input.startedAt,
      moderationFlagged: input.moderationFlagged || false,
    });
  });
}
