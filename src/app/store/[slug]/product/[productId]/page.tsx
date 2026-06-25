import { withTenant } from '../../../../../db';
import * as schema from '../../../../../db/schema';
import { and, eq } from 'drizzle-orm';
import { Suspense } from "react";
import { notFound } from 'next/navigation';
import { ThemeRenderer, type ThemeTokens } from '../../../../../components/storefront/ThemeRenderer';
import { CartProvider } from '../../../../../components/storefront/CartProvider';
import { CartDrawer } from '../../../../../components/storefront/CartDrawer';
import { Skeleton } from "../../../../../components/ui/Skeleton";
import { AddToCartButton } from '../../../../../components/storefront/AddToCartButton';
import { ProductImagePlaceholder } from '../../../../../components/storefront/ProductImagePlaceholder';
import { StorefrontAnalytics } from '../../../../../components/storefront/StorefrontAnalytics';
import { ReviewForm } from '../../../../../components/storefront/ReviewForm';
import { ProductJsonLd, BreadcrumbJsonLd } from '../../../../../components/storefront/JsonLd';
import { resolveTenantBySlugOrDomain } from '../../../../../lib/tenancy';
import { getStoreUrl } from '../../../../../lib/store-utils';
import { getTemplateForVertical } from '../../../../../lib/storefront/templates';
import { summarizeReviews } from '../../../../../lib/launch-os';
import type { Locale } from '../../../../../lib/i18n';
import type { Metadata } from 'next';

interface ProductPageProps {
  params: Promise<{ slug: string; productId: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug, productId } = await params;
  let tenant;
  try {
    tenant = await resolveTenantBySlugOrDomain(slug);
  } catch (e) {
    console.error('[store/product] generateMetadata tenant lookup failed:', e);
    return { title: 'Product not found' };
  }
  if (!tenant) return { title: 'Product not found' };
  const product = await withTenant(tenant.id, (tx) => tx.query.products.findFirst({ where: and(eq(schema.products.id, productId), eq(schema.products.tenantId, tenant.id), eq(schema.products.status, 'active')) })).catch(() => null);
  if (!product) return { title: 'Product not found' };
  const imageUrls = product.images as string[] | undefined;
  const description = product.description || `Shop ${product.name} from ${tenant.name}.`;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://storefy.com';
  const storeUrl = getStoreUrl(tenant.slug, baseUrl, tenant.customDomain);
  return {
    title: `${product.name} - ${tenant.name}`,
    description,
    openGraph: { title: product.name, description, type: 'website', images: imageUrls?.[0] ? [{ url: imageUrls[0] }] : [] },
    twitter: { card: 'summary_large_image', title: product.name, description, images: imageUrls?.[0] ? [imageUrls[0]] : [] },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug, productId } = await params;
  let tenant;
  try {
    tenant = await resolveTenantBySlugOrDomain(slug);
  } catch (e) {
    console.error('[store/product] Tenant lookup failed:', e);
    notFound();
  }
  if (!tenant) notFound();

  const locale: Locale = tenant.defaultLocale === 'ar' ? 'ar' : 'en';
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const fallbackTemplate = getTemplateForVertical(tenant.category);

  let themeRecord = null;
  let product = null;
  let relatedProducts: any[] = [];
  let reviews: any[] = [];
  try {
    const data = await withTenant(tenant.id, async (tx) => {
      const theme = await tx.query.themes.findFirst({ where: eq(schema.themes.tenantId, tenant.id) });
      const currentProduct = await tx.query.products.findFirst({
        where: and(
          eq(schema.products.id, productId),
          eq(schema.products.tenantId, tenant.id),
          eq(schema.products.status, 'active'),
        ),
      });
      const allActive = await tx.select({
        id: schema.products.id,
        name: schema.products.name,
        basePrice: schema.products.basePrice,
        currency: schema.products.currency,
        categoryId: schema.products.categoryId,
      }).from(schema.products).where(and(eq(schema.products.status, 'active'), eq(schema.products.tenantId, tenant.id)));
      const related = allActive
        .filter((item) => item.id !== productId)
        .sort((a) => a.categoryId === currentProduct?.categoryId ? -1 : 0)
        .slice(0, 4);
      const approvedReviews = await tx.select().from(schema.productReviews).where(and(eq(schema.productReviews.productId, productId), eq(schema.productReviews.tenantId, tenant.id), eq(schema.productReviews.status, 'approved'))).limit(20);
      return { themeRecord: theme, product: currentProduct, relatedProducts: related.filter((item) => item.id !== productId), reviews: approvedReviews };
    });
    themeRecord = data.themeRecord;
    product = data.product;
    relatedProducts = data.relatedProducts;
    reviews = data.reviews;
  } catch (e) {
    console.error('[store/product] Failed to fetch product data:', e);
    notFound();
  }

  if (!product) notFound();

  const tokens = (themeRecord?.tokens || fallbackTemplate.tokens) as ThemeTokens;
  const imageUrls = product.images as string[] | undefined;
  const mainImage = imageUrls?.[0];
  const reviewSummary = summarizeReviews(reviews);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://storefy.com';
  const storeUrl = getStoreUrl(tenant.slug, baseUrl, tenant.customDomain);
  const productUrl = `${storeUrl}/product/${product.id}`;

  return (
    <CartProvider>
      <ThemeRenderer tokens={tokens}>
        <ProductJsonLd
          name={product.name}
          description={product.description || `${product.name} from ${tenant.name}`}
          image={mainImage}
          price={Number(product.basePrice)}
          currency={product.currency}
          rating={reviewSummary.count > 0 ? reviewSummary.average : undefined}
          reviewCount={reviewSummary.count > 0 ? reviewSummary.count : undefined}
          storeName={tenant.name}
          storeUrl={storeUrl}
          productUrl={productUrl}
        />
        <BreadcrumbJsonLd
          items={[
            { name: tenant.name, url: storeUrl },
            { name: product.name, url: productUrl },
          ]}
        />
        <div className="storefront-page" dir={dir} lang={locale}>
          <header className="storefront-header">
            <div className="store-shell storefront-nav">
              <a href={`/store/${tenant.slug}`} className="storefront-logo">{tenant.name}</a>
              <a href={`/store/${tenant.slug}`} className="storefront-status-pill">{locale === 'ar' ? 'العودة للمتجر' : 'Back to store'}</a>
            </div>
          </header>

          <main className="store-section">
            <div className="store-shell store-product-detail">
              <div className="store-product-detail-media">
                {mainImage ? <img src={mainImage} alt={product.name} loading="lazy" /> : <ProductImagePlaceholder name={product.name} />}
              </div>
              <div className="store-product-detail-copy">
                <p className="store-eyebrow">{tenant.category || (locale === 'ar' ? 'منتج مختار' : 'Featured product')}</p>
                <h1>{product.name}</h1>
                <div className="store-review-summary">{reviewSummary.count > 0 ? `${reviewSummary.average}/5 (${reviewSummary.count})` : (locale === 'ar' ? 'لا توجد تقييمات بعد' : 'No reviews yet')}</div>
                <p>{product.description || (locale === 'ar' ? 'منتج جاهز للطلب من هذا المتجر.' : 'A launch-ready product from this store.')}</p>
                <strong>{Number(product.basePrice).toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-EG')} {product.currency}</strong>
                <AddToCartButton product={{ id: product.id, name: product.name, basePrice: product.basePrice, currency: product.currency, image: mainImage }} locale={locale} />
              </div>
            </div>

            <div className="store-shell store-reviews-section">
              <div className="store-section-header compact"><h2>{locale === 'ar' ? 'تقييمات العملاء' : 'Customer reviews'}</h2></div>
              <div className="store-reviews-grid">
                <div>
                  {reviews.length === 0 ? <p>{locale === 'ar' ? 'كن أول من يكتب تقييم بعد تجربة المنتج.' : 'Be the first to review this product after trying it.'}</p> : reviews.map((review) => <article key={review.id} className="store-review-card"><strong>{review.rating}/5 · {review.authorName}</strong><h3>{review.title}</h3><p>{review.body}</p></article>)}
                </div>
                <ReviewForm storeSlug={tenant.slug} productId={product.id} locale={locale} />
              </div>
            </div>

            {relatedProducts.length > 0 && (
              <div className="store-shell store-related-products">
                <h2>{locale === 'ar' ? 'منتجات أخرى قد تعجبك' : 'You may also like'}</h2>
                <div className="store-related-grid">
                  {relatedProducts.map((item) => (
                    <a key={item.id} href={`/store/${tenant.slug}/product/${item.id}`} className="store-related-card">
                      <span>{item.name}</span>
                      <strong>{Number(item.basePrice).toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-EG')} {item.currency}</strong>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </main>

          <Suspense fallback={<Skeleton style={{ position: "fixed", bottom: 24, left: 24, width: 48, height: 48, borderRadius: "50%", zIndex: 999 }} />}>
            <CartDrawer storeSlug={tenant.slug} locale={locale} />
          </Suspense>

          <StorefrontAnalytics storeSlug={tenant.slug} eventType="product_view" productId={product.id} />
        </div>
      </ThemeRenderer>
    </CartProvider>
  );
}
