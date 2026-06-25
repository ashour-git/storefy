import { Skeleton } from "@/components/ui/Skeleton";

export default function CheckoutSuccessLoading() {
  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "60px 20px", textAlign: "center" }}>
      <Skeleton style={{ width: 80, height: 80, borderRadius: "50%", margin: "0 auto 24px" }} />
      <Skeleton style={{ height: 28, width: 240, margin: "0 auto 12px" }} />
      <Skeleton style={{ height: 14, width: 320, margin: "0 auto 32px" }} />
      <Skeleton style={{ height: 44, width: 200, borderRadius: 8, margin: "0 auto" }} />
    </div>
  );
}
