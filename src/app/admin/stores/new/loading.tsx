import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";

export default function NewStoreLoading() {
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <Skeleton style={{ height: 28, width: 160, marginBottom: 8 }} />
        <Skeleton style={{ height: 14, width: 200 }} />
      </div>
      <SkeletonCard />
    </div>
  );
}
