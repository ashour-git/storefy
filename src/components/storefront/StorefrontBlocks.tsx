"use client";

import React from 'react';
import { ProductGrid } from './ProductGrid';
import { StorefrontIllustration } from './StorefrontIllustration';
import { pickLocalized, getStorefrontCopy } from '../../lib/storefront/copy';
import type { Locale } from '../../lib/i18n';
import type { StorefrontBlock, StorefrontProduct } from '../../lib/storefront/types';
import { DynamicIcon } from '../IconLibrary';

interface StorefrontBlocksProps {
  blocks: StorefrontBlock[];
  products: StorefrontProduct[];
  storeName: string;
  storeSlug: string;
  locale: Locale;
}

export function StorefrontBlocks({ blocks, products, storeName, storeSlug, locale }: StorefrontBlocksProps) {
  const copy = getStorefrontCopy(locale);
  const rtl = locale === 'ar';
  
  // Filter out blocks configured as hidden (Shopify eye toggle)
  const visibleBlocks = (blocks || []).filter((b) => !(b.settings as any)?.hidden);

  return (
    <div className="storefront-sections">
      {visibleBlocks.map((block: any) => {
        switch (block.type as any) {
          case 'promo':
            return (
              <div key={block.id} className="store-promo-bar">
                <span>{pickLocalized(block.settings.text, locale)}</span>
              </div>
            );
          case 'hero':
            return (
              <section key={block.id} className="store-hero-section">
                <div className="store-shell store-hero-grid">
                  <div className={block.settings.alignment === 'center' ? 'store-hero-copy center' : 'store-hero-copy'}>
                    <p className="store-eyebrow">
                      {pickLocalized(block.settings.eyebrow, locale)}
                    </p>
                    {block.settings.emoji && (
                      <div className="store-hero-icon-wrapper" style={{ marginBottom: '16px', display: 'inline-flex', color: 'var(--store-primary)' }}>
                        <DynamicIcon name={block.settings.emoji} size={48} />
                      </div>
                    )}
                    <h1 className="store-hero-title">
                      {pickLocalized(block.settings.title, locale)}
                    </h1>
                    <p className="store-hero-subtitle">
                      {pickLocalized(block.settings.subtitle, locale)}
                    </p>
                    <div className="store-hero-actions">
                      <a href="#collection" className="store-btn store-btn-primary">
                        {pickLocalized(block.settings.primaryCta, locale) || copy.shopNow}
                      </a>
                      {block.settings.secondaryCta && (
                        <a href="#story" className="store-btn store-btn-secondary">
                          {pickLocalized(block.settings.secondaryCta, locale)}
                        </a>
                      )}
                    </div>
                  </div>
                  <StorefrontIllustration label={pickLocalized(block.settings.imageLabel, locale) || copy.featuredProducts} storeName={storeName} locale={locale} />
                </div>
              </section>
            );
          case 'trustStrip':
            return (
              <section key={block.id} className="store-trust-section">
                <div className="store-shell store-trust-grid">
                  {block.settings.items.map((item: any, index: number) => (
                    <div key={`${block.id}-${index}`} className="store-trust-card">
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      <h3>{pickLocalized(item.title, locale)}</h3>
                      <p>{pickLocalized(item.text, locale)}</p>
                    </div>
                  ))}
                </div>
              </section>
            );
          case 'categoryTiles':
            return (
              <section key={block.id} className="store-section">
                <div className="store-shell">
                  <SectionHeader title={pickLocalized(block.settings.title, locale)} subtitle={pickLocalized(block.settings.subtitle, locale)} />
                  <div className="store-category-grid">
                    {block.settings.items.map((item: any, index: number) => (
                      <div key={`${block.id}-${index}`} className="store-category-card">
                        <div className="store-card-index">{index + 1}</div>
                        <h3>{pickLocalized(item.title, locale)}</h3>
                        <p>{pickLocalized(item.text, locale)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );
          case 'collection': {
            const visibleProducts = products.slice(0, block.settings.limit || 8);
            return (
              <section key={block.id} id="collection" className="store-section store-collection-section">
                <div className="store-shell">
                  <div className="store-section-row">
                    <SectionHeader title={pickLocalized(block.settings.title, locale)} subtitle={pickLocalized(block.settings.subtitle, locale)} compact />
                    <span className="store-count-pill">
                      {visibleProducts.length} {visibleProducts.length === 1 ? copy.item : copy.items}
                    </span>
                  </div>
                  <ProductGrid products={visibleProducts} storeName={storeName} storeSlug={storeSlug} locale={locale} />
                </div>
              </section>
            );
          }
          case 'spotlight':
            return (
              <section key={block.id} id="story" className="store-section">
                <div className="store-shell store-spotlight-card">
                  <div>
                    <h2>{pickLocalized(block.settings.title, locale)}</h2>
                    <p>{pickLocalized(block.settings.text, locale)}</p>
                  </div>
                  <div className="store-spotlight-bullets">
                    {block.settings.bullets.map((bullet: any, index: number) => (
                      <div key={`${block.id}-${index}`}>{pickLocalized(bullet, locale)}</div>
                    ))}
                  </div>
                </div>
              </section>
            );
          case 'benefits':
            return (
              <section key={block.id} className="store-section store-soft-section">
                <div className="store-shell">
                  <SectionHeader title={pickLocalized(block.settings.title, locale)} />
                  <div className="store-category-grid">
                    {block.settings.items.map((item: any, index: number) => (
                      <div key={`${block.id}-${index}`} className="store-category-card">
                        <div className="store-card-index">{index + 1}</div>
                        <h3>{pickLocalized(item.title, locale)}</h3>
                        <p>{pickLocalized(item.text, locale)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );
          case 'features':
            return (
              <section key={block.id} className="store-section store-features-section" style={{ padding: '60px 0', background: 'rgba(0, 0, 0, 0.02)' }}>
                <div className="store-shell">
                  <div className="store-category-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                    {block.settings.items?.map((item: any, index: number) => (
                      <div key={`${block.id}-${index}`} className="store-feature-card" style={{ padding: '24px', background: 'var(--store-bg)', borderRadius: 'var(--store-radius)', border: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '12px' }}>
                        {item.emoji && (
                          <div style={{ color: 'var(--store-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <DynamicIcon name={item.emoji} size={36} />
                          </div>
                        )}
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--store-text)' }}>{pickLocalized(item.title, locale)}</h3>
                        <p style={{ margin: 0, fontSize: '0.88rem', opacity: 0.7, lineHeight: 1.5, color: 'var(--store-text)' }}>{pickLocalized(item.desc, locale)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );
          case 'testimonials':
            return (
              <section key={block.id} className="store-section">
                <div className="store-shell">
                  <SectionHeader title={pickLocalized(block.settings.title, locale)} />
                  <div className="store-testimonial-grid">
                    {block.settings.items.map((item: any) => (
                      <figure key={`${block.id}-${item.name}`} className="store-testimonial-card">
                        <p>{rtl ? `“${pickLocalized(item.text, locale)}”` : `"${pickLocalized(item.text, locale)}"`}</p>
                        <figcaption style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                          <span>{item.name}</span>
                          <div style={{ display: 'flex', gap: '2px', color: '#fbbf24' }}>
                            {Array.from({ length: item.rating }).map((_, i) => (
                              <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                            ))}
                          </div>
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                </div>
              </section>
            );
          case 'faq':
            return (
              <section key={block.id} className="store-section store-faq-section">
                <div className="store-shell store-narrow-shell">
                  <SectionHeader title={pickLocalized(block.settings.title, locale)} />
                  <div className="store-faq-list">
                    {block.settings.items.map((item: any, index: number) => (
                      <details key={`${block.id}-${index}`} className="store-faq-item">
                        <summary>{pickLocalized(item.question, locale)}</summary>
                        <p>{pickLocalized(item.answer, locale)}</p>
                      </details>
                    ))}
                  </div>
                </div>
              </section>
            );
          case 'newsletter':
            return (
              <NewsletterBlock key={block.id} block={block} locale={locale} />
            );
          case 'gallery':
            return (
              <section key={block.id} className="store-section store-gallery-section" style={{ padding: '60px 0' }}>
                <div className="store-shell">
                  {block.settings.title && (
                    <SectionHeader title={pickLocalized(block.settings.title, locale)} />
                  )}
                  <div className="store-category-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                    {block.settings.items?.map((item: any, index: number) => (
                      <div key={`${block.id}-${index}`} className="store-gallery-card" style={{ padding: '24px', background: 'var(--store-surface)', borderRadius: 'var(--store-radius)', border: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '12px', minHeight: '220px', justifyContent: 'center' }}>
                        {item.emoji && (
                          <div style={{ color: 'var(--store-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <DynamicIcon name={item.emoji} size={36} />
                          </div>
                        )}
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--store-text)' }}>{pickLocalized(item.title, locale)}</h3>
                        <p style={{ margin: 0, fontSize: '0.88rem', opacity: 0.7, lineHeight: 1.5, color: 'var(--store-text)' }}>{pickLocalized(item.desc || item.text, locale)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

function NewsletterBlock({ block, locale }: { block: any; locale: Locale }) {
  const [email, setEmail] = React.useState('');
  const [subscribed, setSubscribed] = React.useState(false);
  const isArabic = locale === 'ar';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
  };

  return (
    <section className="store-section store-newsletter-section" style={{ padding: '60px 0', borderTop: '1px solid rgba(0,0,0,0.06)', borderBottom: '1px solid rgba(0,0,0,0.06)', background: 'color-mix(in srgb, var(--store-primary) 4%, transparent)' }}>
      <div className="store-shell" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 950, fontFamily: 'var(--store-heading-font), sans-serif', color: 'var(--store-text)' }}>
          {pickLocalized(block.settings.title, locale) || (isArabic ? "اشترك في نشرتنا الإخبارية" : "Subscribe to our newsletter")}
        </h2>
        {block.settings.subtitle && (
          <p style={{ margin: 0, fontSize: '1rem', opacity: 0.7, color: 'var(--store-text)', maxWidth: '500px' }}>
            {pickLocalized(block.settings.subtitle, locale)}
          </p>
        )}
        {subscribed ? (
          <div style={{ color: 'var(--store-primary)', fontWeight: 850, fontSize: '1.1rem', marginTop: '10px' }}>
            {isArabic ? "شكرًا للاشتراك!" : "Thanks for subscribing!"}
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', width: '100%', maxWidth: '400px', marginTop: '12px' }}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={block.settings.placeholder || (isArabic ? "أدخل بريدك الإلكتروني..." : "Enter your email...")}
              style={{
                flex: 1,
                padding: '12px 16px',
                fontSize: '0.9rem',
                border: '1px solid rgba(0,0,0,0.12)',
                borderRadius: 'var(--store-radius)',
                outline: 'none',
                background: 'var(--store-bg)',
                color: 'var(--store-text)',
              }}
            />
            <button
              type="submit"
              style={{
                padding: '12px 24px',
                fontSize: '0.9rem',
                fontWeight: 900,
                border: 'none',
                borderRadius: 'var(--store-radius)',
                background: 'linear-gradient(135deg, var(--store-primary), var(--store-secondary))',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              {block.settings.buttonText || (isArabic ? "اشترك" : "Subscribe")}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

function SectionHeader({ title, subtitle, compact = false }: { title: string; subtitle?: string; compact?: boolean }) {
  return (
    <div className={compact ? 'store-section-header compact' : 'store-section-header'}>
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}
