"use client";

import React from "react";

function shimmerKeyframes() {
  return {
    backgroundImage:
      "linear-gradient(90deg, transparent 0%, rgba(148, 163, 184, 0.06) 40%, rgba(148, 163, 184, 0.12) 50%, rgba(148, 163, 184, 0.06) 60%, transparent 100%)",
    backgroundSize: "200% 100%",
    animation: "skeleton-shimmer 1.5s ease-in-out infinite",
  } as React.CSSProperties;
}

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className = "", style }: SkeletonProps) {
  return (
    <>
      <style>{`
        @keyframes skeleton-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <div
        className={`rounded-lg ${className}`}
        style={{
          ...shimmerKeyframes(),
          background: "var(--bg-surface-raised)",
          ...style,
        }}
      />
    </>
  );
}

export function SkeletonCard({ className = "", style }: SkeletonProps) {
  return (
    <div
      className={`rounded-2xl p-5 ${className}`}
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <Skeleton style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <Skeleton style={{ height: 14, width: "60%", marginBottom: 8 }} />
          <Skeleton style={{ height: 12, width: "40%" }} />
        </div>
      </div>
      <Skeleton style={{ height: 12, width: "100%", marginBottom: 8 }} />
      <Skeleton style={{ height: 12, width: "85%", marginBottom: 8 }} />
      <Skeleton style={{ height: 12, width: "70%" }} />
    </div>
  );
}

export function SkeletonTable({
  rows = 5,
  columns = 4,
  className = "",
  style,
}: SkeletonProps & { rows?: number; columns?: number }) {
  const colWidths = ["40%", "25%", "20%", "15%", "30%", "22%"];
  return (
    <div
      className={`rounded-2xl overflow-hidden ${className}`}
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        ...style,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          padding: "14px 20px",
          borderBottom: "1px solid var(--border-subtle)",
          gap: 16,
        }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} style={{ height: 12, width: colWidths[i % colWidths.length] }} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            padding: "14px 20px",
            borderBottom:
              rowIdx < rows - 1 ? "1px solid var(--border-subtle)" : undefined,
            gap: 16,
          }}
        >
          {Array.from({ length: columns }).map((_, colIdx) => (
            <Skeleton
              key={colIdx}
              style={{
                height: 12,
                width: colWidths[(rowIdx + colIdx) % colWidths.length],
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonStat({ className = "", style }: SkeletonProps) {
  return (
    <div
      className={`rounded-2xl p-5 ${className}`}
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        ...style,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <Skeleton style={{ width: 40, height: 40, borderRadius: 12 }} />
      </div>
      <Skeleton style={{ height: 24, width: "55%", marginBottom: 8 }} />
      <Skeleton style={{ height: 12, width: "35%" }} />
    </div>
  );
}
