import { Skeleton, SkeletonTable } from "@/components/ui/Skeleton";

export default function DiscountsLoading() {
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <Skeleton style={{ height: 28, width: 180, marginBottom: 8 }} />
        <Skeleton style={{ height: 14, width: 240 }} />
      </div>
      <SkeletonTable rows={6} columns={4} />
    </div>
  );
}
