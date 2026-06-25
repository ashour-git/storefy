import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";

export default function CheckoutLoading() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 20px" }}>
      <Skeleton style={{ height: 28, width: 180, marginBottom: 24 }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div>
          <Skeleton style={{ height: 16, width: 120, marginBottom: 16 }} />
          <SkeletonCard />
        </div>
        <div>
          <Skeleton style={{ height: 16, width: 120, marginBottom: 16 }} />
          <SkeletonCard />
        </div>
      </div>
    </div>
  );
}
