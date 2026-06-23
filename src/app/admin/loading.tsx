import { Skeleton, SkeletonStat, SkeletonCard } from "@/components/ui/Skeleton";

export default function AdminLoading() {
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <Skeleton style={{ height: 28, width: 220, marginBottom: 8 }} />
        <Skeleton style={{ height: 14, width: 160 }} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonStat key={i} />
        ))}
      </div>

      <div className="admin-dashboard-grid">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
