import { db, withTenant } from '../../../db';
import * as schema from '../../../db/schema';
import { eq, or } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ThemeRenderer } from '../../../components/storefront/ThemeRenderer';
import { ProductGrid } from '../../../components/storefront/ProductGrid';
import { CartProvider } from '../../../components/storefront/CartProvider';
import { CartDrawer } from '../../../components/storefront/CartDrawer';

interface StorefrontPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: StorefrontPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tenant = await db.query.tenants.findFirst({
    where: or(
      eq(schema.tenants.slug, slug),
      eq(schema.tenants.customDomain, slug)
    ),
  });

  if (!tenant) {
    return {
      title: 'Store Not Found',
    };
  }

  const desc = tenant.description || `Shop premium ${tenant.category || 'products'} at ${tenant.name}.`;

  return {
    title: `${tenant.name} — Online Store`,
    description: desc,
    openGraph: {
      title: tenant.name,
      description: desc,
      type: 'website',
      images: tenant.logo ? [{ url: tenant.logo }] : [],
    },
  };
}

export default async function StorefrontPage({ params }: StorefrontPageProps) {
  const { slug } = await params;

  // Resolve the tenant server-side based on slug or custom domain
  const tenant = await db.query.tenants.findFirst({
    where: or(
      eq(schema.tenants.slug, slug),
      eq(schema.tenants.customDomain, slug)
    ),
  });

  if (!tenant) {
    notFound();
  }

  // Fetch the theme
  const themeRecord = await db.query.themes.findFirst({
    where: eq(schema.themes.tenantId, tenant.id),
  });
  const tokens = themeRecord?.tokens as any || null;

  // Fetch the products under the RLS context using withTenant
  const tenantProducts = await withTenant(tenant.id, async (tx) => {
    return tx.select().from(schema.products);
  });

  return (
    <CartProvider>
      <ThemeRenderer tokens={tokens}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <header className="mb-16 flex flex-col md:flex-row md:items-center md:justify-between border-b border-black/5 pb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[var(--store-primary)] mb-3">
                {tenant.name}
              </h1>
              <p className="text-lg text-[var(--store-text)] opacity-70 max-w-2xl">
                {tenant.description || `Welcome to our official online store. Explore our collection of premium ${tenant.category || 'products'}.`}
              </p>
            </div>
            <div className="mt-6 md:mt-0">
              <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-[var(--store-primary)]/10 text-[var(--store-primary)] font-semibold text-sm">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                Accepting Orders
              </div>
            </div>
          </header>

          <main>
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight">Our Collection</h2>
              <span className="text-sm font-medium text-[var(--store-text)]/60 bg-black/5 px-3 py-1 rounded-full">
                {tenantProducts.length} items
              </span>
            </div>
            
            <ProductGrid products={tenantProducts} storeName={tenant.name} />
          </main>
          
          {/* Cart Drawer Panel */}
          <CartDrawer storeSlug={tenant.slug} />
        </div>
      </ThemeRenderer>
    </CartProvider>
  );
}
