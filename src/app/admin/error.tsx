"use client";

import { useEffect } from "react";

export default function AdminErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin Error Boundary:", error);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error digest:", (error as any).digest);
    console.error("Error stack:", error.stack);
  }, [error]);

  return (
    <div className="admin-page">
      <div className="admin-empty-state" style={{ padding: "60px 20px" }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "rgba(244, 63, 94, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            color: "#f87171",
            fontSize: "1.5rem",
          }}
        >
          ⚠️
        </div>
        <h2 className="admin-empty-title">Something went wrong</h2>
        <p className="admin-empty-desc" style={{ maxWidth: 400, margin: "0 auto 24px" }}>
          An unexpected error occurred loading this page. This is usually a temporary database connection issue.
        </p>
        <div
          style={{
            padding: "10px 16px",
            background: "rgba(244, 63, 94, 0.05)",
            border: "1px solid rgba(244, 63, 94, 0.15)",
            borderRadius: "var(--radius-md)",
            fontFamily: "monospace",
            fontSize: "0.75rem",
            color: "#f87171",
            marginBottom: 24,
            maxWidth: 400,
            margin: "0 auto 24px",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {error.digest
            ? `Error digest: ${error.digest}`
            : error.message || "Unknown error"}
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <a href="/admin" className="btn-secondary" style={{ padding: "10px 20px" }}>
            Go to Dashboard
          </a>
          <button onClick={() => reset()} className="btn-primary" style={{ padding: "10px 20px" }}>
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
