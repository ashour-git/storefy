import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";

export default function AILoading() {
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <Skeleton style={{ height: 28, width: 180, marginBottom: 8 }} />
        <Skeleton style={{ height: 14, width: 240 }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, height: "60vh" }}>
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
