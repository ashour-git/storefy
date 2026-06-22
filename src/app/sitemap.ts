import { MetadataRoute } from 'next';
import { db } from '../db';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://storefy.com';

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
      .select()
      .from(schema.tenants)
      .where(eq(schema.tenants.status, 'active'));

    const tenantRoutes = tenants.map((tenant) => {
      const url = tenant.customDomain 
        ? `https://${tenant.customDomain}` 
        : `https://${tenant.slug}.storefy.com`;

      return {
        url,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      };
    });

    return [...routes, ...tenantRoutes];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return routes;
  }
}
