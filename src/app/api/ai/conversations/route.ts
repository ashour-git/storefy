import { auth } from '../../../../lib/auth';
import { headers } from 'next/headers';
import { withTenant } from '../../../../db';
import * as schema from '../../../../db/schema';
import { and, count, eq, desc } from 'drizzle-orm';
import { fail, ok, paginate, parsePagination, toPublicError } from '../../../../lib/api/contract';
import { getActiveStoreFromRequest } from '../../../../lib/admin/active-store';

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return fail('UNAUTHORIZED', 'Unauthorized', 401);

    const store = await getActiveStoreFromRequest(request, session.user.id);
    if (!store) return fail('NOT_FOUND', 'No store found', 404);

    const { page, pageSize } = parsePagination(request.url);
    const result = await withTenant(store.id, async (tx) => {
      const [{ total }] = await tx.select({ total: count() })
        .from(schema.aiConversations)
        .where(and(eq(schema.aiConversations.tenantId, store.id), eq(schema.aiConversations.channel, 'dashboard')));
      const rows = await tx.select()
        .from(schema.aiConversations)
        .where(and(eq(schema.aiConversations.tenantId, store.id), eq(schema.aiConversations.channel, 'dashboard')))
        .orderBy(desc(schema.aiConversations.createdAt))
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      const mapped = rows.map((c) => {
        const msgs = (c.messages ?? []) as Array<{ role: string; content: string }>;
        const firstUser = msgs.find((m) => m.role === 'user');
        const title = typeof c.title === 'string' && c.title ? c.title : firstUser ? firstUser.content.slice(0, 50) : 'Untitled';
        return { id: c.id, title, createdAt: c.createdAt, messages: msgs.slice(-2) };
      });

      return paginate(mapped, total ?? 0, page, pageSize);
    });

    return ok(result);
  } catch (error: unknown) {
    console.error('[ai/conversations] failed:', error instanceof Error ? error.message : error);
    return fail('INTERNAL_ERROR', toPublicError(error), 500);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return fail('UNAUTHORIZED', 'Unauthorized', 401);

    const store = await getActiveStoreFromRequest(request, session.user.id);
    if (!store) return fail('NOT_FOUND', 'No store found', 404);

    const body = await request.json() as { id?: string; title?: string; messages: Array<{ role: string; content: string }> };
    if (!Array.isArray(body.messages) || body.messages.length === 0 || body.messages.length > 50) {
      return fail('VALIDATION_ERROR', 'Messages must be a non-empty array of at most 50 entries', 422);
    }
    for (const m of body.messages) {
      if (!m || (m.role !== 'user' && m.role !== 'assistant') || typeof m.content !== 'string' || m.content.length > 4000) {
        return fail('VALIDATION_ERROR', 'Each message needs a user/assistant role and content up to 4000 chars', 422);
      }
    }

    const result = await withTenant(store.id, async (tx) => {
      if (body.id) {
        const updateData: Record<string, unknown> = { messages: body.messages };
        if (body.title) updateData.title = body.title;
        await tx.update(schema.aiConversations)
          .set(updateData)
          .where(eq(schema.aiConversations.id, body.id));

        const [updated] = await tx.select()
          .from(schema.aiConversations)
          .where(eq(schema.aiConversations.id, body.id));

        return { conversation: { id: updated.id, title: updated.title, createdAt: updated.createdAt } };
      }

      const [inserted] = await tx.insert(schema.aiConversations)
        .values({ tenantId: store.id, channel: 'dashboard', messages: body.messages, title: body.title ?? null })
        .returning({ id: schema.aiConversations.id, title: schema.aiConversations.title, createdAt: schema.aiConversations.createdAt });

      return { conversation: { id: inserted.id, title: inserted.title, createdAt: inserted.createdAt } };
    });

    return ok(result, body.id ? 200 : 201);
  } catch (error: unknown) {
    console.error('[ai/conversations] write failed:', error instanceof Error ? error.message : error);
    return fail('INTERNAL_ERROR', toPublicError(error), 500);
  }
}
