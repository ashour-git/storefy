import { Skeleton, SkeletonTable } from "@/components/ui/Skeleton";

export default function CollectionsLoading() {
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <Skeleton style={{ height: 28, width: 200, marginBottom: 8 }} />
        <Skeleton style={{ height: 14, width: 220 }} />
      </div>
      <SkeletonTable rows={6} columns={4} />
    </div>
  );
}
