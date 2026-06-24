import { db } from '../../../../db';
import * as schema from '../../../../db/schema';
import { eq } from 'drizzle-orm';

const RESERVED_SLUGS = ['admin', 'api', 'app', 'store', 'www', 'static', 'assets', 'public', 'main', 'theme', 'auth'];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug')?.trim().toLowerCase();

    if (!slug || slug.length < 3) {
      return Response.json({ available: false, reason: 'too-short', message: 'Must be at least 3 characters' });
    }

    if (slug.length > 40) {
      return Response.json({ available: false, reason: 'too-long', message: 'Must be under 40 characters' });
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return Response.json({ available: false, reason: 'invalid-format', message: 'Only lowercase letters, numbers, and hyphens' });
    }

    if (RESERVED_SLUGS.includes(slug)) {
      return Response.json({ available: false, reason: 'reserved', message: 'This URL is reserved' });
    }

    const existing = await db.select({ id: schema.tenants.id }).from(schema.tenants).where(eq(schema.tenants.slug, slug));

    if (existing.length > 0) {
      const suggestion = `${slug}-${Math.floor(Math.random() * 99) + 1}`;
      return Response.json({ available: false, reason: 'taken', message: 'Already taken', suggestion });
    }

    return Response.json({ available: true });
  } catch {
    return Response.json({ available: false, reason: 'error', message: 'Could not verify availability' });
  }
}
