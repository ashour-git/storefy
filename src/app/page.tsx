import Link from "next/link";

/* ─── Icon Components (inline SVG, no dependency) ─── */
function IconStore() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  );
}
function IconAI() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2v4a4 4 0 0 0 8 0v-4h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4z"/><circle cx="9" cy="10" r="1"/><circle cx="15" cy="10" r="1"/></svg>
  );
}
function IconPayment() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
  );
}
function IconShield() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  );
}
function IconGlobe() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
  );
}
function IconRocket() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>
  );
}
function IconZap() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
  );
}
function IconCheck() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
  );
}
function IconArrowRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
  );
}
function IconLayers() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
  );
}

/* ─── Data ─── */
const features = [
  {
    icon: <IconStore />,
    title: "Multi-Tenant Storefronts",
    description:
      "Every brand gets its own subdomain with isolated data, custom themes, and independent settings. One platform, unlimited stores.",
  },
  {
    icon: <IconAI />,
    title: "AI Product Descriptions",
    description:
      "Generate compelling, SEO-optimized product descriptions in Arabic and English with a single click. Powered by Groq inference.",
  },
  {
    icon: <IconPayment />,
    title: "Paymob Integration",
    description:
      "Accept credit cards, mobile wallets, and cash-on-delivery across Egypt with Paymob's payment gateway — fully integrated.",
  },
  {
    icon: <IconShield />,
    title: "Enterprise-Grade Security",
    description:
      "Row-Level Security on every table, tenant-scoped database transactions, and server-side-only tenant resolution. Zero data leakage.",
  },
  {
    icon: <IconGlobe />,
    title: "Custom Domains & Arabic-First",
    description:
      "Map your own domain, set Arabic as the default locale, and price in EGP. Built from the ground up for the Egyptian market.",
  },
  {
    icon: <IconLayers />,
    title: "Drag & Drop Page Builder",
    description:
      "Build landing pages, product showcases, and collection grids with a visual block editor — no coding required.",
  },
];

const pricingPlans = [
  {
    name: "Free",
    price: "0",
    period: "forever",
    description: "Perfect for testing and launching your first store",
    features: [
      "1 storefront",
      "25 products",
      "Paymob payments",
      "Basic analytics",
      "Community support",
    ],
    cta: "Start Free",
    featured: false,
  },
  {
    name: "Starter",
    price: "199",
    period: "/mo",
    description: "For growing brands ready to scale",
    features: [
      "Unlimited products",
      "Custom domain",
      "AI descriptions (500/mo)",
      "AI chat assistant",
      "Priority support",
      "Advanced analytics",
    ],
    cta: "Start Growing",
    featured: true,
  },
  {
    name: "Pro",
    price: "499",
    period: "/mo",
    description: "For established brands with high volume",
    features: [
      "Everything in Starter",
      "Unlimited AI usage",
      "POS integration",
      "Multi-staff accounts",
      "Webhooks & API access",
      "Dedicated account manager",
    ],
    cta: "Go Pro",
    featured: false,
  },
];

const steps = [
  {
    number: "01",
    title: "Sign Up & Name Your Store",
    description: "Create your account and pick a subdomain. Your store is live in under 60 seconds.",
  },
  {
    number: "02",
    title: "Add Products with AI",
    description: "Upload photos, let AI write your descriptions in Arabic or English, set your prices in EGP.",
  },
  {
    number: "03",
    title: "Connect Paymob & Launch",
    description: "Plug in your Paymob credentials, customize your theme, and start selling to customers across Egypt.",
  },
];

export default function PlatformLandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* ─── Background Decoration ─── */}
      <div className="fixed inset-0 grid-bg pointer-events-none" />
      <div
        className="glow-orb animate-pulse-glow"
        style={{
          width: 600,
          height: 600,
          top: -200,
          right: -200,
          background: "radial-gradient(circle, rgba(129,140,248,0.15), transparent 70%)",
          position: "fixed",
        }}
      />
      <div
        className="glow-orb animate-pulse-glow"
        style={{
          width: 500,
          height: 500,
          bottom: -100,
          left: -150,
          background: "radial-gradient(circle, rgba(99,102,241,0.1), transparent 70%)",
          position: "fixed",
          animationDelay: "2s",
        }}
      />

      {/* ═══════════════ NAVBAR ═══════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "var(--accent-gradient)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 14,
                color: "white",
              }}
            >
              S
            </div>
            <span style={{ fontWeight: 700, fontSize: "1.15rem", letterSpacing: "-0.02em" }}>
              Storefy
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" style={{ color: "var(--text-secondary)", fontSize: "0.9rem", fontWeight: 500, textDecoration: "none", transition: "color 0.2s" }}>
              Features
            </a>
            <a href="#how-it-works" style={{ color: "var(--text-secondary)", fontSize: "0.9rem", fontWeight: 500, textDecoration: "none", transition: "color 0.2s" }}>
              How it Works
            </a>
            <a href="#pricing" style={{ color: "var(--text-secondary)", fontSize: "0.9rem", fontWeight: 500, textDecoration: "none", transition: "color 0.2s" }}>
              Pricing
            </a>
          </div>

          <div className="flex items-center gap-3">
            <a href="#" style={{ color: "var(--text-secondary)", fontSize: "0.9rem", fontWeight: 500, textDecoration: "none", padding: "8px 16px" }}>
              Log in
            </a>
            <a
              href="#pricing"
              className="btn-primary"
              style={{ padding: "8px 20px", fontSize: "0.85rem" }}
            >
              Start Free
            </a>
          </div>
        </div>
      </nav>

      {/* ═══════════════ HERO ═══════════════ */}
      <section
        style={{ paddingTop: 140, paddingBottom: 100 }}
        className="relative"
      >
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="animate-fade-up">
            <div className="section-badge" style={{ margin: "0 auto 20px" }}>
              <IconZap />
              Now in Early Access — Egypt&apos;s first AI e-commerce platform
            </div>
          </div>

          <h1
            className="animate-fade-up-delay-1"
            style={{
              fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
              fontWeight: 850,
              letterSpacing: "-0.04em",
              lineHeight: 1.08,
              maxWidth: 800,
              margin: "0 auto 24px",
            }}
          >
            Launch your online store{" "}
            <span className="gradient-text">in minutes,</span>
            <br />
            not months.
          </h1>

          <p
            className="animate-fade-up-delay-2"
            style={{
              fontSize: "1.2rem",
              lineHeight: 1.7,
              color: "var(--text-secondary)",
              maxWidth: 580,
              margin: "0 auto 40px",
            }}
          >
            Storefy gives Egyptian brands a complete e-commerce platform with
            AI-generated product descriptions, Paymob payments, and a
            fully-hosted storefront — no code needed.
          </p>

          <div
            className="animate-fade-up-delay-3"
            style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}
          >
            <a href="#pricing" className="btn-primary">
              Create Your Store <IconArrowRight />
            </a>
            <a href="#how-it-works" className="btn-secondary">
              See How it Works
            </a>
          </div>

          {/* ─── Stats Bar ─── */}
          <div
            className="glass animate-fade-up-delay-3"
            style={{
              marginTop: 72,
              borderRadius: "var(--radius-xl)",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              maxWidth: 700,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            <div className="stat-card">
              <div className="stat-number gradient-text">50+</div>
              <div className="stat-label">Brands Onboarded</div>
            </div>
            <div className="stat-card">
              <div className="stat-number gradient-text">10K+</div>
              <div className="stat-label">Orders Processed</div>
            </div>
            <div className="stat-card">
              <div className="stat-number gradient-text">99.9%</div>
              <div className="stat-label">Uptime SLA</div>
            </div>
            <div className="stat-card">
              <div className="stat-number gradient-text-warm">EGP</div>
              <div className="stat-label">Native Currency</div>
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
              Platform Features
            </div>
            <h2 className="section-heading">
              Everything you need to{" "}
              <span className="gradient-text">sell online</span>
            </h2>
            <p className="section-subheading" style={{ margin: "0 auto" }}>
              From AI-powered content to secure payments — every feature is built
              for the Egyptian market from day one.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 24,
            }}
          >
            {features.map((f, i) => (
              <div key={i} className="feature-card">
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "var(--radius-md)",
                    background: "rgba(129, 140, 248, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--accent-primary)",
                    marginBottom: 20,
                  }}
                >
                  {f.icon}
                </div>
                <h3
                  style={{
                    fontSize: "1.15rem",
                    fontWeight: 700,
                    letterSpacing: "-0.01em",
                    marginBottom: 8,
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.92rem",
                    lineHeight: 1.7,
                  }}
                >
                  {f.description}
                </p>
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
              How it Works
            </div>
            <h2 className="section-heading">
              Three steps to your{" "}
              <span className="gradient-text">first sale</span>
            </h2>
            <p className="section-subheading" style={{ margin: "0 auto" }}>
              No technical setup. No server configuration. Just you, your
              products, and your customers.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 32,
              maxWidth: 1000,
              margin: "0 auto",
            }}
          >
            {steps.map((s, i) => (
              <div
                key={i}
                style={{
                  position: "relative",
                  padding: "32px 28px",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border-subtle)",
                  background: "var(--bg-surface)",
                }}
              >
                <div
                  style={{
                    fontSize: "3rem",
                    fontWeight: 900,
                    background: "var(--accent-gradient)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    lineHeight: 1,
                    marginBottom: 16,
                    opacity: 0.4,
                  }}
                >
                  {s.number}
                </div>
                <h3
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: 700,
                    letterSpacing: "-0.01em",
                    marginBottom: 8,
                  }}
                >
                  {s.title}
                </h3>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.92rem",
                    lineHeight: 1.7,
                  }}
                >
                  {s.description}
                </p>
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
              💰 Pricing
            </div>
            <h2 className="section-heading">
              Simple pricing,{" "}
              <span className="gradient-text">serious value</span>
            </h2>
            <p className="section-subheading" style={{ margin: "0 auto" }}>
              Start free. Upgrade when you&apos;re ready. All prices in Egyptian
              Pounds.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 24,
              maxWidth: 960,
              margin: "0 auto",
              alignItems: "start",
            }}
          >
            {pricingPlans.map((plan, i) => (
              <div
                key={i}
                className={`pricing-card ${plan.featured ? "featured" : ""}`}
              >
                {plan.featured && (
                  <div
                    style={{
                      position: "absolute",
                      top: -12,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "var(--accent-gradient)",
                      color: "white",
                      padding: "4px 20px",
                      borderRadius: "var(--radius-full)",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Most Popular
                  </div>
                )}

                <h3
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    marginBottom: 12,
                  }}
                >
                  {plan.name}
                </h3>

                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
                  <span
                    style={{
                      fontSize: "3rem",
                      fontWeight: 800,
                      letterSpacing: "-0.03em",
                      lineHeight: 1,
                    }}
                  >
                    {plan.price === "0" ? "Free" : `${plan.price}`}
                  </span>
                  {plan.price !== "0" && (
                    <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                      EGP{plan.period}
                    </span>
                  )}
                </div>

                <p
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "0.88rem",
                    marginBottom: 28,
                    lineHeight: 1.5,
                  }}
                >
                  {plan.description}
                </p>

                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", display: "flex", flexDirection: "column", gap: 14 }}>
                  {plan.features.map((feat, j) => (
                    <li
                      key={j}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        fontSize: "0.9rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      <span style={{ color: "var(--accent-primary)", flexShrink: 0 }}>
                        <IconCheck />
                      </span>
                      {feat}
                    </li>
                  ))}
                </ul>

                <a
                  href="#"
                  className={plan.featured ? "btn-primary" : "btn-secondary"}
                  style={{ width: "100%", justifyContent: "center", textAlign: "center" }}
                >
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ CTA BANNER ═══════════════ */}
      <section style={{ paddingTop: 40, paddingBottom: 100 }}>
        <div className="max-w-7xl mx-auto px-6">
          <div
            style={{
              borderRadius: "var(--radius-xl)",
              padding: "64px 40px",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
              background: "var(--bg-surface)",
              border: "1px solid var(--border-accent)",
            }}
          >
            {/* Inner glow */}
            <div
              style={{
                position: "absolute",
                top: -100,
                left: "50%",
                transform: "translateX(-50%)",
                width: 500,
                height: 300,
                background: "radial-gradient(circle, rgba(129,140,248,0.12), transparent 70%)",
                pointerEvents: "none",
              }}
            />
            <h2
              style={{
                fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                lineHeight: 1.15,
                marginBottom: 16,
                position: "relative",
              }}
            >
              Ready to build your{" "}
              <span className="gradient-text">online empire?</span>
            </h2>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "1.1rem",
                maxWidth: 500,
                margin: "0 auto 32px",
                lineHeight: 1.7,
                position: "relative",
              }}
            >
              Join hundreds of Egyptian brands already selling on Storefy. Your
              store is one click away.
            </p>
            <a href="#" className="btn-primary" style={{ position: "relative" }}>
              Create Your Free Store <IconArrowRight />
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer
        style={{
          borderTop: "1px solid var(--border-subtle)",
          paddingTop: 48,
          paddingBottom: 48,
        }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 40,
              marginBottom: 48,
            }}
          >
            {/* Brand column */}
            <div>
              <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    background: "var(--accent-gradient)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 12,
                    color: "white",
                  }}
                >
                  S
                </div>
                <span style={{ fontWeight: 700, fontSize: "1rem" }}>Storefy</span>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.7, maxWidth: 260 }}>
                The AI-powered e-commerce platform built for Egyptian brands. Sell
                online with zero friction.
              </p>
            </div>

            {/* Links columns */}
            <div>
              <h4
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--text-muted)",
                  marginBottom: 16,
                }}
              >
                Product
              </h4>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {["Features", "Pricing", "Integrations", "Changelog"].map((l) => (
                  <li key={l}>
                    <a href="#" style={{ color: "var(--text-secondary)", fontSize: "0.9rem", textDecoration: "none" }}>
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--text-muted)",
                  marginBottom: 16,
                }}
              >
                Resources
              </h4>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {["Documentation", "API Reference", "Blog", "Support"].map((l) => (
                  <li key={l}>
                    <a href="#" style={{ color: "var(--text-secondary)", fontSize: "0.9rem", textDecoration: "none" }}>
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--text-muted)",
                  marginBottom: 16,
                }}
              >
                Company
              </h4>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {["About", "Careers", "Contact", "Privacy Policy"].map((l) => (
                  <li key={l}>
                    <a href="#" style={{ color: "var(--text-secondary)", fontSize: "0.9rem", textDecoration: "none" }}>
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div
            style={{
              borderTop: "1px solid var(--border-subtle)",
              paddingTop: 24,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
              © 2026 Storefy. All rights reserved.
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
              Made with 💜 in Cairo, Egypt
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
