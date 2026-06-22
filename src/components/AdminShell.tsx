"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient } from "../lib/auth-client";

interface AdminShellProps {
  user: { id: string; name: string; email: string };
  stores: { id: string; name: string; slug: string }[];
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

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: <IconHome /> },
  { href: "/admin/products", label: "Products", icon: <IconPackage /> },
  { href: "/admin/orders", label: "Orders", icon: <IconCart /> },
  { href: "/admin/customers", label: "Customers", icon: <IconUsers /> },
  { href: "/admin/settings", label: "Settings", icon: <IconSettings /> },
];

export function AdminShell({ user, stores, children }: AdminShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = "/";
  };

  const isActive = (href: string) => {
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
        <div className="admin-section-label">YOUR STORES</div>
        {stores.length === 0 ? (
          <Link href="/admin/stores/new" className="admin-create-store-btn" onClick={() => setSidebarOpen(false)}>
            <IconPlus /> Create Your First Store
          </Link>
        ) : (
          <>
            {stores.map((store) => (
              <div key={store.id} className="admin-store-item">
                <IconStore />
                <span>{store.name}</span>
              </div>
            ))}
            <Link href="/admin/stores/new" className="admin-add-store-link" onClick={() => setSidebarOpen(false)}>
              <IconPlus /> Add Store
            </Link>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="admin-nav">
        <div className="admin-section-label">MENU</div>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`admin-nav-item ${isActive(item.href) ? "active" : ""}`}
            onClick={() => setSidebarOpen(false)}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
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
            <span className="admin-topbar-greeting">
              Welcome back, <strong>{user.name?.split(" ")[0]}</strong>
            </span>
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
