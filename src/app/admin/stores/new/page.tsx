"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wizard } from "../../../../components/wizard/WizardStep";
import { TemplatePreviewCard } from "../../../../components/wizard/TemplatePreviewCard";
import { storeTemplates } from "../../../../lib/storefront/templates";

export default function CreateStorePage() {
  const router = useRouter();
  
  // Form State
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
    { value: "perfume", label: "Perfume & Fragrances", desc: "Sell signature scents and colognes." },
    { value: "fashion", label: "Fashion & Clothing", desc: "Apparel, shoes, and accessories." },
    { value: "electronics", label: "Electronics", desc: "Gadgets, phones, and computers." },
    { value: "food", label: "Food & Beverages", desc: "Local treats and imported snacks." },
    { value: "handmade", label: "Handmade & Home", desc: "Decor, candles, ceramics, and artisan goods." },
  ];

  const steps = [
    {
      id: "basics",
      title: "Name Your Store",
      subtitle: "What will your brand be known as?",
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
          </div>
          
          <div className="wizard-field-group" style={{ opacity: 0.9 }}>
            <label className="wizard-label" style={{ fontSize: "0.82rem" }}>Your Store URL</label>
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
          </div>
        </div>
      ),
      isValid: name.trim().length >= 3 && slug.trim().length >= 3,
    },
    {
      id: "category",
      title: "What are you selling?",
      subtitle: "We'll customize your AI engine based on your choice.",
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
              <span className="wizard-category-title">{cat.label}</span>
              <span className="wizard-category-desc">{cat.desc}</span>
            </button>
          ))}
        </div>
      ),
      isValid: category !== "",
    },
    {
      id: "template",
      title: "Pick a launch-ready template",
      subtitle: "Start from a polished vertical design instead of a blank store.",
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
      id: "currency",
      title: "Locale and Currency",
      subtitle: "Arabic/RTL and EGP are first-class defaults for Egypt.",
      content: (
        <div className="wizard-field-group" style={{ gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
            <button type="button" onClick={() => setLocale("ar")} className={`wizard-currency-card ${locale === "ar" ? "active" : ""}`}>
              <div className="wizard-currency-info">
                <span className="wizard-currency-flag">AR</span>
                <div className="wizard-currency-details">
                  <span className="wizard-currency-name">Arabic storefront</span>
                  <span className="wizard-currency-desc">RTL-ready launch copy</span>
                </div>
              </div>
            </button>
            <button type="button" onClick={() => setLocale("en")} className={`wizard-currency-card ${locale === "en" ? "active" : ""}`}>
              <div className="wizard-currency-info">
                <span className="wizard-currency-flag">EN</span>
                <div className="wizard-currency-details">
                  <span className="wizard-currency-name">English storefront</span>
                  <span className="wizard-currency-desc">LTR-ready launch copy</span>
                </div>
              </div>
            </button>
          </div>
          <button
            onClick={() => setCurrency("EGP")}
            type="button"
            className={`wizard-currency-card ${currency === "EGP" ? "active" : ""}`}
          >
            <div className="wizard-currency-info">
              <span className="wizard-currency-flag">🇪🇬</span>
              <div className="wizard-currency-details">
                <span className="wizard-currency-name">Egyptian Pound (EGP)</span>
                <span className="wizard-currency-desc">Default for Paymob</span>
              </div>
            </div>
            <div className="wizard-currency-radio">
              {currency === "EGP" && <div className="wizard-currency-radio-dot" />}
            </div>
          </button>

          <button
            disabled
            type="button"
            className="wizard-currency-card disabled"
          >
            <div className="wizard-currency-info">
              <span className="wizard-currency-flag">🇸🇦</span>
              <div className="wizard-currency-details">
                <span className="wizard-currency-name">Saudi Riyal (SAR)</span>
                <span className="wizard-currency-desc" style={{ color: "var(--warning)", fontWeight: 600 }}>Coming Soon</span>
              </div>
            </div>
          </button>

          {error && (
            <div className="auth-error" style={{ marginTop: "16px", textAlign: "center" }}>
              {error}
            </div>
          )}
        </div>
      ),
      isValid: currency !== "",
    }
  ];

  return (
    <div className="admin-page" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "calc(100vh - 128px)" }}>
      <div className="w-full">
        <Wizard steps={steps} onComplete={handleSubmit} isSubmitting={loading} />
      </div>
    </div>
  );
}
