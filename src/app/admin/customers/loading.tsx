import { Skeleton, SkeletonTable } from "@/components/ui/Skeleton";

export default function CustomersLoading() {
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <Skeleton style={{ height: 28, width: 200, marginBottom: 8 }} />
        <Skeleton style={{ height: 14, width: 260 }} />
      </div>

      <SkeletonTable rows={10} columns={5} />
    </div>
  );
}
