import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";

export default function ThemesLoading() {
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <Skeleton style={{ height: 28, width: 160, marginBottom: 8 }} />
        <Skeleton style={{ height: 14, width: 200 }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, minHeight: "50vh" }}>
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
