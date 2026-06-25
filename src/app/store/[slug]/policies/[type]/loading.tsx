import { Skeleton } from "@/components/ui/Skeleton";

export default function PolicyLoading() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 20px" }}>
      <Skeleton style={{ height: 28, width: 200, marginBottom: 8 }} />
      <Skeleton style={{ height: 14, width: 160, marginBottom: 32 }} />
      <Skeleton style={{ height: 12, width: "100%", marginBottom: 8 }} />
      <Skeleton style={{ height: 12, width: "90%", marginBottom: 8 }} />
      <Skeleton style={{ height: 12, width: "85%", marginBottom: 8 }} />
      <Skeleton style={{ height: 12, width: "95%", marginBottom: 24 }} />
      <Skeleton style={{ height: 12, width: "100%", marginBottom: 8 }} />
      <Skeleton style={{ height: 12, width: "75%", marginBottom: 8 }} />
      <Skeleton style={{ height: 12, width: "80%" }} />
    </div>
  );
}
