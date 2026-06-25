"use client";

import React, { createContext, useCallback, useContext, useState } from "react";

type ToastVariant = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (message: string, variant?: ToastVariant) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const variantColors: Record<ToastVariant, { bg: string; border: string; icon: string }> = {
  success: { bg: "#065f46", border: "#10b981", icon: "✓" },
  error: { bg: "#7f1d1d", border: "#ef4444", icon: "✕" },
  info: { bg: "#1e3a5f", border: "#3b82f6", icon: "ℹ" },
  warning: { bg: "#5c3d00", border: "#f59e0b", icon: "!" },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const colors = variantColors[toast.variant];
  return (
    <div
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        color: "#fff",
        padding: "12px 16px",
        borderRadius: "var(--radius-md)",
        display: "flex",
        alignItems: "center",
        gap: 10,
        boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
        fontSize: "0.9rem",
        maxWidth: 400,
        animation: "toast-slide-in 0.3s ease-out",
      }}
    >
      <span style={{ fontWeight: 700, fontSize: "1rem", flexShrink: 0 }}>{colors.icon}</span>
      <span style={{ flex: 1 }}>{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        style={{
          background: "none",
          border: "none",
          color: "#fff",
          cursor: "pointer",
          opacity: 0.7,
          fontSize: "1.1rem",
          padding: 0,
          lineHeight: 1,
        }}
      >
        &times;
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, variant: ToastVariant = "info") => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <style>{`
        @keyframes toast-slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
      <div
        style={{
          position: "fixed",
          top: 16,
          right: 16,
          zIndex: 99999,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
