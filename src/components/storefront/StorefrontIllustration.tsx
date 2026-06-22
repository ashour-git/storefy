import type { Locale } from "../../lib/i18n";

interface StorefrontIllustrationProps {
  label: string;
  storeName: string;
  locale: Locale;
}

export function StorefrontIllustration({ label, storeName, locale }: StorefrontIllustrationProps) {
  const rtl = locale === "ar";

  return (
    <div className="store-hero-visual" aria-label={label}>
      <div className="store-hero-orb store-hero-orb-one" />
      <div className="store-hero-orb store-hero-orb-two" />
      <div className="store-hero-phone-shell">
        <div className="store-hero-phone-top">
          <span />
          <strong>{storeName.slice(0, 18)}</strong>
        </div>
        <div className="store-hero-product-stage">
          <div className="store-hero-product-mark">
            <span>{label.slice(0, 1)}</span>
          </div>
          <div className="store-hero-product-lines">
            <span />
            <span />
            <span />
          </div>
        </div>
        <div className="store-hero-mini-grid">
          <span />
          <span />
          <span />
        </div>
      </div>
      <div className={`store-hero-floating-card ${rtl ? "rtl" : ""}`}>
        <small>{rtl ? "جاهز للبيع" : "Ready to sell"}</small>
        <strong>{label}</strong>
      </div>
    </div>
  );
}
