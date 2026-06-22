import React from 'react';
import { ProductGrid } from './ProductGrid';
import { pickLocalized, getStorefrontCopy } from '../../lib/storefront/copy';
import type { Locale } from '../../lib/i18n';
import type { StorefrontBlock, StorefrontProduct } from '../../lib/storefront/types';

interface StorefrontBlocksProps {
  blocks: StorefrontBlock[];
  products: StorefrontProduct[];
  storeName: string;
  locale: Locale;
}

export function StorefrontBlocks({ blocks, products, storeName, locale }: StorefrontBlocksProps) {
  const copy = getStorefrontCopy(locale);

  return (
    <>
      {blocks.map((block) => {
        switch (block.type) {
          case 'promo':
            return (
              <div key={block.id} className="w-full text-center py-3 px-4 text-sm font-bold tracking-wide" style={{ background: block.settings.tone === 'dark' ? 'var(--store-secondary)' : 'var(--store-primary)', color: '#fff' }}>
                {pickLocalized(block.settings.text, locale)}
              </div>
            );
          case 'hero':
            return (
              <section key={block.id} className="relative overflow-hidden px-4 sm:px-6 lg:px-8 py-20 sm:py-28" style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--store-primary) 12%, transparent), color-mix(in srgb, var(--store-accent) 18%, transparent))' }}>
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className={block.settings.alignment === 'center' ? 'text-center lg:text-start' : ''}>
                    <p className="inline-flex px-4 py-2 rounded-full text-sm font-bold mb-6" style={{ background: 'var(--store-surface)', color: 'var(--store-primary)' }}>
                      {pickLocalized(block.settings.eyebrow, locale)}
                    </p>
                    <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight mb-6" style={{ fontFamily: 'var(--store-heading-font)' }}>
                      {pickLocalized(block.settings.title, locale)}
                    </h1>
                    <p className="text-lg sm:text-xl leading-8 mb-8 max-w-2xl" style={{ color: 'var(--store-muted)' }}>
                      {pickLocalized(block.settings.subtitle, locale)}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <a href="#collection" className="inline-flex justify-center px-7 py-4 rounded-[var(--store-radius)] text-white font-extrabold shadow-lg" style={{ background: 'var(--store-primary)' }}>
                        {pickLocalized(block.settings.primaryCta, locale) || copy.shopNow}
                      </a>
                      {block.settings.secondaryCta && (
                        <a href="#story" className="inline-flex justify-center px-7 py-4 rounded-[var(--store-radius)] font-extrabold border" style={{ color: 'var(--store-primary)', borderColor: 'color-mix(in srgb, var(--store-primary) 24%, transparent)' }}>
                          {pickLocalized(block.settings.secondaryCta, locale)}
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="relative min-h-[360px] rounded-[calc(var(--store-radius)*1.5)] p-6 flex items-end overflow-hidden shadow-2xl" style={{ background: 'linear-gradient(160deg, var(--store-secondary), var(--store-primary))' }}>
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_20%,white,transparent_32%),radial-gradient(circle_at_80%_10%,white,transparent_26%)]" />
                    <div className="relative w-full rounded-[var(--store-radius)] p-6" style={{ background: 'rgba(255,255,255,.92)', color: 'var(--store-text)' }}>
                      <p className="text-sm font-bold uppercase tracking-[0.2em] opacity-60 mb-3">{storeName}</p>
                      <p className="text-3xl font-black" style={{ fontFamily: 'var(--store-heading-font)' }}>{pickLocalized(block.settings.imageLabel, locale) || copy.featuredProducts}</p>
                    </div>
                  </div>
                </div>
              </section>
            );
          case 'trustStrip':
            return (
              <section key={block.id} className="border-y border-black/5" style={{ background: 'var(--store-surface)' }}>
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-0">
                  {block.settings.items.map((item, index) => (
                    <div key={`${block.id}-${index}`} className="p-6 border-black/5 md:border-e">
                      <h3 className="font-black mb-1">{pickLocalized(item.title, locale)}</h3>
                      <p className="text-sm leading-6" style={{ color: 'var(--store-muted)' }}>{pickLocalized(item.text, locale)}</p>
                    </div>
                  ))}
                </div>
              </section>
            );
          case 'categoryTiles':
            return (
              <section key={block.id} className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                  <SectionHeader title={pickLocalized(block.settings.title, locale)} subtitle={pickLocalized(block.settings.subtitle, locale)} />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {block.settings.items.map((item, index) => (
                      <div key={`${block.id}-${index}`} className="p-7 rounded-[var(--store-radius)] border border-black/5 shadow-sm" style={{ background: 'var(--store-surface)' }}>
                        <h3 className="text-xl font-black mb-2">{pickLocalized(item.title, locale)}</h3>
                        <p style={{ color: 'var(--store-muted)' }}>{pickLocalized(item.text, locale)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );
          case 'collection': {
            const visibleProducts = products.slice(0, block.settings.limit || 8);
            return (
              <section key={block.id} id="collection" className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
                    <SectionHeader title={pickLocalized(block.settings.title, locale)} subtitle={pickLocalized(block.settings.subtitle, locale)} compact />
                    <span className="self-start sm:self-auto px-4 py-2 rounded-full text-sm font-bold" style={{ background: 'var(--store-surface)', color: 'var(--store-muted)' }}>
                      {visibleProducts.length} {visibleProducts.length === 1 ? copy.item : copy.items}
                    </span>
                  </div>
                  <ProductGrid products={visibleProducts} storeName={storeName} locale={locale} />
                </div>
              </section>
            );
          }
          case 'spotlight':
            return (
              <section key={block.id} id="story" className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto rounded-[calc(var(--store-radius)*1.5)] p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-[1.1fr_.9fr] gap-10" style={{ background: 'var(--store-secondary)', color: '#fff' }}>
                  <div>
                    <h2 className="text-3xl sm:text-5xl font-black mb-5" style={{ fontFamily: 'var(--store-heading-font)' }}>{pickLocalized(block.settings.title, locale)}</h2>
                    <p className="text-lg leading-8 text-white/75">{pickLocalized(block.settings.text, locale)}</p>
                  </div>
                  <div className="grid gap-3 content-center">
                    {block.settings.bullets.map((bullet, index) => (
                      <div key={`${block.id}-${index}`} className="p-4 rounded-[var(--store-radius)] bg-white/10 font-bold">{pickLocalized(bullet, locale)}</div>
                    ))}
                  </div>
                </div>
              </section>
            );
          case 'benefits':
            return (
              <section key={block.id} className="py-16 px-4 sm:px-6 lg:px-8" style={{ background: 'color-mix(in srgb, var(--store-primary) 5%, transparent)' }}>
                <div className="max-w-7xl mx-auto">
                  <SectionHeader title={pickLocalized(block.settings.title, locale)} />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {block.settings.items.map((item, index) => (
                      <div key={`${block.id}-${index}`} className="p-7 rounded-[var(--store-radius)]" style={{ background: 'var(--store-surface)' }}>
                        <h3 className="font-black mb-2">{pickLocalized(item.title, locale)}</h3>
                        <p className="text-sm leading-6" style={{ color: 'var(--store-muted)' }}>{pickLocalized(item.text, locale)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );
          case 'testimonials':
            return (
              <section key={block.id} className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                  <SectionHeader title={pickLocalized(block.settings.title, locale)} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {block.settings.items.map((item) => (
                      <figure key={`${block.id}-${item.name}`} className="p-7 rounded-[var(--store-radius)] border border-black/5" style={{ background: 'var(--store-surface)' }}>
                        <p className="text-lg leading-8 mb-5">&quot;{pickLocalized(item.text, locale)}&quot;</p>
                        <figcaption className="font-black" style={{ color: 'var(--store-primary)' }}>{item.name} · {'*'.repeat(item.rating)}</figcaption>
                      </figure>
                    ))}
                  </div>
                </div>
              </section>
            );
          case 'faq':
            return (
              <section key={block.id} className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                  <SectionHeader title={pickLocalized(block.settings.title, locale)} />
                  <div className="grid gap-3">
                    {block.settings.items.map((item, index) => (
                      <details key={`${block.id}-${index}`} className="p-5 rounded-[var(--store-radius)] border border-black/5" style={{ background: 'var(--store-surface)' }}>
                        <summary className="font-black cursor-pointer">{pickLocalized(item.question, locale)}</summary>
                        <p className="mt-3 leading-7" style={{ color: 'var(--store-muted)' }}>{pickLocalized(item.answer, locale)}</p>
                      </details>
                    ))}
                  </div>
                </div>
              </section>
            );
          default:
            return null;
        }
      })}
    </>
  );
}

function SectionHeader({ title, subtitle, compact = false }: { title: string; subtitle?: string; compact?: boolean }) {
  return (
    <div className={compact ? '' : 'text-center mb-10'}>
      <h2 className="text-3xl sm:text-5xl font-black tracking-tight" style={{ fontFamily: 'var(--store-heading-font)' }}>{title}</h2>
      {subtitle && <p className="mt-3 text-base sm:text-lg max-w-2xl mx-auto" style={{ color: 'var(--store-muted)' }}>{subtitle}</p>}
    </div>
  );
}
