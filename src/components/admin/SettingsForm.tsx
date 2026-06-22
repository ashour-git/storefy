"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Store {
  id: string;
  slug: string;
  name: string;
  customDomain: string | null;
  category: string | null;
  defaultLocale: string;
  defaultCurrency: string;
  plan: string;
  status: string;
}

interface SettingsFormProps {
  store: Store;
}

export function SettingsForm({ store }: SettingsFormProps) {
  const router = useRouter();
  const [name, setName] = useState(store.name);
  const [customDomain, setCustomDomain] = useState(store.customDomain || "");
  const [category, setCategory] = useState(store.category || "");
  const [defaultLocale, setDefaultLocale] = useState(store.defaultLocale);
  const [defaultCurrency, setDefaultCurrency] = useState(store.defaultCurrency);

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
              <input
                type="text"
                value={`${store.slug}.storefy.com`}
                disabled
                className="admin-input"
                style={{ opacity: 0.6, cursor: "not-allowed" }}
              />
              <span className="admin-muted-text" style={{ fontSize: "0.8rem", marginTop: 4 }}>
                Subdomain cannot be changed after creation.
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
                <option value="perfume">🧴 Perfume & Fragrances</option>
                <option value="fashion">👗 Fashion & Clothing</option>
                <option value="electronics">📱 Electronics</option>
                <option value="food">🍕 Food & Beverages</option>
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
