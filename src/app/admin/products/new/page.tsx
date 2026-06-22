"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewProductPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("draft");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, basePrice: price, status }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create product");
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Add Product</h1>
        <p className="admin-page-subtitle">Add a new product to your catalog.</p>
      </div>

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

          <div className="admin-form-group">
            <label htmlFor="product-desc" className="admin-label">Description</label>
            <textarea
              id="product-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your product..."
              rows={4}
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

          {error && <div className="auth-error">{error}</div>}

          <div className="admin-form-actions">
            <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Creating..." : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
