"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AgriNexusWordmark } from "@/app/components/Logo";
import { useAuth } from "@/lib/context/AuthProvider";
import { DEMO_TENANTS } from "@/lib/auth/demo-personas";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: "grid", exact: true },
  { href: "/dashboard/cohorts", label: "Cohorts", icon: "users" },
  { href: "/dashboard/billing", label: "Billing", icon: "billing" },
  { href: "/dashboard/activity", label: "Activity", icon: "activity" },
];

function NavIcon({ name }: { name: string }) {
  const icons: Record<string, React.ReactNode> = {
    grid: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
    users: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    billing: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    activity: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12h4l3 8 4-16 3 8h4" />
      </svg>
    ),
  };
  return icons[name] || null;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { tenantId, tenantName, role, loading, logout, switchTenant, authHeaders } = useAuth();
  const [tenantInfo, setTenantInfo] = useState<{ plan?: string } | null>(null);

  useEffect(() => {
    if (!tenantId) return;
    fetch("/api/overview", { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => setTenantInfo(d.tenant))
      .catch(() => {});
  }, [tenantId, authHeaders]);

  const initials = tenantName
    ? tenantName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "??";

  if (loading) {
    return (
      <div className="min-h-screen flex" role="status" aria-label="Loading dashboard">
        <aside className="w-64 sidebar flex flex-col shrink-0">
          <div className="p-5" style={{ borderBottom: "1px solid var(--color-sidebar-border)" }}>
            <div className="skeleton" style={{ width: 124, height: 30, opacity: 0.22 }} />
          </div>
          <div className="flex-1 p-3 space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton" style={{ height: 36, opacity: 0.16 }} />
            ))}
          </div>
        </aside>
        <main className="flex-1 p-8" style={{ background: "var(--color-page-bg)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div className="skeleton" style={{ width: 240, height: 28, marginBottom: 12 }} />
            <div className="skeleton" style={{ width: 360, height: 16, marginBottom: 32 }} />
            <div className="grid md:grid-cols-3 gap-6">
              {[0, 1, 2].map((i) => (
                <div key={i} className="skeleton" style={{ height: 120 }} />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 sidebar flex flex-col shrink-0">
        <div className="p-5" style={{ borderBottom: "1px solid var(--color-sidebar-border)" }}>
          <Link href="/" aria-label="Outturn home" title="Back to home">
            <AgriNexusWordmark light />
          </Link>
        </div>

        <nav className="flex-1 p-3">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`sidebar-nav-item ${isActive ? "sidebar-nav-item-active" : ""}`}
                  >
                    <NavIcon name={item.icon} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Tenant switcher */}
        <div className="px-4 pb-3">
          <label htmlFor="tenant-switcher" className="text-xs font-medium uppercase tracking-wide px-2 mb-1 block" style={{ color: "var(--color-sidebar-text)" }}>
            Viewing as
          </label>
          <select
            id="tenant-switcher"
            aria-label="Viewing as tenant"
            value={tenantId}
            onChange={(e) => switchTenant(e.target.value)}
            className="w-full text-sm rounded-lg px-3 py-2 border-0 outline-none"
            style={{
              background: "var(--color-sidebar-hover)",
              color: "var(--color-sidebar-text-active)",
            }}
          >
            {DEMO_TENANTS.map((t) => (
              <option key={t.tenantId} value={t.tenantId} style={{ color: "#101828" }}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className="p-4" style={{ borderTop: "1px solid var(--color-sidebar-border)" }}>
          <div className="flex items-center gap-3 px-2 mb-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium"
              style={{ background: "var(--color-sidebar-active)", color: "var(--color-primary-muted)" }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: "var(--color-sidebar-text-active)" }}>
                {tenantName || "Partner"}
              </p>
              <p className="text-xs truncate capitalize" style={{ color: "var(--color-sidebar-text)" }}>
                {role} · {tenantInfo?.plan || "—"} plan
              </p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="w-full text-left text-xs px-2 py-1 rounded hover:opacity-80"
            style={{ color: "var(--color-sidebar-text)" }}
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto" style={{ background: "var(--color-page-bg)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>{children}</div>
      </main>
    </div>
  );
}
