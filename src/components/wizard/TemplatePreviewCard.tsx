"use client";

import type { StoreTemplate } from "../../lib/storefront/types";

interface TemplatePreviewCardProps {
  template: StoreTemplate;
  selected: boolean;
  locale: "en" | "ar";
  onSelect: () => void;
}

export function TemplatePreviewCard({ template, selected, locale, onSelect }: TemplatePreviewCardProps) {
  const tokens = template.tokens;
  const dir = locale === "ar" ? "rtl" : "ltr";
  const title = template.name[locale] || template.name.en;
  const description = template.description[locale] || template.description.en;
  const heroBlock = template.blocks.find((block) => block.type === "hero");
  const heroTitle = heroBlock?.type === "hero" ? heroBlock.settings.title[locale] || heroBlock.settings.title.en : title;
  const heroEyebrow = heroBlock?.type === "hero" ? heroBlock.settings.eyebrow[locale] || heroBlock.settings.eyebrow.en : template.vertical;
  const productNames = template.demoProducts.slice(0, 3).map((product) => product.name[locale] || product.name.en);

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
            <div className="template-mini-logo">{title.slice(0, 1)}</div>
            <div className="template-mini-nav-lines">
              <span /><span />
            </div>
          </div>

          <div className="template-mini-hero">
            <div className="template-mini-hero-copy">
              <small>{heroEyebrow}</small>
              <h3>{heroTitle}</h3>
              <div className="template-mini-cta" />
            </div>
            <div className="template-mini-art">
              <span className="template-mini-art-orb orb-one" />
              <span className="template-mini-art-orb orb-two" />
              <span className="template-mini-art-card" />
            </div>
          </div>

          <div className="template-mini-trust">
            <span /><span /><span />
          </div>

          <div className="template-mini-products">
            {productNames.map((name, index) => (
              <div key={name} className="template-mini-product">
                <div className="template-mini-product-img">{index + 1}</div>
                <div className="template-mini-product-copy">
                  <span>{name}</span>
                  <strong>{template.demoProducts[index]?.basePrice} EGP</strong>
                </div>
              </div>
            ))}
          </div>
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

      <div className="template-preview-tags">
        {template.qualityTags.slice(0, 3).map((tag) => (
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
