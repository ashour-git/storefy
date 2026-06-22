interface ProductImagePlaceholderProps {
  name: string;
}

export function ProductImagePlaceholder({ name }: ProductImagePlaceholderProps) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="store-product-placeholder" aria-hidden="true">
      <div className="store-product-placeholder-orb one" />
      <div className="store-product-placeholder-orb two" />
      <div className="store-product-placeholder-card">
        <span>{initials || "SF"}</span>
      </div>
    </div>
  );
}
