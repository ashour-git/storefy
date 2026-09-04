import type { AttentionItem } from '../../lib/admin/attention';

export function AttentionRail({ items }: { items: AttentionItem[] }) {
  if (items.length === 0) return null;
  return (
    <section aria-label="Needs attention" className="admin-attention-rail">
      {items.map((item) => (
        <a
          key={item.key}
          href={item.href}
          className={`admin-attention-item admin-attention-${item.severity}`}
        >
          <span aria-hidden="true">{item.severity === 'alert' ? '!' : '•'}</span>
          <span>{item.label} →</span>
        </a>
      ))}
    </section>
  );
}
