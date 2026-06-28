"use client";

import type { StoreTemplate } from "../../lib/storefront/types";

interface TemplatePreviewCardProps {
  template: StoreTemplate;
  selected: boolean;
  locale: "en" | "ar";
  onSelect: () => void;
}

const blockIcons: Record<string, string> = {
  hero: "🖼", promo: "📢", trustStrip: "🛡", categoryTiles: "📂",
  collection: "🛍", spotlight: "💡", benefits: "✅", features: "✨",
  testimonials: "⭐", faq: "❓", gallery: "🏛", newsletter: "📬",
};

export function TemplatePreviewCard({ template, selected, locale, onSelect }: TemplatePreviewCardProps) {
  const tokens = template.tokens;
  const dir = locale === "ar" ? "rtl" : "ltr";
  const title = template.name[locale] || template.name.en;
  const description = template.description[locale] || template.description.en;
  const heroBlock = template.blocks.find((block) => block.type === "hero");
  const heroSettings = heroBlock?.type === "hero" ? (heroBlock.settings as Record<string, any>) : null;
  const heroTitle = heroSettings ? (heroSettings.title?.[locale] || heroSettings.title?.en) : title;
  const heroEyebrow = heroSettings ? (heroSettings.eyebrow?.[locale] || heroSettings.eyebrow?.en) : template.vertical;
  const productNames = template.demoProducts.slice(0, 3).map((product) => product.name[locale] || product.name.en);
  const blockTypes = [...new Set(template.blocks.map(b => b.type))];
  const hasTestimonials = template.blocks.some(b => b.type === 'testimonials');
  const hasGallery = template.blocks.some(b => b.type === 'gallery');
  const hasFeatures = template.blocks.some(b => b.type === 'features');

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`template-preview-card ${selected ? "active" : ""}`}
      dir={dir}
      aria-pressed={selected}
      style={{
        "--preview-primary": tokens.primaryColor,
        "--preview-secondary": tokens.secondaryColor,
        "--preview-bg": tokens.backgroundColor,
        "--preview-surface": tokens.surfaceColor,
        "--preview-text": tokens.textColor,
        "--preview-muted": tokens.mutedTextColor,
        "--preview-accent": tokens.accentColor,
        "--preview-radius": tokens.borderRadius,
      } as React.CSSProperties}
    >
      <div className="template-browser-frame">
        <div className="template-browser-topbar">
          <div className="template-browser-dots">
            <span /><span /><span />
          </div>
          <strong>{template.vertical}</strong>
        </div>

        <div className="template-mini-store">
          <div className="template-mini-nav">
            <div className="template-mini-logo" style={{
              background: `linear-gradient(135deg, ${tokens.primaryColor}, ${tokens.accentColor})`,
              boxShadow: `0 4px 12px color-mix(in srgb, ${tokens.primaryColor} 30%, transparent)`,
            }}>{title.slice(0, 1)}</div>
            <div className="template-mini-nav-links">
              <span /><span /><span />
            </div>
          </div>

          <div className="template-mini-hero">
            <div className="template-mini-hero-copy">
              <small>{heroEyebrow}</small>
              <h3>{heroTitle}</h3>
              <div className="template-mini-cta" style={{ background: tokens.primaryColor }} />
            </div>
            <div className="template-mini-art" style={{
              background: `linear-gradient(145deg, ${tokens.secondaryColor}, ${tokens.primaryColor})`,
            }}>
              <span className="template-mini-art-orb orb-one" />
              <span className="template-mini-art-orb orb-two" />
              <span className="template-mini-art-card" style={{ background: `color-mix(in srgb, ${tokens.surfaceColor} 86%, transparent)` }} />
            </div>
          </div>

          <div className="template-mini-trust">
            {[1, 2, 3].map(i => (
              <div key={i} className="template-mini-trust-item">
                <div className="template-mini-trust-dot" style={{ background: tokens.accentColor }} />
                <div className="template-mini-trust-line" />
              </div>
            ))}
          </div>

          <div className="template-mini-sections-bar">
            {blockTypes.slice(0, 6).map(type => (
              <span key={type} className="template-mini-section-badge">
                {blockIcons[type] || '📄'}
              </span>
            ))}
            {blockTypes.length > 6 && (
              <span className="template-mini-section-badge template-mini-section-more">+{blockTypes.length - 6}</span>
            )}
          </div>

          <div className="template-mini-products">
            {productNames.map((name, index) => (
              <div key={name} className="template-mini-product">
                <div className="template-mini-product-img" style={{
                  background: `linear-gradient(135deg, ${tokens.primaryColor}22, ${tokens.accentColor}33)`,
                  color: tokens.primaryColor,
                }}>{index + 1}</div>
                <div className="template-mini-product-copy">
                  <span>{name}</span>
                  <strong style={{ color: tokens.primaryColor }}>{template.demoProducts[index]?.basePrice} EGP</strong>
                </div>
              </div>
            ))}
          </div>

          {(hasTestimonials || hasGallery) && (
            <div className="template-mini-footer-badges">
              {hasTestimonials && <span className="template-mini-footer-badge" style={{
                background: `color-mix(in srgb, ${tokens.accentColor} 14%, transparent)`,
                color: tokens.accentColor,
              }}>⭐ Reviews</span>}
              {hasGallery && <span className="template-mini-footer-badge" style={{
                background: `color-mix(in srgb, ${tokens.primaryColor} 14%, transparent)`,
                color: tokens.primaryColor,
              }}>🏛 Gallery</span>}
              {hasFeatures && <span className="template-mini-footer-badge" style={{
                background: `color-mix(in srgb, ${tokens.secondaryColor} 14%, transparent)`,
                color: tokens.secondaryColor,
              }}>✨ Features</span>}
            </div>
          )}
        </div>
      </div>

      <div className="template-preview-meta">
        <div>
          <h4>{title}</h4>
          <p>{description}</p>
        </div>
        <div className="template-preview-swatches" aria-label="Template colors">
          <span style={{ background: tokens.primaryColor }} />
          <span style={{ background: tokens.secondaryColor }} />
          <span style={{ background: tokens.accentColor }} />
        </div>
      </div>

      <div className="template-preview-stats">
        <span>{template.demoProducts.length} Products</span>
        <span>{blockTypes.length} Sections</span>
        <span>{template.qualityTags.length} Tags</span>
      </div>

      <div className="template-preview-tags">
        {template.qualityTags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>

      {selected && (
        <div className="template-selected-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
      )}
    </button>
  );
}
