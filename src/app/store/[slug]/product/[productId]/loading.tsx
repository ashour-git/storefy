import { Skeleton } from "@/components/ui/Skeleton";

export default function ProductDetailLoading() {
  return (
    <div
      style={{
        maxWidth: 1000,
        margin: "0 auto",
        padding: "32px 20px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 40,
      }}
    >
      {/* Left column — image */}
      <div>
        <Skeleton
          style={{
            width: "100%",
            aspectRatio: "1 / 1",
            borderRadius: 16,
          }}
        />
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton
              key={i}
              style={{ width: 72, height: 72, borderRadius: 10, flexShrink: 0 }}
            />
          ))}
        </div>
      </div>

      {/* Right column — details */}
      <div style={{ paddingTop: 8 }}>
        <Skeleton style={{ height: 12, width: 100, marginBottom: 16 }} />
        <Skeleton style={{ height: 30, width: "80%", marginBottom: 12 }} />
        <Skeleton style={{ height: 22, width: "30%", marginBottom: 20 }} />
        <Skeleton style={{ height: 14, width: "100%", marginBottom: 8 }} />
        <Skeleton style={{ height: 14, width: "95%", marginBottom: 8 }} />
        <Skeleton style={{ height: 14, width: "88%", marginBottom: 8 }} />
        <Skeleton style={{ height: 14, width: "72%", marginBottom: 28 }} />

        <Skeleton style={{ height: 14, width: 120, marginBottom: 10 }} />
        <div style={{ display: "flex", gap: 10 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} style={{ width: 48, height: 48, borderRadius: 10 }} />
          ))}
        </div>

        <Skeleton
          style={{ height: 48, width: "100%", borderRadius: 12, marginTop: 28 }}
        />
      </div>
    </div>
  );
}
