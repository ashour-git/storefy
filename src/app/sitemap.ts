import { MetadataRoute } from 'next';
import { db, withTenant } from '../db';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';
import { getStoreUrl } from '../lib/store-utils';

interface SitemapTenant {
  id: string;
  slug: string;
  customDomain: string | null;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://storefy.com';
  const appHost = getHostFromUrl(baseUrl);

  const routes = [
    '',
    '/features',
    '/pricing',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  try {
    const tenants = await db
      .select({
        id: schema.tenants.id,
        slug: schema.tenants.slug,
        customDomain: schema.tenants.customDomain,
      })
      .from(schema.tenants)
      .where(eq(schema.tenants.status, 'active')) as SitemapTenant[];

    const tenantRoutes = await Promise.all(tenants.map(async (tenant) => {
      const url = getStoreUrl(tenant.slug, appHost, tenant.customDomain);
      const products = await withTenant(tenant.id, async (tx) => tx.select().from(schema.products).where(eq(schema.products.status, 'active')).limit(200));
      return [
        { url, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.6 },
        { url: `${url}/search`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.5 },
        { url: `${url}/policies/shipping`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.3 },
        { url: `${url}/policies/returns`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.3 },
        ...products.map((product) => ({
          url: `${url}/product/${product.id}`,
          lastModified: product.updatedAt || new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.55,
        })),
      ];
    }));

    return [...routes, ...tenantRoutes.flat()];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return routes;
  }
}

function getHostFromUrl(url: string) {
  try {
    return new URL(url).host;
  } catch {
    return 'storefy.com';
  }
}
