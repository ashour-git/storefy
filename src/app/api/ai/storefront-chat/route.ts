import { withTenant } from '../../../../db';
import * as schema from '../../../../db/schema';
import { and, eq } from 'drizzle-orm';
import { aiProvider } from '../../../../lib/providers/ai';
import { chunksToContext, rebuildTenantKnowledge, retrieveTenantKnowledge } from '../../../../lib/ai/knowledge';
import { logAiCall } from '../../../../lib/ai/logging';
import { moderateAgentInput } from '../../../../lib/ai/safety';
import { getAiPlan } from '../../../../lib/ai/plans';
import { resolveTenantBySlugOrDomain } from '../../../../lib/tenancy';
import { getErrorMessage } from '../../../../lib/errors';
import { rateLimiter } from '../../../../lib/providers/rate-limit';

interface ChatRequestBody {
  storeSlug?: string;
  message?: string;
  conversationId?: string;
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  try {
    const body = await request.json() as ChatRequestBody;
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    const storeSlug = typeof body.storeSlug === 'string' ? body.storeSlug.trim() : '';

    if (!storeSlug || !message) {
      return Response.json({ error: 'storeSlug and message are required' }, { status: 400 });
    }

    if (message.length > 1000) {
      return Response.json({ error: 'Message is too long' }, { status: 400 });
    }

    const tenant = await resolveTenantBySlugOrDomain(storeSlug);
    if (!tenant) return Response.json({ error: 'Store not found' }, { status: 404 });

    const aiPlan = getAiPlan(tenant.plan);
    if (!aiPlan.storefrontAgent) {
      return Response.json({ error: 'Storefront AI agent is not enabled for this plan' }, { status: 403 });
    }

    const limit = await rateLimiter.check(`ai-storefront-chat:${tenant.id}`, 20, 60_000);
    if (!limit.allowed) {
      return Response.json({ error: 'Too many AI chat requests. Please wait a moment.' }, { status: 429 });
    }

    const moderation = moderateAgentInput(message);
    if (!moderation.allowed) {
      await logAiCall({ tenantId: tenant.id, processor: 'storefront_rag_agent', model: 'safety-rules', startedAt, moderationFlagged: true });
      return Response.json({ answer: tenant.defaultLocale === 'ar' ? 'لا أستطيع المساعدة في هذا الطلب، لكن يمكنني مساعدتك في المنتجات أو الطلبات أو سياسات المتجر.' : 'I cannot help with that request, but I can help with products, orders, or store policies.', sources: [] });
    }

    let chunks = await retrieveTenantKnowledge(tenant.id, message);
    if (chunks.length === 0) {
      await rebuildTenantKnowledge(tenant.id);
      chunks = await retrieveTenantKnowledge(tenant.id, message);
    }

    const previousMessages = body.conversationId
      ? await withTenant(tenant.id, async (tx) => {
          const convo = await tx.query.aiConversations.findFirst({
            where: and(
              eq(schema.aiConversations.id, body.conversationId || ''),
              eq(schema.aiConversations.tenantId, tenant.id),
            ),
          });
          const messages = Array.isArray(convo?.messages) ? convo.messages : [];
          return messages.filter((entry): entry is { role: 'user' | 'assistant'; content: string } => {
            return typeof entry === 'object' && entry !== null && 'role' in entry && 'content' in entry;
          });
        })
      : [];

    const locale = tenant.defaultLocale === 'ar' ? 'ar' : 'en';
    const result = await aiProvider.answerStorefront({
      storeName: tenant.name,
      category: tenant.category,
      locale,
      question: message,
      context: chunksToContext(chunks),
      conversation: previousMessages,
    });

    const messages = [...previousMessages, { role: 'user' as const, content: message }, { role: 'assistant' as const, content: result.answer }];
    let conversationId = body.conversationId || null;

    await withTenant(tenant.id, async (tx) => {
      if (conversationId) {
        await tx.update(schema.aiConversations).set({ messages }).where(and(
          eq(schema.aiConversations.id, conversationId),
          eq(schema.aiConversations.tenantId, tenant.id),
        ));
      } else {
        const [conversation] = await tx.insert(schema.aiConversations).values({
          tenantId: tenant.id,
          channel: 'storefront_chat',
          messages,
        }).returning();
        conversationId = conversation.id;
      }
    });

    await logAiCall({ tenantId: tenant.id, processor: 'storefront_rag_agent', model: 'openai/gpt-oss-120b-or-mock', startedAt });

    return Response.json({ answer: result.answer, sources: chunks.map((chunk) => ({ id: chunk.id, type: chunk.sourceType })), conversationId });
  } catch (error: unknown) {
    return Response.json({ error: 'AI agent failed', details: getErrorMessage(error) }, { status: 500 });
  }
}
