import { auth } from '../../../../lib/auth';
import { headers } from 'next/headers';
import { db, withTenant } from '../../../../db';
import * as schema from '../../../../db/schema';
import { eq, and } from 'drizzle-orm';
import { getErrorMessage } from '../../../../lib/errors';

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { storeId, tokens, blocks } = body;

    if (!storeId) {
      return Response.json({ error: 'storeId is required' }, { status: 400 });
    }

    // Verify ownership of the store
    const store = await db.query.tenants.findFirst({
      where: and(
        eq(schema.tenants.id, storeId),
        eq(schema.tenants.ownerId, session.user.id)
      )
    });

    if (!store) {
      return Response.json({ error: 'Store not found or access denied' }, { status: 403 });
    }

    // Write RLS-scoped theme and index page configuration
    await withTenant(storeId, async (tx) => {
      // 1. Theme configuration (colors, typography, spacing)
      const existingTheme = await tx.query.themes.findFirst({
        where: eq(schema.themes.tenantId, storeId),
      });

      if (existingTheme) {
        await tx
          .update(schema.themes)
          .set({ tokens: tokens || {} })
          .where(eq(schema.themes.id, existingTheme.id));
      } else {
        await tx
          .insert(schema.themes)
          .values({
            tenantId: storeId,
            tokens: tokens || {},
            active: true
          });
      }

      // 2. Homepage layout blocks configuration
      const existingPage = await tx.query.pages.findFirst({
        where: and(
          eq(schema.pages.tenantId, storeId),
          eq(schema.pages.slug, 'index')
        ),
      });

      if (existingPage) {
        await tx
          .update(schema.pages)
          .set({ blocks: blocks || [] })
          .where(eq(schema.pages.id, existingPage.id));
      } else {
        await tx
          .insert(schema.pages)
          .values({
            tenantId: storeId,
            slug: 'index',
            blocks: blocks || []
          });
      }
    });

    return Response.json({ success: true });
  } catch (error: unknown) {
    console.error('Error saving store customizations:', error);
    return Response.json({ error: 'Failed to save layout customizations', details: getErrorMessage(error) }, { status: 500 });
  }
}
