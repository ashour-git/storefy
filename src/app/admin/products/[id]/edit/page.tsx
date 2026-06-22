"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

export default function EditProductPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(props.params);
  
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("draft");
  const [category, setCategory] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [error, setError] = useState("");
  const [aiError, setAiError] = useState("");

  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) {
          setError("Failed to load product details.");
          setLoading(false);
          return;
        }
        const data = await res.json();
        const p = data.product;
        setName(p.name);
        setDescription(p.description || "");
        setPrice(p.basePrice);
        setStatus(p.status);
      } catch (err) {
        setError("Error loading product.");
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, basePrice: price, status }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to update product");
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAiGenerate = async () => {
    if (!name.trim()) {
      setAiError("Please fill in the product name first.");
      return;
    }
    setAiGenerating(true);
    setAiError("");

    try {
      const res = await fetch("/api/ai/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: name,
          category: category || "General",
          locale: "en",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setAiError(data.error || "AI generation failed");
        return;
      }

      const data = await res.json();
      setDescription(data.description);
    } catch {
      setAiError("Something went wrong with AI description generation.");
    } finally {
      setAiGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
        <div className="admin-muted-text">Loading product details...</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Edit Product</h1>
        <p className="admin-page-subtitle">Modify details or status for this product.</p>
      </div>

      {error && <div className="auth-error" style={{ marginBottom: 20 }}>{error}</div>}

      <div className="admin-form-card">
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="admin-form-group">
            <label htmlFor="product-name" className="admin-label">Product Name</label>
            <input
              id="product-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Royal Oud Perfume 50ml"
              required
              className="admin-input"
            />
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label htmlFor="product-category" className="admin-label">Category (for AI description)</label>
              <input
                id="product-category"
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Perfumes, Cosmetics, Apparel"
                className="admin-input"
              />
            </div>
            
            <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 4 }}>
              <button
                type="button"
                onClick={handleAiGenerate}
                disabled={aiGenerating}
                className="btn-secondary"
                style={{ height: 48, width: "100%", whiteSpace: "nowrap", cursor: "pointer" }}
              >
                {aiGenerating ? "Generating description..." : "🪄 Generate description with AI"}
              </button>
            </div>
          </div>

          {aiError && (
            <div className="auth-error" style={{ fontSize: "0.85rem", marginTop: -8, marginBottom: 12 }}>
              {aiError}
            </div>
          )}

          <div className="admin-form-group">
            <label htmlFor="product-desc" className="admin-label">Description</label>
            <textarea
              id="product-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your product or generate one with the button above..."
              rows={6}
              className="admin-textarea"
            />
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label htmlFor="product-price" className="admin-label">Price (EGP)</label>
              <input
                id="product-price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                required
                className="admin-input"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="product-status" className="admin-label">Status</label>
              <select
                id="product-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="admin-select"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="admin-form-actions" style={{ marginTop: 24 }}>
            <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
