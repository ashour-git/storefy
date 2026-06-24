import { auth } from '../../../../lib/auth';
import { headers } from 'next/headers';
import { db, withTenant } from '../../../../db';
import * as schema from '../../../../db/schema';
import { eq, desc } from 'drizzle-orm';
import { getErrorMessage } from '../../../../lib/errors';

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const stores = await db.select().from(schema.tenants).where(eq(schema.tenants.ownerId, session.user.id));
    const store = stores[0];
    if (!store) return Response.json({ error: 'No store found' }, { status: 404 });

    const { conversations, total } = await withTenant(store.id, async (tx) => {
      const rows = await tx.select()
        .from(schema.aiConversations)
        .where(eq(schema.aiConversations.channel, 'dashboard'))
        .orderBy(desc(schema.aiConversations.createdAt));

      const mapped = rows.map((c) => {
        const msgs = (c.messages ?? []) as Array<{ role: string; content: string }>;
        const firstUser = msgs.find((m) => m.role === 'user');
        const title = firstUser ? firstUser.content.slice(0, 50) : 'Untitled';
        return { id: c.id, title, createdAt: c.createdAt, messages: msgs.slice(-2) };
      });

      return { conversations: mapped, total: mapped.length };
    });

    return Response.json({ conversations, total });
  } catch (error: unknown) {
    return Response.json({ error: getErrorMessage(error), details: getErrorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const stores = await db.select().from(schema.tenants).where(eq(schema.tenants.ownerId, session.user.id));
    const store = stores[0];
    if (!store) return Response.json({ error: 'No store found' }, { status: 404 });

    const body = await request.json() as { id?: string; title?: string; messages: Array<{ role: string; content: string }> };
    if (!body.messages) return Response.json({ error: 'Messages are required' }, { status: 400 });

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

    return Response.json(result);
  } catch (error: unknown) {
    return Response.json({ error: getErrorMessage(error), details: getErrorMessage(error) }, { status: 500 });
  }
}
