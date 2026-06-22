import { auth } from '../../../lib/auth';
import { headers } from 'next/headers';
import { db, withTenant } from '../../../db';
import * as schema from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { getTemplateById, getTemplateForVertical } from '../../../lib/storefront/templates';
import { getErrorMessage } from '../../../lib/errors';

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, category, templateId, locale } = body;

    const trimmedName = typeof name === 'string' ? name.trim() : '';
    const trimmedSlug = typeof slug === 'string' ? slug.trim().toLowerCase() : '';
    const trimmedCategory = typeof category === 'string' ? category.trim() : '';
    const defaultLocale = locale === 'en' ? 'en' : 'ar';
    const template = typeof templateId === 'string' ? getTemplateById(templateId) : getTemplateForVertical(trimmedCategory);

    if (!trimmedName || !trimmedSlug) {
      return Response.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    if (trimmedSlug.length < 3 || trimmedSlug.length > 40) {
      return Response.json({ error: 'Store URL (slug) must be between 3 and 40 characters' }, { status: 400 });
    }

    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(trimmedSlug)) {
      return Response.json({ 
        error: 'Store URL must contain only lowercase letters, numbers, and hyphens (no leading, trailing, or double hyphens)' 
      }, { status: 400 });
    }

    const reservedSlugs = ['admin', 'api', 'app', 'store', 'www', 'static', 'assets', 'public', 'main', 'theme', 'auth'];
    if (reservedSlugs.includes(trimmedSlug)) {
      return Response.json({ error: 'This URL is reserved and cannot be used' }, { status: 400 });
    }

    // Limit: max 3 stores per user
    const existingStores = await db.select().from(schema.tenants).where(eq(schema.tenants.ownerId, session.user.id));
    if (existingStores.length >= 3) {
      return Response.json({ error: 'You have reached the maximum limit of 3 stores.' }, { status: 400 });
    }

    // Check slug uniqueness
    const existing = await db.select().from(schema.tenants).where(eq(schema.tenants.slug, trimmedSlug));
    if (existing.length > 0) {
      return Response.json({ error: 'This store URL is already taken' }, { status: 409 });
    }

    // Create tenant
    const [tenant] = await db.insert(schema.tenants).values({
      slug: trimmedSlug,
      name: trimmedName,
      category: trimmedCategory || null,
      defaultLocale,
      ownerId: session.user.id,
    }).returning();

    // Create tenant member (owner)
    await withTenant(tenant.id, async (tx) => {
      await tx.insert(schema.tenantMembers).values({
        tenantId: tenant.id,
        userId: session.user.id,
        role: 'owner',
      });

      await tx.insert(schema.themes).values({
        tenantId: tenant.id,
        tokens: template.tokens,
        active: true,
      });

      await tx.insert(schema.pages).values({
        tenantId: tenant.id,
        slug: 'index',
        blocks: template.blocks,
      });

      for (const demoProduct of template.demoProducts) {
        const [product] = await tx.insert(schema.products).values({
          tenantId: tenant.id,
          name: demoProduct.name[defaultLocale],
          description: demoProduct.description[defaultLocale],
          basePrice: demoProduct.basePrice,
          currency: 'EGP',
          status: 'active',
          images: demoProduct.image ? [demoProduct.image] : [],
        }).returning();

        await tx.insert(schema.productVariants).values({
          tenantId: tenant.id,
          productId: product.id,
          sku: demoProduct.sku,
          stockQty: demoProduct.stockQty,
        });
      }
    });

    return Response.json({ store: tenant, templateId: template.id }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating store:', error);
    return Response.json({ error: 'Failed to create store', details: getErrorMessage(error) }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stores = await db
      .select()
      .from(schema.tenants)
      .where(eq(schema.tenants.ownerId, session.user.id));

    return Response.json({ stores });
  } catch (error: unknown) {
    console.error('Error fetching stores:', error);
    return Response.json({ error: 'Failed to fetch stores', details: getErrorMessage(error) }, { status: 500 });
  }
}
