import { Skeleton, SkeletonTable } from "@/components/ui/Skeleton";

export default function OrdersLoading() {
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <Skeleton style={{ height: 28, width: 160, marginBottom: 8 }} />
        <Skeleton style={{ height: 14, width: 220 }} />
      </div>

      <SkeletonTable rows={10} columns={6} />
    </div>
  );
}
