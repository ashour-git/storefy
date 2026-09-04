'use client';

export function SectionSkeleton({ label }: { label: string }) {
  return (
    <div role="status" aria-label={label} className="admin-section-state">
      <div className="skeleton" aria-hidden="true" style={{ height: '4.5rem' }} />
      <span className="visually-hidden">{label}</span>
    </div>
  );
}

export function SectionError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="admin-section-state admin-section-error">
      <p>{message}</p>
      <button type="button" className="btn-secondary" onClick={onRetry}>
        Try again
      </button>
    </div>
  );
}

export function SectionEmpty({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div role="status" className="admin-section-state admin-empty-state">
      <h3 className="admin-empty-title">{title}</h3>
      <p className="admin-empty-desc">{description}</p>
      {actionLabel && onAction && (
        <button type="button" className="btn-primary" style={{ marginTop: 16 }} onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
