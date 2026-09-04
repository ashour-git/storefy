import { withTenant } from '../../db';
import * as schema from '../../db/schema';

export async function logAiCall(input: {
  tenantId: string;
  processor: string;
  model: string;
  startedAt: number;
  moderationFlagged?: boolean;
  inputTokens?: number;
  outputTokens?: number;
}) {
  try {
    const latencyMs = Math.max(0, Date.now() - input.startedAt);
    await withTenant(input.tenantId, async (tx) => {
      await tx.insert(schema.aiAgentLogs).values({
        tenantId: input.tenantId,
        processor: input.processor,
        model: input.model.slice(0, 80),
        latencyMs,
        moderationFlagged: input.moderationFlagged || false,
        inputTokens: input.inputTokens ?? null,
        outputTokens: input.outputTokens ?? null,
      });
    });
  } catch (error) {
    console.warn('[ai-logging] failed:', error instanceof Error ? error.message : error);
  }
}
