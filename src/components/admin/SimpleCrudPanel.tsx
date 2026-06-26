"use client";

import { useState } from "react";
import type React from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../ui/Toast";
import { ConfirmDialog } from "../ui/ConfirmDialog";

type Field = { name: string; label: string; type?: "text" | "number" | "textarea" | "select" | "checkbox"; options?: Array<{ label: string; value: string }> };

interface SimpleCrudPanelProps<T extends { id: string }> {
  title: string;
  description: string;
  endpoint: string;
  fields: Field[];
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  initialValues?: Record<string, string | boolean>;
}

export function SimpleCrudPanel<T extends { id: string }>({ title, description, endpoint, fields, items, renderItem, initialValues = {} }: SimpleCrudPanelProps<T>) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string | boolean>>(initialValues);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const { addToast } = useToast();

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    const payload = fields.reduce<Record<string, string | boolean | string[]>>((acc, field) => {
      const value = values[field.name];
      acc[field.name] = field.name === "cities" && typeof value === "string" ? value.split(",").map((item) => item.trim()).filter(Boolean) : value;
      return acc;
    }, {});
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({})) as { error?: string };
    setLoading(false);
    if (!response.ok) {
      setError(data.error || "Save failed");
      return;
    }
    setValues(initialValues);
    router.refresh();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`${endpoint}/${deleteTarget}`, { method: "DELETE" });
      if (res.ok) {
        addToast("Deleted successfully", "success");
        router.refresh();
      } else {
        addToast("Failed to delete", "error");
      }
    } catch {
      addToast("Failed to delete", "error");
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="admin-settings-card launch-panel">
      <div>
        <h2 className="admin-settings-card-title">{title}</h2>
        <p className="admin-muted-text">{description}</p>
      </div>
      {error && <div className="admin-alert error">{error}</div>}
      <form onSubmit={submit} className="launch-form-grid">
        {fields.map((field) => (
          <label key={field.name} className="admin-form-group">
            <span className="admin-label">{field.label}</span>
            {field.type === "textarea" ? (
              <textarea className="admin-input admin-textarea" value={String(values[field.name] || "")} onChange={(event) => setValues({ ...values, [field.name]: event.target.value })} />
            ) : field.type === "select" ? (
              <select className="admin-select" value={String(values[field.name] || "")} onChange={(event) => setValues({ ...values, [field.name]: event.target.value })}>
                {field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            ) : field.type === "checkbox" ? (
              <input type="checkbox" checked={Boolean(values[field.name])} onChange={(event) => setValues({ ...values, [field.name]: event.target.checked })} />
            ) : (
              <input className="admin-input" type={field.type || "text"} value={String(values[field.name] || "")} onChange={(event) => setValues({ ...values, [field.name]: event.target.value })} />
            )}
          </label>
        ))}
        <button className="btn-primary" type="submit" disabled={loading}>{loading ? "Saving..." : "Add"}</button>
      </form>
      <div className="launch-list">
        {items.length === 0 ? (
          <div className="admin-empty-state" style={{ padding: "32px 16px", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: 8, opacity: 0.4 }}>📦</div>
            <p className="admin-muted-text" style={{ margin: 0 }}>No items yet. Add your first one above.</p>
          </div>
        ) : items.map((item) => (
          <div key={item.id} className="launch-list-item">
            <div>{renderItem(item)}</div>
            <button type="button" className="btn-secondary" onClick={() => setDeleteTarget(item.id)}>Delete</button>
          </div>
        ))}
      </div>
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
