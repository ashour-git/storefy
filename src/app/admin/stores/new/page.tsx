"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Wizard } from "../../../../components/wizard/WizardStep";
import { TemplatePreviewCard } from "../../../../components/wizard/TemplatePreviewCard";
import { storeTemplates } from "../../../../lib/storefront/templates";

const SITE = process.env.NEXT_PUBLIC_APP_URL || 'storefy.com';

const categories = [
  { value: "perfume", label: "Perfume & Fragrances", icon: "✦", desc: "Signature scents, colognes, and niche fragrances." },
  { value: "fashion", label: "Fashion & Clothing", icon: "◆", desc: "Apparel, shoes, streetwear, and accessories." },
  { value: "electronics", label: "Electronics & Gadgets", icon: "⬡", desc: "Phones, accessories, and consumer tech." },
  { value: "food", label: "Food & Beverages", icon: "●", desc: "Local treats, bakeries, and specialty foods." },
  { value: "handmade", label: "Handmade & Home", icon: "◎", desc: "Decor, candles, ceramics, and artisan goods." },
];

function generateSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

function SlugStatusIcon({ status }: { status: string }) {
  if (status === 'checking') return <span className="slug-checking" />;
  if (status === 'available') return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
  );
  if (status === 'unavailable') return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
  );
  return null;
}

export default function CreateStorePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');
  const [slugMessage, setSlugMessage] = useState("");
  const [slugSuggestion, setSlugSuggestion] = useState("");

  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");

  const [category, setCategory] = useState("");
  const [templateId, setTemplateId] = useState(storeTemplates[0].id);
  const [startBlank, setStartBlank] = useState(false);

  const [currency, setCurrency] = useState("EGP");
  const [locale, setLocale] = useState<"en" | "ar">("ar");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [detailTemplate, setDetailTemplate] = useState<typeof storeTemplates[0] | null>(null);

  // Debounced slug availability check
  useEffect(() => {
    if (slug.length < 3) { setSlugStatus('idle'); setSlugMessage(""); return; }
    const timer = setTimeout(async () => {
      setSlugStatus('checking');
      try {
        const res = await fetch(`/api/stores/check-slug?slug=${encodeURIComponent(slug)}`);
        const data = await res.json();
        setSlugStatus(data.available ? 'available' : 'unavailable');
        setSlugMessage(data.message || "");
        setSlugSuggestion(data.suggestion || "");
      } catch {
        setSlugStatus('idle');
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [slug]);

  const handleNameChange = (value: string) => {
    setName(value);
    const newSlug = generateSlug(value);
    setSlug(newSlug);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const socialLinks: Record<string, string> = {};
      if (whatsapp) socialLinks.whatsappNumber = whatsapp;

      const res = await fetch("/api/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          category: startBlank ? "" : category,
          locale,
          templateId: startBlank ? undefined : templateId,
          startBlank,
          phone: phone || undefined,
          whatsapp: whatsapp || undefined,
          address: address || undefined,
          socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create store");
        setLoading(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const filteredTemplates = category
    ? storeTemplates.filter(t => t.vertical === category)
    : storeTemplates;

  const steps = [
    {
      id: "basics",
      title: "Name Your Store",
      subtitle: "Choose a memorable name and URL. Your customers will see this.",
      content: (
        <div className="wizard-field-group" style={{ gap: "20px" }}>
          <div className="wizard-field-group">
            <label className="wizard-label">Store Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g., Scent Palace"
              className="wizard-input"
              autoFocus
              maxLength={60}
            />
            {name.length >= 3 && (
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "4px" }}>
                Your store will be known as <strong style={{ color: "var(--text-secondary)" }}>{name}</strong>
              </p>
            )}
          </div>

          <div className="wizard-field-group">
            <label className="wizard-label">Store URL</label>
            <div className="wizard-url-group" style={{ borderColor: slugStatus === 'unavailable' ? '#ef4444' : slugStatus === 'available' ? '#22c55e' : undefined }}>
              <span className="wizard-url-prefix">{SITE.replace(/^https?:\/\//, '')}/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlug(generateSlug(e.target.value));
                  setSlugStatus('idle');
                }}
                placeholder="scent-palace"
                className="wizard-url-input"
              />
              <span className="slug-status-icon">
                <SlugStatusIcon status={slugStatus} />
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, minHeight: 20 }}>
              {slugStatus === 'available' && (
                <span style={{ fontSize: "0.75rem", color: "#22c55e", fontWeight: 600 }}>This URL is available!</span>
              )}
              {slugStatus === 'unavailable' && (
                <span style={{ fontSize: "0.75rem", color: "#ef4444", fontWeight: 500 }}>
                  {slugMessage === 'Already taken' ? 'Already taken — ' : slugMessage}
                  {slugSuggestion && (
                    <button
                      type="button"
                      onClick={() => { setSlug(slugSuggestion); setSlugStatus('idle'); }}
                      style={{ background: "none", border: "none", color: "var(--accent-primary)", cursor: "pointer", fontWeight: 600, fontSize: "0.75rem", textDecoration: "underline" }}
                    >
                      Try {slugSuggestion}
                    </button>
                  )}
                </span>
              )}
              {slugStatus === 'idle' && slug.length >= 3 && (
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Checking availability…</span>
              )}
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
              Use lowercase letters, numbers, and hyphens only.
            </p>
          </div>
        </div>
      ),
      isValid: name.trim().length >= 3 && slug.trim().length >= 3 && slugStatus !== 'unavailable',
    },
    {
      id: "business",
      title: "Business Info",
      subtitle: "Let customers reach you. These appear on your storefront.",
      content: (
        <div className="wizard-field-group" style={{ gap: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="wizard-field-group">
              <label className="wizard-label">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g., +20 100 123 4567"
                className="wizard-input"
              />
            </div>
            <div className="wizard-field-group">
              <label className="wizard-label">WhatsApp Number</label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="e.g., +20 100 123 4567"
                className="wizard-input"
              />
            </div>
          </div>
          <div className="wizard-field-group">
            <label className="wizard-label">Store Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g., 15 Tahrir St, Downtown, Cairo"
              className="wizard-input"
            />
          </div>
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "4px" }}>
            All fields are optional. You can always update them later in Settings.
          </p>
        </div>
      ),
      isValid: true,
    },
    {
      id: "niche",
      title: "Choose Your Niche & Template",
      subtitle: "Pick an industry and a starting design. Or start from scratch.",
      content: (
        <div className="wizard-field-group" style={{ gap: "24px" }}>
          {/* Category grid */}
          <div>
            <label className="wizard-label" style={{ marginBottom: "10px", display: "block" }}>Industry</label>
            <div className="wizard-category-grid">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => {
                    if (startBlank) setStartBlank(false);
                    setCategory(cat.value);
                    const matchingTemplate = storeTemplates.find((t) => t.vertical === cat.value);
                    if (matchingTemplate) setTemplateId(matchingTemplate.id);
                  }}
                  type="button"
                  className={`wizard-category-card ${category === cat.value && !startBlank ? "active" : ""}`}
                >
                  <span className="wizard-category-icon">{cat.icon}</span>
                  <div className="wizard-category-text">
                    <span className="wizard-category-title">{cat.label}</span>
                    <span className="wizard-category-desc">{cat.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Start from scratch */}
          <div>
            <label className="wizard-label" style={{ marginBottom: "10px", display: "block" }}>
              Or Start Fresh
            </label>
            <button
              type="button"
              onClick={() => { setStartBlank(true); setCategory(""); setTemplateId(""); }}
              className={`wizard-category-card ${startBlank ? "active" : ""}`}
              style={{ maxWidth: "100%" }}
            >
              <span className="wizard-category-icon">○</span>
              <div className="wizard-category-text">
                <span className="wizard-category-title">Start from Scratch</span>
                <span className="wizard-category-desc">Blank storefront with no demo products or template. Full creative control.</span>
              </div>
            </button>
          </div>

          {/* Template grid (hidden when startBlank) */}
          {!startBlank && (
            <div>
              <label className="wizard-label" style={{ marginBottom: "10px", display: "block" }}>Template</label>
              {category && (
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "12px" }}>
                  Templates for <strong style={{ color: "var(--text-secondary)" }}>{categories.find(c => c.value === category)?.label}</strong>
                </p>
              )}
              {!category && (
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "12px" }}>
                  Select an industry above to filter templates, or browse all:
                </p>
              )}
              <div className="template-preview-grid">
                {filteredTemplates.map((template) => (
                  <div key={template.id} className="template-card-wrapper">
                    <TemplatePreviewCard
                      template={template}
                      locale={locale}
                      selected={templateId === template.id}
                      onSelect={() => {
                        setTemplateId(template.id);
                        setCategory(template.vertical);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setDetailTemplate(template)}
                      className="template-detail-btn"
                      title="Preview details"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Template detail modal */}
          {detailTemplate && (
            <div className="modal-overlay" onClick={() => setDetailTemplate(null)}>
              <div className="modal-content template-detail-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={() => setDetailTemplate(null)} type="button">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
                <h3 className="template-detail-title">{detailTemplate.name[locale] || detailTemplate.name.en}</h3>
                <p className="template-detail-desc">{detailTemplate.description[locale] || detailTemplate.description.en}</p>

                <div className="template-detail-sections">
                  <div>
                    <h4>Preview</h4>
                    <div style={{ maxWidth: "100%", overflow: "hidden", borderRadius: 12, border: "1px solid var(--border-subtle)" }}>
                      <TemplatePreviewCard
                        template={detailTemplate}
                        locale={locale}
                        selected={false}
                        onSelect={() => {}}
                      />
                    </div>
                  </div>

                  <div>
                    <h4>Blocks Included</h4>
                    <div className="template-detail-tags">
                      {[...new Set(detailTemplate.blocks.map(b => b.type))].map(type => (
                        <span key={type} className="template-detail-tag">{type}</span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4>Demo Products</h4>
                    <div className="template-detail-products">
                      {detailTemplate.demoProducts.map(p => (
                        <div key={p.sku} className="template-detail-product-item">
                          <div>
                            <div className="template-detail-product-name">{p.name[locale] || p.name.en}</div>
                            <div className="template-detail-product-price">{p.basePrice} EGP</div>
                          </div>
                          <span className="template-detail-product-sku">{p.sku}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="wizard-next-btn"
                  style={{ marginTop: 20, width: "100%", justifyContent: "center" }}
                  onClick={() => {
                    setTemplateId(detailTemplate.id);
                    setCategory(detailTemplate.vertical);
                    setDetailTemplate(null);
                  }}
                >
                  Select This Template
                </button>
              </div>
            </div>
          )}
        </div>
      ),
      isValid: startBlank || (category !== "" && templateId !== ""),
    },
    {
      id: "locale",
      title: "Language & Currency",
      subtitle: "Arabic RTL and Egyptian Pound are first-class defaults. You can add more later.",
      content: (
        <div className="wizard-field-group" style={{ gap: "16px" }}>
          <div>
            <label className="wizard-label" style={{ marginBottom: "10px", display: "block" }}>Storefront Language</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
              <button type="button" onClick={() => setLocale("ar")} className={`wizard-currency-card ${locale === "ar" ? "active" : ""}`}>
                <div className="wizard-currency-info">
                  <span className="wizard-currency-flag">AR</span>
                  <div className="wizard-currency-details">
                    <span className="wizard-currency-name">Arabic (RTL)</span>
                    <span className="wizard-currency-desc">Right-to-left storefront</span>
                  </div>
                </div>
              </button>
              <button type="button" onClick={() => setLocale("en")} className={`wizard-currency-card ${locale === "en" ? "active" : ""}`}>
                <div className="wizard-currency-info">
                  <span className="wizard-currency-flag">EN</span>
                  <div className="wizard-currency-details">
                    <span className="wizard-currency-name">English (LTR)</span>
                    <span className="wizard-currency-desc">Left-to-right storefront</span>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div>
            <label className="wizard-label" style={{ marginBottom: "10px", display: "block" }}>Currency</label>
            <button
              onClick={() => setCurrency("EGP")}
              type="button"
              className={`wizard-currency-card ${currency === "EGP" ? "active" : ""}`}
            >
              <div className="wizard-currency-info">
                <span className="wizard-currency-flag">EG</span>
                <div className="wizard-currency-details">
                  <span className="wizard-currency-name">Egyptian Pound (EGP)</span>
                  <span className="wizard-currency-desc">Integrated with Paymob payments</span>
                </div>
              </div>
              <div className="wizard-currency-radio">
                {currency === "EGP" && <div className="wizard-currency-radio-dot" />}
              </div>
            </button>
          </div>

          {error && (
            <div className="auth-error" style={{ marginTop: "8px", textAlign: "center" }}>
              {error}
            </div>
          )}
        </div>
      ),
      isValid: currency !== "",
    },
  ];

  return (
    <div className="admin-page" style={{ display: "flex", justifyContent: "center", paddingTop: "24px" }}>
      <div className="w-full">
        <Wizard steps={steps} onComplete={handleSubmit} isSubmitting={loading} />
      </div>
    </div>
  );
}
