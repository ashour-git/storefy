import { auth } from '../../../lib/auth';
import { headers } from 'next/headers';
import { db, withTenant } from '../../../db';
import * as schema from '../../../db/schema';
import { eq, and } from 'drizzle-orm';
import { ThemeCustomizer } from '../../../components/admin/ThemeCustomizer';

export default async function ThemesPage() {
  let session;
  try {
    session = await auth.api.getSession({ headers: await headers() });
  } catch (e) {
    console.error('[themes/page] Session check failed:', e);
    return <div className="admin-page"><div className="admin-empty-state"><h1 className="admin-empty-title">Session Error</h1><p className="admin-empty-desc">Could not verify your session.</p><a href="/" className="btn-primary" style={{ marginTop: 16 }}>Go Home</a></div></div>;
  }
  if (!session) return null;

  let store;
  try {
    const userStores = await db.select().from(schema.tenants).where(eq(schema.tenants.ownerId, session.user.id));
    store = userStores[0];
  } catch (e) {
    console.error('[themes/page] Failed to fetch stores:', e);
    return <div className="admin-page"><div className="admin-empty-state"><h1 className="admin-empty-title">Database Error</h1><p className="admin-empty-desc">Could not load your stores.</p><a href="/" className="btn-primary" style={{ marginTop: 16 }}>Go Home</a></div></div>;
  }

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

  let themeRecord = null;
  let pageRecord = null;
  let products: any[] = [];
  try {
    const data = await withTenant(store.id, async (tx) => {
      const theme = await tx.query.themes.findFirst({
        where: eq(schema.themes.tenantId, store.id),
      });
      const page = await tx.query.pages.findFirst({
        where: and(
          eq(schema.pages.tenantId, store.id),
          eq(schema.pages.slug, 'index')
        ),
      });
      const prods = await tx.select().from(schema.products).where(eq(schema.products.status, 'active'));
      return { themeRecord: theme || null, pageRecord: page || null, products: prods || [] };
    });
    themeRecord = data.themeRecord;
    pageRecord = data.pageRecord;
    products = data.products;
  } catch (e) {
    console.error('[themes/page] Failed to fetch theme data:', e);
  }

  return (
    <ThemeCustomizer 
      store={store}
      initialTheme={themeRecord}
      initialPage={pageRecord}
      products={products}
    />
  );
}
