"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconPackage, IconDownload } from "../IconLibrary";

interface Product {
  id: string;
  name: string;
  description: string | null;
  basePrice: string;
  currency: string;
  status: 'draft' | 'active' | 'archived';
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

  // Bulk CSV Import state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<string, number>>({
    name: -1,
    description: -1,
    basePrice: -1,
    status: -1,
    images: -1,
    sku: -1,
    stockQty: -1,
  });
  const [importStep, setImportStep] = useState(1); // 1: upload, 2: mapping, 3: preview, 4: importing
  const [importError, setImportError] = useState("");
  const [importProgress, setImportProgress] = useState(0);

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

      setProducts(prev => prev.map(p => p.id === id ? { ...p, status: 'archived' as const } : p));
      router.refresh();
    } catch (e) {
      alert("Something went wrong");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    if (!file) return;

    setImportFile(file);
    setImportError("");

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) throw new Error("File is empty.");

        // Vanilla CSV parser handling quotes and newlines
        const lines: string[][] = [];
        let row = [""];
        let inQuotes = false;
        
        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          const nextChar = text[i+1];
          
          if (char === '"') {
            if (inQuotes && nextChar === '"') {
              row[row.length - 1] += '"';
              i++;
            } else {
              inQuotes = !inQuotes;
            }
          } else if (char === ',' && !inQuotes) {
            row.push("");
          } else if ((char === '\r' || char === '\n') && !inQuotes) {
            if (char === '\r' && nextChar === '\n') i++;
            lines.push(row);
            row = [""];
          } else {
            row[row.length - 1] += char;
          }
        }
        if (row.length > 1 || row[0] !== "") {
          lines.push(row);
        }

        if (lines.length < 2) {
          throw new Error("CSV must contain at least a header row and one data row.");
        }

        const headers = lines[0].map((h, i) => h.trim() || `Column ${i + 1}`);
        setCsvHeaders(headers);
        setCsvRows(lines.slice(1));

        // Auto-detect columns based on header names (case-insensitive checks)
        const newMapping: Record<string, number> = {
          name: headers.findIndex(h => /name|title|product/i.test(h)),
          description: headers.findIndex(h => /desc|body|info/i.test(h)),
          basePrice: headers.findIndex(h => /price|cost|amount/i.test(h)),
          status: headers.findIndex(h => /status|state|active/i.test(h)),
          images: headers.findIndex(h => /image|img|photo/i.test(h)),
          sku: headers.findIndex(h => /sku|code|reference/i.test(h)),
          stockQty: headers.findIndex(h => /stock|qty|quantity|inventory/i.test(h)),
        };

        setMapping(newMapping);
        setImportStep(2);
      } catch (err: any) {
        setImportError(err.message || "Failed to parse CSV file.");
      }
    };
    reader.readAsText(file);
  };

  const getMappedProducts = () => {
    return csvRows.map(row => {
      const nameVal = mapping.name !== -1 ? row[mapping.name]?.trim() : "";
      const descVal = mapping.description !== -1 ? row[mapping.description]?.trim() : "";
      const priceVal = mapping.basePrice !== -1 ? parseFloat(row[mapping.basePrice]?.replace(/[^0-9.]/g, "")) : NaN;
      const statusVal = mapping.status !== -1 ? (row[mapping.status]?.toLowerCase().trim() === 'active' ? 'active' : 'draft') : 'draft';
      const imagesVal = mapping.images !== -1 ? row[mapping.images]?.split(',').map(url => url.trim()).filter(Boolean) : [];
      const skuVal = mapping.sku !== -1 ? row[mapping.sku]?.trim() : "";
      const stockVal = mapping.stockQty !== -1 ? parseInt(row[mapping.stockQty]?.replace(/[^0-9]/g, "")) || 0 : 0;

      return {
        name: nameVal,
        description: descVal,
        basePrice: priceVal,
        status: statusVal,
        images: imagesVal,
        sku: skuVal,
        stockQty: stockVal,
        isValid: !!nameVal && !isNaN(priceVal) && priceVal > 0
      };
    });
  };

  const handleStartImport = async () => {
    const allMapped = getMappedProducts();
    const validMapped = allMapped.filter(p => p.isValid);
    
    if (validMapped.length === 0) {
      setImportError("No valid products found to import. Please check your column mapping.");
      return;
    }

    setImportStep(4);
    setImportProgress(20);
    setImportError("");

    try {
      const res = await fetch("/api/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: validMapped })
      });

      setImportProgress(70);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Batch import failed.");
      }

      setImportProgress(100);
      
      alert(`Import completed! Successfully added ${validMapped.length} products.`);
      setIsImportModalOpen(false);
      resetImportState();
      
      router.refresh();
      window.location.reload();
    } catch (err: any) {
      setImportStep(3);
      setImportError(err.message || "Bulk import failed. Please try again.");
    }
  };

  const resetImportState = () => {
    setImportFile(null);
    setCsvHeaders([]);
    setCsvRows([]);
    setImportStep(1);
    setImportError("");
    setImportProgress(0);
  };

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = !statusFilter || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const allMappedProducts = getMappedProducts();
  const validProductsCount = allMappedProducts.filter(p => p.isValid).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Filter Bar */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between", width: "100%" }}>
        <div style={{ display: "flex", flex: 1, gap: 12, minWidth: 280, flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              minWidth: 180,
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
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="btn-secondary"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 44, padding: "0 16px", borderRadius: "var(--radius-md)", cursor: "pointer" }}
          >
            <IconDownload size={16} /> Import CSV
          </button>
        </div>
        <div className="admin-muted-text" style={{ fontSize: "0.9rem" }}>
          Showing {filtered.length} of {products.length} products
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="admin-empty-state" style={{ padding: "40px 20px" }}>
          <div className="admin-empty-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
            <IconPackage size={48} />
          </div>
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

      {/* CSV Import Modal Overlay */}
      {isImportModalOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: 20
        }} onClick={() => { if (importStep !== 4) { setIsImportModalOpen(false); resetImportState(); } }}>
          <div style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-xl)",
            padding: 32,
            width: "100%",
            maxWidth: "680px",
            maxHeight: "90vh",
            overflowY: "auto",
            boxShadow: "var(--shadow-modal)",
            animation: "slideUp 0.3s ease-out"
          }} onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h3 className="admin-page-title" style={{ fontSize: "1.4rem", margin: 0 }}>Import Products from CSV</h3>
                <p className="admin-page-subtitle" style={{ fontSize: "0.85rem", marginTop: 4 }}>
                  {importStep === 1 && "Upload your product catalog CSV sheet"}
                  {importStep === 2 && "Map CSV column headers to Product attributes"}
                  {importStep === 3 && "Preview product validation before importing"}
                  {importStep === 4 && "Importing products to database..."}
                </p>
              </div>
              {importStep !== 4 && (
                <button
                  onClick={() => { setIsImportModalOpen(false); resetImportState(); }}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--text-muted)",
                    fontSize: "24px",
                    cursor: "pointer"
                  }}
                >
                  ×
                </button>
              )}
            </div>

            {importError && (
              <div className="auth-error" style={{ marginBottom: 20 }}>{importError}</div>
            )}

            {/* Step 1: File Upload */}
            {importStep === 1 && (
              <div style={{
                border: "2px dashed var(--border-subtle)",
                borderRadius: "var(--radius-lg)",
                padding: "48px 24px",
                textAlign: "center",
                background: "var(--bg-primary)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', marginBottom: 8 }}>
                  <IconDownload size={48} />
                </div>
                <div>
                  <h4 style={{ fontWeight: 700, fontSize: "1.1rem" }}>Select CSV Catalog File</h4>
                  <p className="admin-hint" style={{ marginTop: 4 }}>
                    To import from Excel, simply export your spreadsheet as a <strong>.csv</strong> file first.
                  </p>
                </div>
                <label className="btn-primary" style={{ cursor: "pointer", marginTop: 8 }}>
                  Choose CSV File
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCsvUpload}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
            )}

            {/* Step 2: Column Mapping */}
            {importStep === 2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <p className="admin-hint" style={{ marginBottom: 8 }}>
                  Match each product attribute on the left with the corresponding header from your CSV file.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {/* Field Mapping Selectors */}
                  {Object.keys(mapping).map((field) => {
                    const label = field === "name" ? "Product Name *" :
                                  field === "basePrice" ? "Price (EGP) *" :
                                  field === "description" ? "Description" :
                                  field === "status" ? "Status" :
                                  field === "images" ? "Images (comma-separated URLs)" :
                                  field === "sku" ? "SKU" : "Stock Quantity";
                    return (
                      <div key={field} className="admin-form-group" style={{ marginBottom: 0 }}>
                        <label className="admin-label" style={{ fontSize: "0.85rem" }}>{label}</label>
                        <select
                          value={mapping[field]}
                          onChange={(e) => setMapping(prev => ({ ...prev, [field]: Number(e.target.value) }))}
                          className="admin-select"
                        >
                          <option value="-1">-- Leave Blank / Select --</option>
                          {csvHeaders.map((header, idx) => (
                            <option key={idx} value={idx}>{header}</option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
                  <button type="button" onClick={() => setImportStep(1)} className="btn-secondary">Back</button>
                  <button
                    type="button"
                    onClick={() => {
                      if (mapping.name === -1 || mapping.basePrice === -1) {
                        setImportError("Product Name and Price are required column mappings.");
                        return;
                      }
                      setImportError("");
                      setImportStep(3);
                    }}
                    className="btn-primary"
                  >
                    Preview Import
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Preview Data Grid */}
            {importStep === 3 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="admin-muted-text" style={{ fontSize: "0.9rem" }}>
                    Found <strong>{csvRows.length}</strong> total rows. <strong>{validProductsCount}</strong> rows are valid and ready to import.
                  </span>
                </div>

                <div style={{
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-lg)",
                  overflowX: "auto",
                  maxHeight: "260px",
                  background: "var(--bg-primary)"
                }}>
                  <table className="admin-table" style={{ fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                    <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
                      <tr>
                        <th>Status</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>SKU</th>
                        <th>Stock</th>
                        <th>Images</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allMappedProducts.slice(0, 10).map((p, idx) => (
                        <tr key={idx} style={{ opacity: p.isValid ? 1 : 0.5 }}>
                          <td>
                            <span style={{ 
                              color: p.isValid ? "var(--success)" : "var(--error)", 
                              fontWeight: 700 
                            }}>
                              {p.isValid ? "✓ OK" : "✗ Invalid"}
                            </span>
                          </td>
                          <td><strong>{p.name || "(Missing Name)"}</strong></td>
                          <td>{isNaN(p.basePrice) ? "(Invalid)" : `${p.basePrice} EGP`}</td>
                          <td>{p.sku || "—"}</td>
                          <td>{p.stockQty}</td>
                          <td>{p.images.length > 0 ? `${p.images.length} URLs` : "No image"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {csvRows.length > 10 && (
                    <div style={{ textAlign: "center", padding: "8px 0", color: "var(--text-muted)", fontSize: "0.8rem", borderTop: "1px solid var(--border-subtle)" }}>
                      ... and {csvRows.length - 10} more rows
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24 }}>
                  <button type="button" onClick={() => setImportStep(2)} className="btn-secondary">Back to Mapping</button>
                  <button
                    type="button"
                    onClick={handleStartImport}
                    className="btn-primary"
                    disabled={validProductsCount === 0}
                  >
                    Import {validProductsCount} Products
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Loading & Importing Progress */}
            {importStep === 4 && (
              <div style={{
                textAlign: "center",
                padding: "36px 0",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 20
              }}>
                <div className="auth-spinner" style={{ width: "40px", height: "40px", borderWidth: "3px" }} />
                <div style={{ width: "100%", maxWidth: "300px" }}>
                  <div style={{
                    height: "8px",
                    background: "var(--border-subtle)",
                    borderRadius: "var(--radius-full)",
                    overflow: "hidden",
                    marginBottom: 8
                  }}>
                    <div style={{
                      height: "100%",
                      width: `${importProgress}%`,
                      background: "var(--accent-gradient)",
                      borderRadius: "var(--radius-full)",
                      transition: "width 0.4s ease"
                    }} />
                  </div>
                  <span className="admin-muted-text" style={{ fontSize: "0.85rem" }}>
                    Uploading products data... {importProgress}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
