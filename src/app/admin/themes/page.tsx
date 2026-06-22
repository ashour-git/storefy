import { auth } from '../../../lib/auth';
import { headers } from 'next/headers';
import { db, withTenant } from '../../../db';
import * as schema from '../../../db/schema';
import { eq, and } from 'drizzle-orm';
import { ThemeCustomizer } from '../../../components/admin/ThemeCustomizer';

export default async function ThemesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const userStores = await db
    .select()
    .from(schema.tenants)
    .where(eq(schema.tenants.ownerId, session.user.id));
  
  const store = userStores[0];

  if (!store) {
    return (
      <div className="admin-page">
        <div className="admin-empty-state">
          <div className="admin-empty-icon">⚙️</div>
          <h1 className="admin-empty-title">No Store Found</h1>
          <p className="admin-empty-desc">Create a store first to customize themes.</p>
          <a href="/admin/stores/new" className="btn-primary" style={{ marginTop: 16 }}>Create Store →</a>
        </div>
      </div>
    );
  }

  // Fetch the current theme, index page, and real products inside the RLS context
  const { themeRecord, pageRecord, products } = await withTenant(store.id, async (tx) => {
    const theme = await tx.query.themes.findFirst({
      where: eq(schema.themes.tenantId, store.id),
    });
    
    const page = await tx.query.pages.findFirst({
      where: and(
        eq(schema.pages.tenantId, store.id),
        eq(schema.pages.slug, 'index')
      ),
    });
    
    const prods = await tx
      .select()
      .from(schema.products)
      .where(eq(schema.products.status, 'active'));

    return { 
      themeRecord: theme || null, 
      pageRecord: page || null, 
      products: prods || [] 
    };
  });

  return (
    <ThemeCustomizer 
      store={store}
      initialTheme={themeRecord}
      initialPage={pageRecord}
      products={products}
    />
  );
}
