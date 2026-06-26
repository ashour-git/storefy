"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function NewProductPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("draft");
  const [sku, setSku] = useState("");
  const [stockQty, setStockQty] = useState("");
  
  // Media Gallery state
  const [images, setImages] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    setImages(prev => [...prev, urlInput.trim()]);
    setUrlInput("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImages(prev => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleMoveImage = (index: number, direction: 'left' | 'right') => {
    if (direction === 'left' && index === 0) return;
    if (direction === 'right' && index === images.length - 1) return;
    
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    setImages(prev => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          description, 
          basePrice: price, 
          status,
          images,
          sku: sku.trim() || undefined,
          stockQty: stockQty ? Number(stockQty) : 0
        }),
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

      <div className="admin-form-card" style={{ maxWidth: "800px" }}>
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
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-input)",
                background: "var(--bg-input)",
                color: "var(--text-primary)",
                fontFamily: "inherit",
                fontSize: "0.95rem",
                outline: "none",
                transition: "all var(--transition-fast)"
              }}
            />
          </div>

          {/* Pricing & Status Row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 20 }}>
            <div className="admin-form-group" style={{ marginBottom: 0 }}>
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

            <div className="admin-form-group" style={{ marginBottom: 0 }}>
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

          {/* SKU & Stock Row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 20 }}>
            <div className="admin-form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="product-sku" className="admin-label">SKU (Stock Keeping Unit)</label>
              <input
                id="product-sku"
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g., OUD-50ML"
                className="admin-input"
              />
            </div>

            <div className="admin-form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="product-stock" className="admin-label">Stock Quantity</label>
              <input
                id="product-stock"
                type="number"
                min="0"
                value={stockQty}
                onChange={(e) => setStockQty(e.target.value)}
                placeholder="e.g., 100"
                className="admin-input"
              />
            </div>
          </div>

          {/* Media Section */}
          <div className="admin-form-group" style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 24, marginTop: 24 }}>
            <label className="admin-label">Product Media</label>
            <p className="admin-hint" style={{ marginBottom: 12 }}>
              Upload local files (stored in database) or paste image URLs. First image is the main display.
            </p>
            
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
              {/* File Upload Button */}
              <label 
                className="btn-secondary" 
                style={{ 
                  cursor: "pointer", 
                  display: "inline-flex", 
                  alignItems: "center", 
                  gap: 8, 
                  height: 44, 
                  padding: "0 16px",
                  borderRadius: "var(--radius-md)"
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <span>Upload Images</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  onChange={handleFileUpload} 
                  style={{ display: "none" }} 
                />
              </label>
              
              {/* URL Input Group */}
              <div style={{ display: "flex", gap: 8, flex: 1, minWidth: 280 }}>
                <input 
                  type="text" 
                  placeholder="Paste image URL (e.g. https://...)" 
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="admin-input"
                  style={{ flex: 1 }}
                />
                <button 
                  type="button" 
                  onClick={handleAddUrl}
                  className="btn-secondary"
                  style={{ height: 44, padding: "0 16px" }}
                >
                  Add URL
                </button>
              </div>
            </div>

            {/* Gallery Preview Grid */}
            {images.length > 0 && (
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", 
                gap: 16, 
                background: "var(--bg-primary)", 
                padding: 16, 
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border-subtle)" 
              }}>
                {images.map((img, idx) => (
                  <div 
                    key={idx} 
                    style={{ 
                      position: "relative", 
                      aspectRatio: "1/1", 
                      borderRadius: "var(--radius-md)", 
                      overflow: "hidden", 
                      border: idx === 0 ? "2px solid var(--accent-primary)" : "1px solid var(--border-subtle)",
                      background: "#fff"
                    }}
                  >
                    <Image 
                      src={img} 
                      alt={`Preview ${idx + 1}`} 
                      fill
                      style={{ objectFit: "cover" }} 
                    />
                    
                    {/* Main image label */}
                    {idx === 0 && (
                      <span style={{ 
                        position: "absolute", 
                        bottom: 4, 
                        left: 4, 
                        background: "var(--accent-primary)", 
                        color: "#fff", 
                        fontSize: "0.65rem", 
                        fontWeight: 700, 
                        padding: "2px 6px", 
                        borderRadius: "var(--radius-sm)" 
                      }}>
                        MAIN
                      </span>
                    )}

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      style={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        background: "rgba(244, 63, 94, 0.9)",
                        color: "#fff",
                        border: "none",
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: "bold",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
                      }}
                      title="Remove image"
                    >
                      ×
                    </button>

                    {/* Shift buttons for phone reordering */}
                    <div style={{
                      position: "absolute",
                      bottom: 4,
                      right: 4,
                      display: "flex",
                      gap: 2
                    }}>
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMoveImage(idx, 'left')}
                          style={{
                            background: "rgba(15, 23, 42, 0.75)",
                            color: "#fff",
                            border: "none",
                            padding: "2px 4px",
                            borderRadius: "var(--radius-sm)",
                            fontSize: "10px",
                            cursor: "pointer"
                          }}
                          title="Move left"
                        >
                          ‹
                        </button>
                      )}
                      {idx < images.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleMoveImage(idx, 'right')}
                          style={{
                            background: "rgba(15, 23, 42, 0.75)",
                            color: "#fff",
                            border: "none",
                            padding: "2px 4px",
                            borderRadius: "var(--radius-sm)",
                            fontSize: "10px",
                            cursor: "pointer"
                          }}
                          title="Move right"
                        >
                          ›
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <div className="auth-error" style={{ marginTop: 16 }}>{error}</div>}

          <div className="admin-form-actions" style={{ marginTop: 24 }}>
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
