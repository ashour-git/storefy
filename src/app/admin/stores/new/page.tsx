"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateStorePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("perfume");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleNameChange = (value: string) => {
    setName(value);
    // Auto-generate slug from name
    setSlug(
      value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .slice(0, 40)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: "perfume", label: "🧴 Perfume & Fragrances" },
    { value: "fashion", label: "👗 Fashion & Clothing" },
    { value: "electronics", label: "📱 Electronics" },
    { value: "food", label: "🍕 Food & Beverages" },
    { value: "health", label: "💊 Health & Beauty" },
    { value: "home", label: "🏠 Home & Living" },
    { value: "sports", label: "⚽ Sports & Outdoors" },
    { value: "other", label: "📦 Other" },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Create Your Store</h1>
        <p className="admin-page-subtitle">
          Set up your online store in seconds. You can always change these settings later.
        </p>
      </div>

      <div className="admin-form-card">
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="admin-form-group">
            <label htmlFor="store-name" className="admin-label">Store Name</label>
            <input
              id="store-name"
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g., Scent Palace"
              required
              className="admin-input"
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="store-slug" className="admin-label">Store URL</label>
            <div className="admin-input-prefix-group">
              <span className="admin-input-prefix">https://</span>
              <input
                id="store-slug"
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                placeholder="scent-palace"
                required
                pattern="[a-z0-9-]+"
                className="admin-input"
              />
              <span className="admin-input-suffix">.storefy.com</span>
            </div>
          </div>

          <div className="admin-form-group">
            <label htmlFor="store-category" className="admin-label">Store Category</label>
            <select
              id="store-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="admin-select"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            <p className="admin-hint">This helps our AI generate better content for your store.</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="btn-primary admin-submit" disabled={loading}>
            {loading ? "Creating..." : "Create Store →"}
          </button>
        </form>
      </div>
    </div>
  );
}
