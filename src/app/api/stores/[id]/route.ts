import { auth } from '../../../../lib/auth';
import { headers } from 'next/headers';
import { db } from '../../../../db';
import * as schema from '../../../../db/schema';
import { eq, and } from 'drizzle-orm';
import { getErrorMessage } from '../../../../lib/errors';

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

export async function PUT(request: Request, context: RouteContext) {
  try {
    const params = await context.params;
    const { id } = params;

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, customDomain, category, defaultLocale, defaultCurrency, taxRate, phone, whatsapp, address, onboardingComplete } = body;

    const trimmedName = typeof name === 'string' ? name.trim() : '';
    const trimmedDomain = typeof customDomain === 'string' ? customDomain.trim().toLowerCase() : '';
    const trimmedCategory = typeof category === 'string' ? category.trim() : '';
    const validLocale = defaultLocale === 'en' || defaultLocale === 'ar' ? defaultLocale : 'ar';
    const validCurrency = defaultCurrency === 'EGP' ? defaultCurrency : 'EGP';
    const validTaxRate = Math.max(0, Math.min(100, Number(taxRate) || 14)).toFixed(2);

    if (!trimmedName) {
      return Response.json({ error: 'Store name is required' }, { status: 400 });
    }

    const updateData: Record<string, any> = {
      name: trimmedName,
      customDomain: trimmedDomain || null,
      category: trimmedCategory || null,
      defaultLocale: validLocale,
      defaultCurrency: validCurrency,
      taxRate: validTaxRate,
    };
    if (phone !== undefined) updateData.phone = phone || null;
    if (whatsapp !== undefined) updateData.whatsapp = whatsapp || null;
    if (address !== undefined) updateData.address = address || null;
    if (onboardingComplete !== undefined) updateData.onboardingComplete = onboardingComplete === true;

    // Verify ownership and update store
    const [updatedStore] = await db.update(schema.tenants)
      .set(updateData)
      .where(
        and(
          eq(schema.tenants.id, id),
          eq(schema.tenants.ownerId, session.user.id)
        )
      )
      .returning();

    if (!updatedStore) {
      return Response.json({ error: 'Store not found or you are not the owner' }, { status: 404 });
    }

    return Response.json({ store: updatedStore });
  } catch (error: unknown) {
    console.error('Error updating store:', error);
    return Response.json({ error: 'Failed to update store', details: getErrorMessage(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const params = await context.params;
    const { id } = params;

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Danger Zone: update status to 'deleted'
    const [deletedStore] = await db.update(schema.tenants)
      .set({ status: 'deleted' })
      .where(
        and(
          eq(schema.tenants.id, id),
          eq(schema.tenants.ownerId, session.user.id)
        )
      )
      .returning();

    if (!deletedStore) {
      return Response.json({ error: 'Store not found or you are not the owner' }, { status: 404 });
    }

    return Response.json({ store: deletedStore, message: 'Store deleted successfully' });
  } catch (error: unknown) {
    console.error('Error deleting store:', error);
    return Response.json({ error: 'Failed to delete store', details: getErrorMessage(error) }, { status: 500 });
  }
}
