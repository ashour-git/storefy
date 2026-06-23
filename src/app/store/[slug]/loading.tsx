import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";

export default function StoreLoading() {
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px" }}>
      {/* Hero skeleton */}
      <Skeleton
        style={{
          height: 340,
          width: "100%",
          borderRadius: 20,
          marginBottom: 40,
        }}
      />

      {/* Product grid skeleton */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: 20,
        }}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            <Skeleton style={{ width: "100%", height: 220, borderRadius: 0 }} />
            <div style={{ padding: 16 }}>
              <Skeleton style={{ height: 16, width: "75%", marginBottom: 10 }} />
              <Skeleton style={{ height: 13, width: "40%", marginBottom: 12 }} />
              <Skeleton style={{ height: 13, width: "60%" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
