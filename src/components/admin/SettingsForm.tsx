"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getStoreUrl } from "../../lib/store-utils";

interface Store {
  id: string;
  slug: string;
  name: string;
  customDomain: string | null;
  category: string | null;
  defaultLocale: string;
  defaultCurrency: string;
  taxRate: string;
  plan: string;
  status: string;
}

interface SettingsFormProps {
  store: Store;
}

export function SettingsForm({ store }: SettingsFormProps) {
  const router = useRouter();
  const storeUrl = getStoreUrl(store.slug, undefined, store.customDomain);
  const [name, setName] = useState(store.name);
  const [customDomain, setCustomDomain] = useState(store.customDomain || "");
  const [category, setCategory] = useState(store.category || "");
  const [defaultLocale, setDefaultLocale] = useState(store.defaultLocale);
  const [defaultCurrency, setDefaultCurrency] = useState(store.defaultCurrency);
  const [taxRate, setTaxRate] = useState(store.taxRate || "14.00");

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/stores/${store.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          customDomain: customDomain || null,
          category: category || null,
          defaultLocale,
          defaultCurrency,
          taxRate,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to update settings");
        return;
      }

      setSuccess("Settings updated successfully!");
      router.refresh();
    } catch {
      setError("An error occurred while saving.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("⚠️ WARNING: Are you absolutely sure you want to delete this store? This action is permanent and cannot be undone.")) return;
    setDeleting(true);
    setError("");

    try {
      const res = await fetch(`/api/stores/${store.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to delete store");
        return;
      }

      // Redirect back to admin dashboard
      window.location.href = "/admin";
    } catch {
      setError("An error occurred while deleting the store.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {success && (
        <div style={{ padding: "12px 20px", background: "rgba(52, 211, 153, 0.1)", border: "1px solid rgba(52, 211, 153, 0.2)", borderRadius: "var(--radius-md)", color: "var(--success)", fontWeight: 500 }}>
          {success}
        </div>
      )}
      {error && (
        <div style={{ padding: "12px 20px", background: "rgba(248, 113, 113, 0.1)", border: "1px solid rgba(248, 113, 113, 0.2)", borderRadius: "var(--radius-md)", color: "var(--error)", fontWeight: 500 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div className="admin-settings-grid">
          {/* General Settings */}
          <div className="admin-settings-card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h2 className="admin-settings-card-title">Store Information</h2>
            
            <div className="admin-form-group">
              <label className="admin-label">Store Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="admin-input"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Store URL</label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="text"
                  value={storeUrl.replace("http://", "").replace("https://", "")}
                  disabled
                  className="admin-input"
                  style={{ opacity: 0.6, cursor: "not-allowed", flex: 1 }}
                />
                <a
                  href={storeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  style={{ height: 44, padding: "0 16px", display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-md)" }}
                  title="Visit storefront"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </a>
              </div>
              <span className="admin-muted-text" style={{ fontSize: "0.8rem", marginTop: 4, display: "block" }}>
                Subdomain cannot be changed after creation. Click the button to visit your live storefront.
              </span>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Custom Domain</label>
              <input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="e.g., myshop.com"
                className="admin-input"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="admin-select"
              >
                <option value="">Select a category</option>
                <option value="perfume">Perfume & Fragrances</option>
                <option value="fashion">Fashion & Clothing</option>
                <option value="electronics">Electronics</option>
                <option value="food">Food & Beverages</option>
              </select>
            </div>
          </div>

          {/* Regional Settings */}
          <div className="admin-settings-card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h2 className="admin-settings-card-title">Regional Settings</h2>
            
            <div className="admin-form-group">
              <label className="admin-label">Default Language</label>
              <select
                value={defaultLocale}
                onChange={(e) => setDefaultLocale(e.target.value)}
                className="admin-select"
              >
                <option value="ar">Arabic (العربية)</option>
                <option value="en">English</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Default Currency</label>
              <select
                value={defaultCurrency}
                onChange={(e) => setDefaultCurrency(e.target.value)}
                className="admin-select"
              >
                <option value="EGP">Egyptian Pound (EGP)</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Tax Rate (VAT %)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="admin-input"
              />
              <span className="admin-muted-text" style={{ fontSize: "0.8rem", marginTop: 4, display: "block" }}>
                Egypt standard VAT is 14%. Adjust if your products have different tax treatment.
              </span>
            </div>

            {/* Plan Info */}
            <div style={{ marginTop: 8, padding: 16, background: "var(--bg-primary)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>Subscription Plan</span>
                <span className="admin-badge admin-badge-plan">{store.plan?.toUpperCase()}</span>
              </div>
              <p className="admin-muted-text" style={{ fontSize: "0.8rem", marginTop: 8, lineHeight: 1.4 }}>
                Free plan supports up to 25 active products and core Paymob checkout integrations.
              </p>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ minWidth: 140, cursor: "pointer" }}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="admin-settings-card" style={{ borderColor: "rgba(244, 63, 94, 0.3)", background: "rgba(244, 63, 94, 0.02)" }}>
        <h2 className="admin-settings-card-title" style={{ color: "var(--error)" }}>Danger Zone</h2>
        <p className="admin-muted-text" style={{ marginBottom: 20, fontSize: "0.9rem" }}>
          Once you delete your store, all associated data, including products, catalog configurations, and order histories, will be marked as deleted. This action cannot be reversed easily.
        </p>
        <div>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="btn-secondary"
            style={{ 
              borderColor: "rgba(244, 63, 94, 0.4)", 
              color: "var(--error)", 
              background: "transparent",
              cursor: "pointer"
            }}
          >
            {deleting ? "Deleting Store..." : "Delete Store"}
          </button>
        </div>
      </div>
    </div>
  );
}
