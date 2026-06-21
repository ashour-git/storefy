import { db, withTenant } from '../../../db';
import * as schema from '../../../db/schema';
import { eq, or } from 'drizzle-orm';
import { notFound } from 'next/navigation';

interface StorefrontPageProps {
  params: Promise<{
    slug: string;
  }>;
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

  // Fetch the products under the RLS context using withTenant
  const tenantProducts = await withTenant(tenant.id, async (tx) => {
    return tx.select().from(schema.products);
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-indigo-400">
          {tenant.name}
        </h1>
        <p className="text-slate-400 text-lg">
          Category: {tenant.category || 'General'}
        </p>
        <p className="text-xs text-indigo-500 font-mono mt-2">
          Tenant ID: {tenant.id}
        </p>
      </header>

      <main className="w-full max-w-4xl">
        <h2 className="text-2xl font-bold mb-6 text-slate-300">Products</h2>
        {tenantProducts.length === 0 ? (
          <p className="text-slate-500 italic">No products found for this store.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tenantProducts.map((product) => (
              <div
                key={product.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-indigo-500/50 transition-all duration-300 shadow-xl"
              >
                <h3 className="text-xl font-bold text-indigo-300 mb-2">
                  {product.name}
                </h3>
                <p className="text-slate-400 mb-4 text-sm line-clamp-2">
                  {product.description || 'No description available.'}
                </p>
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-slate-500">Price</span>
                  <span className="text-indigo-400">
                    {product.basePrice} {product.currency}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
