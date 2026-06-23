"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient } from "../lib/auth-client";
import { getStoreUrl } from "../lib/store-utils";

interface AdminShellProps {
  user: { id: string; name: string; email: string };
  stores: { id: string; name: string; slug: string; customDomain?: string | null }[];
  children: React.ReactNode;
}

/* ─── SVG Icons ─── */
function IconHome() {
  return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>);
}
function IconPackage() {
  return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>);
}
function IconCart() {
  return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>);
}
function IconSettings() {
  return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>);
}
function IconStore() {
  return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>);
}
function IconPlus() {
  return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>);
}
function IconLogOut() {
  return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>);
}
function IconMenu() {
  return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>);
}
function IconX() {
  return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>);
}
function IconUsers() {
  return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>);
}
function IconPalette() {
  return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12c0-3.35 1.644-6.315 4.158-8.158"/><circle cx="8" cy="8" r="1.5" fill="currentColor"/><circle cx="12" cy="6" r="1.5" fill="currentColor"/><circle cx="16" cy="8" r="1.5" fill="currentColor"/><circle cx="16" cy="14" r="1.5" fill="currentColor"/></svg>);
}
function IconAI() {
  return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/><circle cx="7.5" cy="14.5" r="1.5" fill="currentColor"/><circle cx="16.5" cy="14.5" r="1.5" fill="currentColor"/></svg>);
}

const NAV_SECTIONS = [
  {
    label: "OVERVIEW",
    items: [
      { href: "/admin", label: "Dashboard", icon: <IconHome /> },
    ],
  },
  {
    label: "CATALOG",
    items: [
      { href: "/admin/products", label: "Products", icon: <IconPackage /> },
      { href: "/admin/collections", label: "Collections", icon: <IconStore /> },
      { href: "/admin/orders", label: "Orders", icon: <IconCart /> },
      { href: "/admin/customers", label: "Customers", icon: <IconUsers /> },
    ],
  },
  {
    label: "PROMOTIONS",
    items: [
      { href: "/admin/discounts", label: "Discounts", icon: <IconPlus /> },
      { href: "/admin/shipping", label: "Shipping", icon: <IconCart /> },
    ],
  },
  {
    label: "CHANNELS",
    items: [
      { href: "/admin/themes", label: "Design Store", icon: <IconPalette /> },
      { href: "/admin/ai", label: "AI Advisor", icon: <IconAI />, badge: "AI" },
    ],
  },
  {
    label: "CONFIG",
    items: [
      { href: "/admin/payments", label: "Payments", icon: <IconSettings /> },
      { href: "/admin/settings", label: "Settings", icon: <IconSettings /> },
    ],
  },
];

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  const crumbs: { label: string; href?: string }[] = [{ label: 'Home', href: '/admin' }];

  const labelMap: Record<string, string> = {
    admin: 'Dashboard',
    products: 'Products',
    orders: 'Orders',
    customers: 'Customers',
    discounts: 'Discounts',
    shipping: 'Shipping',
    themes: 'Design Store',
    ai: 'AI Advisor',
    payments: 'Payments',
    settings: 'Settings',
    collections: 'Collections',
    stores: 'Stores',
    new: 'New',
    edit: 'Edit',
  };

  let path = '';
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (seg === 'admin') { path = '/admin'; continue; }
    path += `/${seg}`;
    const isLast = i === segments.length - 1;
    crumbs.push({
      label: labelMap[seg] || seg.charAt(0).toUpperCase() + seg.slice(1),
      href: isLast ? undefined : path,
    });
  }

  return crumbs;
}

export function AdminShell({ user, stores, children }: AdminShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => { if (typeof window !== 'undefined') return (localStorage.getItem('sf-theme') as 'dark' | 'light') || 'dark'; return 'dark'; });

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('sf-theme', next);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  useEffect(() => {
    if (!sidebarOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sidebarOpen]);

  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = "/";
  };

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="admin-sidebar-logo">
        <div className="admin-logo-icon">S</div>
        <span className="admin-logo-text">Storefy</span>
        <span className="admin-logo-badge">Admin</span>
      </div>

      {/* Store selector */}
      <div className="admin-store-section">
        <h2 className="admin-section-label">YOUR STORES</h2>
        {stores.length === 0 ? (
          <Link href="/admin/stores/new" className="admin-create-store-btn" onClick={() => setSidebarOpen(false)}>
            <IconPlus /> Create Your First Store
          </Link>
        ) : (
          <>
            {stores.map((store) => {
              const storeUrl = getStoreUrl(store.slug, undefined, store.customDomain);
              return (
                <a
                  key={store.id}
                  href={storeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="admin-store-item"
                  style={{ textDecoration: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}
                  title="Open storefront"
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <IconStore />
                    <span>{store.name}</span>
                  </div>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </a>
              );
            })}
            <Link href="/admin/stores/new" className="admin-add-store-link" onClick={() => setSidebarOpen(false)}>
              <IconPlus /> Add Store
            </Link>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="admin-nav">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="admin-nav-section">
            <h2 className="admin-section-label">{section.label}</h2>
            {section.items.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`admin-nav-item ${active ? "active" : ""}`}
                  onClick={() => setSidebarOpen(false)}
                  aria-current={active ? "page" : undefined}
                  style={item.badge ? { position: "relative" } : undefined}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span style={{
                      marginLeft: "auto",
                      fontSize: "0.6rem",
                      fontWeight: 800,
                      letterSpacing: "0.05em",
                      padding: "2px 6px",
                      borderRadius: 99,
                      background: "linear-gradient(135deg, #818cf8, #6366f1)",
                      color: "white",
                      lineHeight: 1,
                    }}>{item.badge}</span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User section */}
      <div className="admin-user-section">
        <div className="admin-user-info">
          <div className="admin-user-avatar">
            {user.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="admin-user-details">
            <div className="admin-user-name">{user.name}</div>
            <div className="admin-user-email">{user.email}</div>
          </div>
        </div>
        <button onClick={handleSignOut} className="admin-signout-btn" type="button" title="Sign out">
          <IconLogOut />
        </button>
      </div>
    </>
  );

  return (
    <div className="admin-layout">
      {/* Desktop sidebar */}
      <aside className="admin-sidebar admin-sidebar-desktop">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="admin-sidebar-overlay" onClick={() => setSidebarOpen(false)}>
          <aside className="admin-sidebar admin-sidebar-mobile" onClick={(e) => e.stopPropagation()}>
            <button className="admin-sidebar-close" onClick={() => setSidebarOpen(false)} type="button">
              <IconX />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="admin-main">
        {/* Top bar */}
        <header className="admin-topbar">
          <button
            className="admin-mobile-menu-btn"
            onClick={() => setSidebarOpen(true)}
            type="button"
            aria-label="Open menu"
          >
            <IconMenu />
          </button>
          <div className="admin-topbar-right">
            <button
              onClick={toggleTheme}
              type="button"
              className="admin-theme-toggle"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              )}
            </button>
            <span className="admin-topbar-greeting">
              Welcome back, <strong>{user.name?.split(" ")[0]}</strong>
            </span>
          </div>
          {/* Breadcrumbs */}
          <div className="admin-breadcrumbs">
            {pathname && getBreadcrumbs(pathname).map((crumb, i) => (
              <span key={crumb.href || 'current'} className="admin-breadcrumb-item">
                {i > 0 && <span className="admin-breadcrumb-sep">/</span>}
                {crumb.href ? (
                  <Link href={crumb.href} className="admin-breadcrumb-link">{crumb.label}</Link>
                ) : (
                  <span className="admin-breadcrumb-current">{crumb.label}</span>
                )}
              </span>
            ))}
          </div>
        </header>

        {/* Page content */}
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
}
