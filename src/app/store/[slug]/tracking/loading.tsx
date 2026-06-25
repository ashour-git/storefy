import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";

export default function TrackingLoading() {
  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 20px" }}>
      <Skeleton style={{ height: 28, width: 200, marginBottom: 8 }} />
      <Skeleton style={{ height: 14, width: 280, marginBottom: 32 }} />
      <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
        <Skeleton style={{ height: 44, flex: 1, borderRadius: 8 }} />
        <Skeleton style={{ height: 44, width: 120, borderRadius: 8 }} />
      </div>
      <SkeletonCard />
    </div>
  );
}
