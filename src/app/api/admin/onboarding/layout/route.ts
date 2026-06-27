import { NextResponse } from 'next/server';
import { auth } from '../../../../../lib/auth';
import { headers } from 'next/headers';
import { generateStoreLayout } from '../../../../../lib/ai/layout';
import { db } from '../../../../../db';
import * as schema from '../../../../../db/schema';
import { eq } from 'drizzle-orm';
import { getActiveStore } from '../../../../../lib/admin/active-store';

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const store = await getActiveStore(session.user.id);
  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

  const { category, businessDescription, locale = 'en' } = await req.json();
  if (!category || !businessDescription) {
    return NextResponse.json({ error: 'Category and description required' }, { status: 400 });
  }

  try {
    const layoutData = await generateStoreLayout(category, businessDescription, locale);
    
    // Save to themes and pages
    const [theme] = await db.insert(schema.themes).values({
      tenantId: store.id,
      name: `${store.name} AI Theme`,
      tokens: layoutData.tokens,
      active: true,
    }).returning();

    await db.insert(schema.pages).values({
      tenantId: store.id,
      slug: 'index',
      title: 'Home',
      blocks: layoutData.blocks,
      template: 'index',
      status: 'published'
    }).onConflictDoUpdate({
      target: [schema.pages.tenantId, schema.pages.slug],
      set: { blocks: layoutData.blocks, updatedAt: new Date() }
    });

    return NextResponse.json({ success: true, themeId: theme.id, layoutData });
  } catch (error: any) {
    console.error('AI Layout Gen Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
