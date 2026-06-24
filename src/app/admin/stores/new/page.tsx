"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wizard } from "../../../../components/wizard/WizardStep";
import { TemplatePreviewCard } from "../../../../components/wizard/TemplatePreviewCard";
import { storeTemplates } from "../../../../lib/storefront/templates";

export default function CreateStorePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [currency, setCurrency] = useState("EGP");
  const [locale, setLocale] = useState<"en" | "ar">("ar");
  const [templateId, setTemplateId] = useState(storeTemplates[0].id);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleNameChange = (value: string) => {
    setName(value);
    setSlug(
      value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .slice(0, 40)
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, category, locale, templateId }),
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

  const categories = [
    { value: "perfume", label: "Perfume & Fragrances", icon: "✦", desc: "Signature scents, colognes, and niche fragrances." },
    { value: "fashion", label: "Fashion & Clothing", icon: "◆", desc: "Apparel, shoes, streetwear, and accessories." },
    { value: "electronics", label: "Electronics & Gadgets", icon: "⬡", desc: "Phones, accessories, and consumer tech." },
    { value: "food", label: "Food & Beverages", icon: "●", desc: "Local treats, bakeries, and specialty foods." },
    { value: "handmade", label: "Handmade & Home", icon: "◎", desc: "Decor, candles, ceramics, and artisan goods." },
  ];

  const steps = [
    {
      id: "basics",
      title: "Name Your Store",
      subtitle: "Choose a memorable name. You can always change it later.",
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
            />
            {name.length >= 3 && (
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "4px" }}>
                Your store will be known as <strong style={{ color: "var(--text-secondary)" }}>{name}</strong>
              </p>
            )}
          </div>

          <div className="wizard-field-group">
            <label className="wizard-label">Store URL</label>
            <div className="wizard-url-group">
              <span className="wizard-url-prefix">storefy.com/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                placeholder="scent-palace"
                className="wizard-url-input"
              />
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
              This is your public storefront address. Use lowercase letters, numbers, and hyphens only.
            </p>
          </div>
        </div>
      ),
      isValid: name.trim().length >= 3 && slug.trim().length >= 3,
    },
    {
      id: "category",
      title: "Choose Your Niche",
      subtitle: "We'll tailor your AI engine, storefront template, and sample products to your category.",
      content: (
        <div className="wizard-category-grid">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => {
                setCategory(cat.value);
                const matchingTemplate = storeTemplates.find((template) => template.vertical === cat.value);
                if (matchingTemplate) setTemplateId(matchingTemplate.id);
              }}
              type="button"
              className={`wizard-category-card ${category === cat.value ? "active" : ""}`}
            >
              <span className="wizard-category-icon">{cat.icon}</span>
              <div className="wizard-category-text">
                <span className="wizard-category-title">{cat.label}</span>
                <span className="wizard-category-desc">{cat.desc}</span>
              </div>
            </button>
          ))}
        </div>
      ),
      isValid: category !== "",
    },
    {
      id: "template",
      title: "Pick a Template",
      subtitle: "Start with a professionally designed storefront. Customize everything after launch.",
      content: (
        <div className="template-preview-grid">
          {storeTemplates.map((template) => (
            <TemplatePreviewCard
              key={template.id}
              template={template}
              locale={locale}
              selected={templateId === template.id}
              onSelect={() => {
                setTemplateId(template.id);
                setCategory(template.vertical);
              }}
            />
          ))}
        </div>
      ),
      isValid: templateId !== "",
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
