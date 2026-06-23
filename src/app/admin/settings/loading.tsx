import { Skeleton } from "@/components/ui/Skeleton";

function FieldGroupSkeleton() {
  return (
    <div style={{ marginBottom: 20 }}>
      <Skeleton style={{ height: 13, width: 120, marginBottom: 8 }} />
      <Skeleton style={{ height: 42, width: "100%", borderRadius: 10 }} />
    </div>
  );
}

export default function SettingsLoading() {
  return (
    <div className="admin-page">
      <div className="admin-page-header" style={{ marginBottom: 24 }}>
        <Skeleton style={{ height: 28, width: 140, marginBottom: 8 }} />
        <Skeleton style={{ height: 14, width: 280 }} />
      </div>

      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 16,
          padding: 32,
          maxWidth: 640,
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <FieldGroupSkeleton key={i} />
        ))}

        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <Skeleton style={{ height: 40, width: 120, borderRadius: 10 }} />
          <Skeleton style={{ height: 40, width: 120, borderRadius: 10 }} />
        </div>
      </div>
    </div>
  );
}
