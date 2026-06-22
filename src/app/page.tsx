"use client";

import { useApp } from "../components/AppProvider";
import { AuthModal } from "../components/AuthModal";

/* ─── Inline SVG Icons ─── */
function IconStore() {
  return (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>);
}
function IconAI() {
  return (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2v4a4 4 0 0 0 8 0v-4h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4z"/><circle cx="9" cy="10" r="1"/><circle cx="15" cy="10" r="1"/></svg>);
}
function IconPayment() {
  return (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>);
}
function IconShield() {
  return (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>);
}
function IconGlobe() {
  return (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>);
}
function IconRocket() {
  return (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>);
}
function IconZap() {
  return (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>);
}
function IconCheck() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>);
}
function IconArrowRight() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>);
}
function IconLayers() {
  return (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>);
}
function IconSun() {
  return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>);
}
function IconMoon() {
  return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>);
}
function IconMenu() {
  return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>);
}
function IconX() {
  return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>);
}

/* ─── Data Structures (locale-aware) ─── */
function useFeatures() {
  const { t } = useApp();
  return [
    { icon: <IconStore />, title: t("feat_1_title"), description: t("feat_1_desc") },
    { icon: <IconAI />, title: t("feat_2_title"), description: t("feat_2_desc") },
    { icon: <IconPayment />, title: t("feat_3_title"), description: t("feat_3_desc") },
    { icon: <IconShield />, title: t("feat_4_title"), description: t("feat_4_desc") },
    { icon: <IconGlobe />, title: t("feat_5_title"), description: t("feat_5_desc") },
    { icon: <IconLayers />, title: t("feat_6_title"), description: t("feat_6_desc") },
  ];
}

function useSteps() {
  const { t } = useApp();
  return [
    { number: "01", title: t("how_1_title"), description: t("how_1_desc") },
    { number: "02", title: t("how_2_title"), description: t("how_2_desc") },
    { number: "03", title: t("how_3_title"), description: t("how_3_desc") },
  ];
}

function usePricing() {
  const { t } = useApp();
  return [
    {
      name: t("price_free"), price: "0", period: t("price_forever"),
      description: t("price_free_desc"),
      features: [t("price_free_f1"), t("price_free_f2"), t("price_free_f3"), t("price_free_f4"), t("price_free_f5")],
      cta: t("price_cta_free"), featured: false,
    },
    {
      name: t("price_starter"), price: "199", period: t("price_mo"),
      description: t("price_starter_desc"),
      features: [t("price_starter_f1"), t("price_starter_f2"), t("price_starter_f3"), t("price_starter_f4"), t("price_starter_f5"), t("price_starter_f6")],
      cta: t("price_cta_starter"), featured: true,
    },
    {
      name: t("price_pro"), price: "499", period: t("price_mo"),
      description: t("price_pro_desc"),
      features: [t("price_pro_f1"), t("price_pro_f2"), t("price_pro_f3"), t("price_pro_f4"), t("price_pro_f5"), t("price_pro_f6")],
      cta: t("price_cta_pro"), featured: false,
    },
  ];
}

/* ═══════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════ */
import { useState } from "react";

export default function PlatformLandingPage() {
  const { t, theme, toggleTheme, locale, setLocale, openLogin, openSignup, dir } = useApp();
  const features = useFeatures();
  const steps = useSteps();
  const pricing = usePricing();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen relative overflow-hidden" dir={dir}>
      {/* ─── Background Decoration ─── */}
      <div className="fixed inset-0 grid-bg pointer-events-none" />
      <div
        className="glow-orb animate-pulse-glow"
        style={{ width: 600, height: 600, top: -200, right: -200, background: "radial-gradient(circle, rgba(129,140,248,0.15), transparent 70%)", position: "fixed" }}
      />
      <div
        className="glow-orb animate-pulse-glow"
        style={{ width: 500, height: 500, bottom: -100, left: -150, background: "radial-gradient(circle, rgba(99,102,241,0.1), transparent 70%)", position: "fixed", animationDelay: "2s" }}
      />

      {/* ═══════════════ NAVBAR ═══════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong" id="navbar">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--accent-gradient)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: "white" }}>
              S
            </div>
            <span style={{ fontWeight: 700, fontSize: "1.15rem", letterSpacing: "-0.02em" }}>Storefy</span>
          </div>

          {/* Desktop Nav */}
          <div className="nav-desktop" style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <a href="#features" className="nav-link">{t("nav_features")}</a>
            <a href="#how-it-works" className="nav-link">{t("nav_how")}</a>
            <a href="#pricing" className="nav-link">{t("nav_pricing")}</a>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <div className="toggle-group">
              <button
                className={`toggle-btn ${locale === "en" ? "active" : ""}`}
                onClick={() => setLocale("en")}
                type="button"
              >
                EN
              </button>
              <button
                className={`toggle-btn ${locale === "ar" ? "active" : ""}`}
                onClick={() => setLocale("ar")}
                type="button"
              >
                عر
              </button>
            </div>

            {/* Theme toggle */}
            <div className="toggle-group">
              <button
                className={`toggle-btn ${theme === "light" ? "active" : ""}`}
                onClick={toggleTheme}
                type="button"
                aria-label="Light mode"
              >
                <IconSun />
              </button>
              <button
                className={`toggle-btn ${theme === "dark" ? "active" : ""}`}
                onClick={toggleTheme}
                type="button"
                aria-label="Dark mode"
              >
                <IconMoon />
              </button>
            </div>

            {/* Auth buttons (desktop) */}
            <div className="nav-desktop" style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <button
                onClick={openLogin}
                type="button"
                style={{ color: "var(--text-secondary)", fontSize: "0.9rem", fontWeight: 500, padding: "8px 16px", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}
              >
                {t("nav_login")}
              </button>
              <button
                onClick={openSignup}
                type="button"
                className="btn-primary"
                style={{ padding: "8px 20px", fontSize: "0.85rem" }}
              >
                {t("nav_start")}
              </button>
            </div>

            {/* Mobile hamburger */}
            <button
              className="nav-mobile-menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              style={{ background: "none", border: "none", color: "var(--text-primary)", cursor: "pointer", padding: 4, display: "flex" }}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <IconX /> : <IconMenu />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="nav-mobile-menu" style={{ padding: "16px 24px 20px", borderTop: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: 12 }}>
            <a href="#features" className="nav-link" onClick={() => setMobileMenuOpen(false)}>{t("nav_features")}</a>
            <a href="#how-it-works" className="nav-link" onClick={() => setMobileMenuOpen(false)}>{t("nav_how")}</a>
            <a href="#pricing" className="nav-link" onClick={() => setMobileMenuOpen(false)}>{t("nav_pricing")}</a>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button onClick={() => { openLogin(); setMobileMenuOpen(false); }} type="button" className="btn-secondary" style={{ flex: 1, padding: "10px 16px", fontSize: "0.88rem" }}>
                {t("nav_login")}
              </button>
              <button onClick={() => { openSignup(); setMobileMenuOpen(false); }} type="button" className="btn-primary" style={{ flex: 1, padding: "10px 16px", fontSize: "0.88rem" }}>
                {t("nav_start")}
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* ═══════════════ HERO ═══════════════ */}
      <section id="hero" style={{ paddingTop: 140, paddingBottom: 100 }} className="relative">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="animate-fade-up">
            <div className="section-badge" style={{ margin: "0 auto 20px" }}>
              <IconZap />
              {t("hero_badge")}
            </div>
          </div>

          <h1
            className="animate-fade-up-delay-1 hero-heading"
            style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", fontWeight: 850, letterSpacing: "-0.04em", lineHeight: 1.08, maxWidth: 800, margin: "0 auto 24px" }}
          >
            {t("hero_title_1")}{" "}
            <span className="gradient-text">{t("hero_title_2")}</span>
            <br />
            {t("hero_title_3")}
          </h1>

          <p className="animate-fade-up-delay-2" style={{ fontSize: "1.2rem", lineHeight: 1.7, color: "var(--text-secondary)", maxWidth: 580, margin: "0 auto 40px" }}>
            {t("hero_sub")}
          </p>

          <div className="animate-fade-up-delay-3" style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={openSignup} type="button" className="btn-primary">
              {t("hero_cta")} <IconArrowRight />
            </button>
            <a href="#how-it-works" className="btn-secondary">
              {t("hero_cta2")}
            </a>
          </div>

          {/* Stats Bar */}
          <div className="glass animate-fade-up-delay-3" style={{ marginTop: 72, borderRadius: "var(--radius-xl)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", maxWidth: 700, marginLeft: "auto", marginRight: "auto" }}>
            <div className="stat-card">
              <div className="stat-number gradient-text">50+</div>
              <div className="stat-label">{t("stat_brands")}</div>
            </div>
            <div className="stat-card">
              <div className="stat-number gradient-text">10K+</div>
              <div className="stat-label">{t("stat_orders")}</div>
            </div>
            <div className="stat-card">
              <div className="stat-number gradient-text">99.9%</div>
              <div className="stat-label">{t("stat_uptime")}</div>
            </div>
            <div className="stat-card">
              <div className="stat-number gradient-text-warm">EGP</div>
              <div className="stat-label">{t("stat_currency")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ FEATURES ═══════════════ */}
      <section id="features" style={{ paddingTop: 80, paddingBottom: 80 }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center" style={{ marginBottom: 64 }}>
            <div className="section-badge" style={{ margin: "0 auto 16px" }}>
              <IconRocket />
              {t("feat_badge")}
            </div>
            <h2 className="section-heading">
              {t("feat_heading_1")}{" "}
              <span className="gradient-text">{t("feat_heading_2")}</span>
            </h2>
            <p className="section-subheading" style={{ margin: "0 auto" }}>
              {t("feat_sub")}
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
            {features.map((f, i) => (
              <div key={i} className="feature-card">
                <div className="icon-box">{f.icon}</div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 8 }}>{f.title}</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: 1.7 }}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section id="how-it-works" style={{ paddingTop: 80, paddingBottom: 80 }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center" style={{ marginBottom: 64 }}>
            <div className="section-badge" style={{ margin: "0 auto 16px" }}>
              <IconZap />
              {t("how_badge")}
            </div>
            <h2 className="section-heading">
              {t("how_heading_1")}{" "}
              <span className="gradient-text">{t("how_heading_2")}</span>
            </h2>
            <p className="section-subheading" style={{ margin: "0 auto" }}>
              {t("how_sub")}
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 32, maxWidth: 1000, margin: "0 auto" }}>
            {steps.map((s, i) => (
              <div key={i} className="step-card">
                <div className="gradient-text" style={{ fontSize: "3rem", fontWeight: 900, lineHeight: 1, marginBottom: 16, opacity: 0.4 }}>
                  {s.number}
                </div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 8 }}>{s.title}</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: 1.7 }}>{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ PRICING ═══════════════ */}
      <section id="pricing" style={{ paddingTop: 80, paddingBottom: 100 }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center" style={{ marginBottom: 64 }}>
            <div className="section-badge" style={{ margin: "0 auto 16px" }}>
              💰 {t("price_badge")}
            </div>
            <h2 className="section-heading">
              {t("price_heading_1")}{" "}
              <span className="gradient-text">{t("price_heading_2")}</span>
            </h2>
            <p className="section-subheading" style={{ margin: "0 auto" }}>
              {t("price_sub")}
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24, maxWidth: 960, margin: "0 auto", alignItems: "start" }}>
            {pricing.map((plan, i) => (
              <div key={i} className={`pricing-card ${plan.featured ? "featured" : ""}`}>
                {plan.featured && (
                  <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "var(--accent-gradient)", color: "white", padding: "4px 20px", borderRadius: "var(--radius-full)", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                    {t("price_popular")}
                  </div>
                )}

                <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 12 }}>{plan.name}</h3>

                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
                  <span style={{ fontSize: "3rem", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 }}>
                    {plan.price === "0" ? t("price_free") : plan.price}
                  </span>
                  {plan.price !== "0" && (
                    <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>EGP{plan.period}</span>
                  )}
                </div>

                <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: 28, lineHeight: 1.5 }}>{plan.description}</p>

                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", display: "flex", flexDirection: "column", gap: 14 }}>
                  {plan.features.map((feat, j) => (
                    <li key={j} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                      <span style={{ color: "var(--accent-primary)", flexShrink: 0 }}><IconCheck /></span>
                      {feat}
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={openSignup}
                  className={plan.featured ? "btn-primary" : "btn-secondary"}
                  style={{ width: "100%", justifyContent: "center", textAlign: "center" }}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ CTA BANNER ═══════════════ */}
      <section id="cta" style={{ paddingTop: 40, paddingBottom: 100 }}>
        <div className="max-w-7xl mx-auto px-6">
          <div style={{ borderRadius: "var(--radius-xl)", padding: "64px 40px", textAlign: "center", position: "relative", overflow: "hidden", background: "var(--bg-surface)", border: "1px solid var(--border-accent)" }}>
            <div style={{ position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)", width: 500, height: 300, background: "radial-gradient(circle, rgba(129,140,248,0.12), transparent 70%)", pointerEvents: "none" }} />
            <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 16, position: "relative" }}>
              {t("cta_heading_1")}{" "}
              <span className="gradient-text">{t("cta_heading_2")}</span>
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", maxWidth: 500, margin: "0 auto 32px", lineHeight: 1.7, position: "relative" }}>
              {t("cta_sub")}
            </p>
            <button onClick={openSignup} type="button" className="btn-primary" style={{ position: "relative" }}>
              {t("cta_btn")} <IconArrowRight />
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 48, paddingBottom: 48 }}>
        <div className="max-w-7xl mx-auto px-6">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 40, marginBottom: 48 }}>
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: "var(--accent-gradient)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12, color: "white" }}>S</div>
                <span style={{ fontWeight: 700, fontSize: "1rem" }}>Storefy</span>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.7, maxWidth: 260 }}>{t("footer_desc")}</p>
            </div>

            {/* Product */}
            <div>
              <h4 className="footer-heading">{t("footer_product")}</h4>
              <ul className="footer-links">
                <li><a href="#features">{t("footer_features")}</a></li>
                <li><a href="#pricing">{t("footer_pricing")}</a></li>
                <li><a href="#">{t("footer_integrations")}</a></li>
                <li><a href="#">{t("footer_changelog")}</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="footer-heading">{t("footer_resources")}</h4>
              <ul className="footer-links">
                <li><a href="#">{t("footer_docs")}</a></li>
                <li><a href="#">{t("footer_api")}</a></li>
                <li><a href="#">{t("footer_blog")}</a></li>
                <li><a href="#">{t("footer_support")}</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="footer-heading">{t("footer_company")}</h4>
              <ul className="footer-links">
                <li><a href="#">{t("footer_about")}</a></li>
                <li><a href="#">{t("footer_careers")}</a></li>
                <li><a href="#">{t("footer_contact")}</a></li>
                <li><a href="#">{t("footer_privacy")}</a></li>
              </ul>
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>{t("footer_copy")}</p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>{t("footer_made")}</p>
          </div>
        </div>
      </footer>

      {/* ═══════════════ AUTH MODAL ═══════════════ */}
      <AuthModal />
    </div>
  );
}
