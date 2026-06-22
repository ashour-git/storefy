import { notFound } from 'next/navigation';
import { ThemeRenderer, type ThemeTokens } from '../../../../../components/storefront/ThemeRenderer';
import { resolveTenantBySlugOrDomain } from '../../../../../lib/tenancy';
import { getTemplateForVertical } from '../../../../../lib/storefront/templates';
import { getPolicyContent, policyTypes, type StorePolicyType } from '../../../../../lib/storefront/policies';
import type { Locale } from '../../../../../lib/i18n';

interface PolicyPageProps {
  params: Promise<{ slug: string; type: string }>;
}

export default async function PolicyPage({ params }: PolicyPageProps) {
  const { slug, type } = await params;
  const tenant = await resolveTenantBySlugOrDomain(slug);
  if (!tenant || !policyTypes.includes(type as StorePolicyType)) notFound();

  const locale: Locale = tenant.defaultLocale === 'ar' ? 'ar' : 'en';
  const tokens = getTemplateForVertical(tenant.category).tokens as ThemeTokens;
  const policy = getPolicyContent(type as StorePolicyType, locale, tenant.name);

  return (
    <ThemeRenderer tokens={tokens}>
      <div className="storefront-page" dir={locale === 'ar' ? 'rtl' : 'ltr'} lang={locale}>
        <header className="storefront-header">
          <div className="store-shell storefront-nav">
            <a href={`/store/${tenant.slug}`} className="storefront-logo">{tenant.name}</a>
          </div>
        </header>
        <main className="store-section">
          <article className="store-shell store-policy-card">
            <a href={`/store/${tenant.slug}`} className="store-checkout-back">{locale === 'ar' ? '-> العودة للمتجر' : '<- Back to store'}</a>
            <h1>{policy.title}</h1>
            <p>{policy.body}</p>
          </article>
        </main>
      </div>
    </ThemeRenderer>
  );
}
