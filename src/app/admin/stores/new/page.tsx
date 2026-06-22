"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wizard } from "../../../../components/wizard/WizardStep";

export default function CreateStorePage() {
  const router = useRouter();
  
  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [currency, setCurrency] = useState("EGP");
  
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
        body: JSON.stringify({ name, slug, category }),
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
    { value: "perfume", label: "🧴 Perfume & Fragrances", desc: "Sell signature scents and colognes." },
    { value: "fashion", label: "👗 Fashion & Clothing", desc: "Apparel, shoes, and accessories." },
    { value: "electronics", label: "📱 Electronics", desc: "Gadgets, phones, and computers." },
    { value: "food", label: "🍕 Food & Beverages", desc: "Local treats and imported snacks." },
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
              onClick={() => setCategory(cat.value)}
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
      id: "currency",
      title: "Store Currency",
      subtitle: "Which currency will you accept for payments?",
      content: (
        <div className="wizard-field-group" style={{ gap: "16px" }}>
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
