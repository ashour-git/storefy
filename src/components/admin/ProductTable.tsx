"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  description: string | null;
  basePrice: string;
  currency: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: any;
}

interface ProductTableProps {
  initialProducts: Product[];
}

export function ProductTable({ initialProducts }: ProductTableProps) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleArchive = async (id: string) => {
    if (!confirm("Are you sure you want to archive this product?")) return;
    setActionLoading(id);

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        alert("Failed to archive product");
        setActionLoading(null);
        return;
      }

      // Update local state
      setProducts(prev => prev.map(p => p.id === id ? { ...p, status: 'archived' as const } : p));
      router.refresh();
    } catch (e) {
      alert("Something went wrong");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = !statusFilter || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Filter Bar */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between", width: "100%" }}>
        <div style={{ display: "flex", flex: 1, gap: 12, minWidth: 280 }}>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              padding: "10px 16px",
              background: "var(--bg-input)",
              border: "1px solid var(--border-input)",
              borderRadius: "var(--radius-md)",
              color: "var(--text-primary)",
              outline: "none"
            }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "10px 16px",
              background: "var(--bg-input)",
              border: "1px solid var(--border-input)",
              borderRadius: "var(--radius-md)",
              color: "var(--text-primary)",
              outline: "none"
            }}
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div className="admin-muted-text" style={{ fontSize: "0.9rem" }}>
          Showing {filtered.length} of {products.length} products
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="admin-empty-state" style={{ padding: "40px 20px" }}>
          <div className="admin-empty-icon">📦</div>
          <h3 className="admin-empty-title">No Products Found</h3>
          <p className="admin-empty-desc">Try resetting your filters or search terms.</p>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Status</th>
                <th>Created</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="admin-product-name" style={{ fontWeight: 600, color: "var(--text-primary)" }}>{product.name}</div>
                    {product.description && (
                      <div className="admin-product-desc" style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: 4 }}>
                        {product.description.slice(0, 60)}{product.description.length > 60 ? "…" : ""}
                      </div>
                    )}
                  </td>
                  <td>{Number(product.basePrice).toLocaleString()} {product.currency || "EGP"}</td>
                  <td>
                    <span className={`admin-badge admin-badge-${product.status}`}>
                      {product.status}
                    </span>
                  </td>
                  <td>{product.createdAt ? new Date(product.createdAt).toLocaleDateString() : "—"}</td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      <Link 
                        href={`/admin/products/${product.id}/edit`}
                        className="btn-secondary"
                        style={{ padding: "6px 12px", fontSize: "0.85rem", borderRadius: "var(--radius-sm)", height: "auto" }}
                      >
                        Edit
                      </Link>
                      {product.status !== 'archived' && (
                        <button
                          onClick={() => handleArchive(product.id)}
                          disabled={actionLoading === product.id}
                          className="btn-secondary"
                          style={{ 
                            padding: "6px 12px", 
                            fontSize: "0.85rem", 
                            borderRadius: "var(--radius-sm)", 
                            color: "var(--error)", 
                            borderColor: "rgba(244, 63, 94, 0.2)",
                            background: "transparent",
                            height: "auto",
                            cursor: "pointer"
                          }}
                        >
                          {actionLoading === product.id ? "Archiving..." : "Archive"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
