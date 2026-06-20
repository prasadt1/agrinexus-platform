"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, Badge, EmptyState } from "@/app/components";

const TENANT_ID = "demo-tenant-001";

type OverviewData = {
  totals: {
    farmers: number;
    cohorts: number;
    activeCohorts: number;
    nudgesSent: number;
    nudgesCompleted: number;
    nudgesExpired: number;
    responseRate: number;
  };
  cohorts: Array<{
    cohortId: string;
    district: string;
    status: "draft" | "active" | "paused" | "expired";
    crops: string[];
    nudgesSent: number;
    nudgesCompleted: number;
    responseRate: number;
    lastUpdatedAt?: string;
  }>;
};

export default function OverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverview();
  }, []);

  async function fetchOverview() {
    try {
      const res = await fetch("/api/overview", {
        headers: { "X-Tenant-ID": TENANT_ID },
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to fetch overview:", err);
    } finally {
      setLoading(false);
    }
  }

  const totals = data?.totals;
  const cohorts = data?.cohorts || [];
  const activeCohorts = cohorts.filter((c) => c.status === "active");
  const topCohorts = cohorts.filter((c) => c.nudgesSent > 0).slice(0, 5);

  return (
    <div className="py-10 px-8">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-page-title">Overview</h1>
        <p className="mt-1" style={{ color: "var(--color-text-secondary)" }}>
          Aggregate performance across all cohorts
        </p>
      </header>

      {/* Primary KPI Cards */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <KPICard
          label="Farmers Enrolled"
          value={totals?.farmers || 0}
          format="number"
          loading={loading}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <KPICard
          label="Advisories Sent"
          value={totals?.nudgesSent || 0}
          format="number"
          loading={loading}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          }
        />
        <KPICard
          label="Responses"
          value={totals?.nudgesCompleted || 0}
          format="number"
          loading={loading}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <KPICard
          label="Response Rate"
          value={totals?.responseRate || 0}
          format="percent"
          loading={loading}
          highlight
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
      </section>

      {/* Response Breakdown */}
      {!loading && totals && totals.nudgesSent > 0 && (
        <section className="mb-8">
          <Card>
            <h2 className="text-card-title mb-6">Response Breakdown</h2>
            <div className="flex items-center gap-8">
              <div className="flex-1">
                {/* Stacked bar */}
                <div className="mb-4">
                  <div
                    className="h-10 rounded-lg overflow-hidden flex"
                    style={{ background: "var(--color-page-bg)" }}
                  >
                    {/* Completed (green) */}
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${(totals.nudgesCompleted / totals.nudgesSent) * 100}%`,
                        background: "var(--color-chart-1)",
                      }}
                    />
                    {/* Pending (teal) */}
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${(Math.max(0, totals.nudgesSent - totals.nudgesCompleted - totals.nudgesExpired) / totals.nudgesSent) * 100}%`,
                        background: "var(--color-chart-2)",
                      }}
                    />
                    {/* Expired (amber) */}
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${(totals.nudgesExpired / totals.nudgesSent) * 100}%`,
                        background: "var(--color-chart-3)",
                      }}
                    />
                  </div>
                </div>
                {/* Legend */}
                <div className="flex gap-6 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ background: "var(--color-chart-1)" }} />
                    <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                      Completed ({totals.nudgesCompleted})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ background: "var(--color-chart-2)" }} />
                    <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                      Pending ({Math.max(0, totals.nudgesSent - totals.nudgesCompleted - totals.nudgesExpired)})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ background: "var(--color-chart-3)" }} />
                    <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                      Expired ({totals.nudgesExpired})
                    </span>
                  </div>
                </div>
              </div>
              {/* Big number */}
              <div className="text-center px-8 border-l" style={{ borderColor: "var(--color-border)" }}>
                <p className="text-kpi" style={{ color: "var(--color-primary)" }}>
                  {Math.round(totals.responseRate * 100)}%
                </p>
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                  Overall Response Rate
                </p>
              </div>
            </div>
          </Card>
        </section>
      )}

      {/* Two Column: Top Cohorts + Quick Stats */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Top Performing Cohorts */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-card-title">Top Performing Cohorts</h2>
              <Link
                href="/dashboard/cohorts"
                className="text-sm font-medium"
                style={{ color: "var(--color-primary)" }}
              >
                View all →
              </Link>
            </div>

            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 rounded-lg" style={{ background: "var(--color-border)" }} />
                ))}
              </div>
            ) : topCohorts.length > 0 ? (
              <div className="space-y-3">
                {topCohorts.map((cohort, idx) => (
                  <CohortRow key={cohort.cohortId} cohort={cohort} rank={idx + 1} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No activity yet"
                description="Advisories will appear here once farmers start receiving them."
              />
            )}
          </Card>
        </div>

        {/* Quick Stats */}
        <div>
          <Card>
            <h2 className="text-card-title mb-6">Cohort Summary</h2>
            <div className="space-y-4">
              <QuickStatRow
                label="Total Cohorts"
                value={totals?.cohorts || 0}
                loading={loading}
              />
              <QuickStatRow
                label="Active"
                value={totals?.activeCohorts || 0}
                loading={loading}
                color="var(--color-status-active)"
              />
              <QuickStatRow
                label="Draft"
                value={(totals?.cohorts || 0) - (totals?.activeCohorts || 0)}
                loading={loading}
                color="var(--color-text-muted)"
              />
              <div className="border-t pt-4" style={{ borderColor: "var(--color-border)" }}>
                <QuickStatRow
                  label="Expired Nudges"
                  value={totals?.nudgesExpired || 0}
                  loading={loading}
                  color="var(--color-chart-3)"
                />
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Active Cohorts List */}
      <section>
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-card-title">Active Cohorts</h2>
            <span
              className="text-sm px-2 py-1 rounded"
              style={{ background: "var(--color-primary-tint)", color: "var(--color-primary)" }}
            >
              {activeCohorts.length} active
            </span>
          </div>

          {loading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 rounded" style={{ background: "var(--color-border)" }} />
              ))}
            </div>
          ) : activeCohorts.length > 0 ? (
            <div className="divide-y" style={{ borderColor: "var(--color-border)" }}>
              {activeCohorts.map((cohort) => (
                <Link
                  key={cohort.cohortId}
                  href={`/dashboard/cohorts/${cohort.cohortId}`}
                  className="flex items-center justify-between py-4 transition-colors hover:bg-opacity-50"
                  style={{ background: "transparent" }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ background: "var(--color-primary-tint)", color: "var(--color-primary)" }}
                    >
                      {cohort.district.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{cohort.district}</p>
                      <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                        {cohort.crops.join(", ")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm font-medium">{cohort.nudgesSent} sent</p>
                      <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                        {cohort.nudgesCompleted} completed
                      </p>
                    </div>
                    <Badge status={cohort.status} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No active cohorts"
              description="Activate a cohort to start monitoring farmer engagement."
              action={
                <Link href="/dashboard/cohorts">
                  <button className="btn btn-primary">Manage Cohorts</button>
                </Link>
              }
            />
          )}
        </Card>
      </section>
    </div>
  );
}

// =============================================================================
// KPI Card Component
// =============================================================================

function KPICard({
  label,
  value,
  format,
  highlight,
  loading,
  icon,
}: {
  label: string;
  value: number;
  format: "number" | "percent";
  highlight?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}) {
  const displayValue = loading
    ? "—"
    : format === "percent"
    ? `${Math.round(value * 100)}%`
    : value.toLocaleString();

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-label mb-2">{label}</p>
          {loading ? (
            <div className="h-9 w-20 rounded animate-pulse" style={{ background: "var(--color-page-bg)" }} />
          ) : (
            <p
              className="text-kpi"
              style={{
                color: highlight ? "var(--color-primary)" : "var(--color-text-primary)",
              }}
            >
              {displayValue}
            </p>
          )}
        </div>
        {icon && (
          <div
            className="p-2 rounded-lg"
            style={{
              background: "var(--color-primary-tint)",
              color: "var(--color-primary)",
            }}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

// =============================================================================
// Cohort Row Component (for Top Performing)
// =============================================================================

function CohortRow({
  cohort,
  rank,
}: {
  cohort: {
    cohortId: string;
    district: string;
    crops: string[];
    nudgesSent: number;
    nudgesCompleted: number;
    responseRate: number;
  };
  rank: number;
}) {
  return (
    <Link
      href={`/dashboard/cohorts/${cohort.cohortId}`}
      className="flex items-center gap-4 p-4 rounded-lg transition-colors"
      style={{ background: "var(--color-page-bg)" }}
    >
      {/* Rank */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium"
        style={{
          background: rank <= 3 ? "var(--color-primary-tint)" : "var(--color-border)",
          color: rank <= 3 ? "var(--color-primary)" : "var(--color-text-muted)",
        }}
      >
        {rank}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{cohort.district}</p>
        <p className="text-sm truncate" style={{ color: "var(--color-text-muted)" }}>
          {cohort.crops.join(", ")}
        </p>
      </div>

      {/* Stats */}
      <div className="text-right flex-shrink-0">
        <p className="font-medium" style={{ color: "var(--color-primary)" }}>
          {Math.round(cohort.responseRate * 100)}%
        </p>
        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          {cohort.nudgesCompleted}/{cohort.nudgesSent} responded
        </p>
      </div>
    </Link>
  );
}

// =============================================================================
// Quick Stat Row Component
// =============================================================================

function QuickStatRow({
  label,
  value,
  loading,
  color,
}: {
  label: string;
  value: number;
  loading?: boolean;
  color?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
        {label}
      </span>
      {loading ? (
        <div className="h-5 w-8 rounded animate-pulse" style={{ background: "var(--color-page-bg)" }} />
      ) : (
        <span className="font-medium" style={{ color: color || "var(--color-text-primary)" }}>
          {value}
        </span>
      )}
    </div>
  );
}
