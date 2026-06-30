"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, EmptyState, AdvisoryLoopHero, LineageBadge, HowItWorks, Term, DistrictThumb, MaharashtraMap, DashboardTour, OnboardingWelcome } from "@/app/components";
import { useAuth } from "@/lib/context/AuthProvider";
import { attentionFor } from "@/lib/attention";

type OverviewData = {
  tenant: {
    tenantId: string;
    name: string;
    type: string;
    plan: string;
  } | null;
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
    memberCount: number;
    nudgesSent: number;
    nudgesCompleted: number;
    responseRate: number;
    lastUpdatedAt?: string;
  }>;
};

export default function OverviewPage() {
  const { tenantId, tenantName, authHeaders } = useAuth();
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showCoverage, setShowCoverage] = useState(false);

  const fetchOverview = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/overview", { headers: authHeaders() });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to fetch overview:", err);
    } finally {
      setLoading(false);
    }
  }, [tenantId, authHeaders]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const tenant = data?.tenant;
  const totals = data?.totals;
  const cohorts = data?.cohorts || [];
  const activeCohorts = cohorts.filter((c) => c.status === "active");
  const topCohorts = cohorts.filter((c) => c.nudgesSent > 0).slice(0, 5);
  const attentionCohorts = cohorts
    .map((c) => ({
      c,
      flag: attentionFor({
        status: c.status,
        outcomes: {
          followThroughRate: c.responseRate,
          nudgesSent: c.nudgesSent,
          nudgesCompleted: c.nudgesCompleted,
        },
      }),
    }))
    .filter((x) => x.flag.needsAttention);
  const activeDistricts = Array.from(new Set(activeCohorts.map((c) => c.district)));
  const listCohorts = (topCohorts.length > 0 ? topCohorts : activeCohorts).slice(0, 6);

  // Just-signed-up partner: empty workspace → onboarding welcome + plan selector
  // instead of a dashboard full of zeros.
  if (!loading && cohorts.length === 0) {
    return (
      <div className="py-6 px-4 sm:py-10 sm:px-8">
        <header className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-page-title">Overview</h1>
              <p className="mt-1" style={{ color: "var(--color-text-secondary)" }}>
                Your workspace is ready — set up your first cohort to begin.
              </p>
            </div>
            <div className="flex flex-col items-end gap-3 shrink-0">
              <DashboardTour cohortCount={0} loading={loading} />
              <div
                className="text-right px-4 py-3 rounded-lg"
                style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
              >
                <p className="text-label">Viewing as</p>
                <p className="font-semibold" style={{ color: "var(--color-text-primary)" }}>
                  {tenant?.name || tenantName}
                </p>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  No plan yet
                </p>
              </div>
            </div>
          </div>
        </header>
        <OnboardingWelcome orgName={tenant?.name || tenantName} />
      </div>
    );
  }

  return (
    <div className="py-6 px-4 sm:py-10 sm:px-8">
      <AdvisoryLoopHero onHowItWorks={() => setShowHowItWorks(true)} />

      {/* Header with Tenant Identity */}
      <header className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-page-title">Overview</h1>
            <p className="mt-1" style={{ color: "var(--color-text-secondary)" }}>
              <Term term="aggregate">Aggregate</Term> performance across all{" "}
              <Term term="cohort">cohorts</Term>
            </p>
          </div>
          <div className="flex flex-col items-end gap-3 shrink-0">
            <DashboardTour cohortCount={cohorts.length} loading={loading} />
            {tenant && (
              <div
                className="text-right px-4 py-3 rounded-lg"
                style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
              >
                <p className="text-label">Viewing as</p>
                <p className="font-semibold" style={{ color: "var(--color-text-primary)" }}>
                  {tenant.name || tenantName}
                </p>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  {tenant.plan} plan
                </p>
              </div>
            )}
          </div>
        </div>
      </header>

      {showHowItWorks && (
        <div className="modal-overlay" onClick={() => setShowHowItWorks(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <h2 className="text-section">How Outturn works</h2>
              <button
                onClick={() => setShowHowItWorks(false)}
                aria-label="Close"
                className="text-2xl leading-none"
                style={{ color: "var(--color-text-muted)" }}
              >
                ×
              </button>
            </div>
            <div className="px-6 pb-6">
              <HowItWorks allowTech={false} />
            </div>
          </div>
        </div>
      )}

      {showCoverage && (
        <div className="modal-overlay" onClick={() => setShowCoverage(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 900 }}>
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <div>
                <h2 className="text-section">Where you work</h2>
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                  {activeDistricts.length} district{activeDistricts.length === 1 ? "" : "s"} ·{" "}
                  {activeCohorts.length} active cohort{activeCohorts.length === 1 ? "" : "s"} ·{" "}
                  {(totals?.farmers || 0).toLocaleString()} farmers
                </p>
              </div>
              <button
                onClick={() => setShowCoverage(false)}
                aria-label="Close"
                className="text-2xl leading-none"
                style={{ color: "var(--color-text-muted)" }}
              >
                ×
              </button>
            </div>
            <div className="px-6 pb-6 grid md:grid-cols-2 gap-6 items-start">
              <MaharashtraMap highlight={activeDistricts} showLabels maxWidth={560} labelPx={14} />
              <div className="space-y-2">
                {activeCohorts.map((c) => (
                  <Link
                    key={c.cohortId}
                    href={`/dashboard/cohorts/${c.cohortId}`}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-lg transition-colors hover:bg-opacity-50"
                    style={{ border: "1px solid var(--color-border)" }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <DistrictThumb district={c.district} size={34} />
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{c.district}</p>
                        <p className="text-xs truncate" style={{ color: "var(--color-text-muted)" }}>
                          {c.crops.join(", ")} · {c.memberCount} farmer{c.memberCount === 1 ? "" : "s"}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold shrink-0" style={{ color: "var(--color-primary)" }}>
                      {Math.round(c.responseRate * 100)}%
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Primary KPI Cards */}
      <section data-tour="kpi" className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <KPICard
          label="Farmers enrolled"
          term="farmers enrolled"
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
          label="Reminders sent"
          term="reminders sent"
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
          label="Acted"
          term="responses"
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
          label="Follow-through"
          term="follow-through"
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-card-title">Follow-through breakdown</h2>
              <LineageBadge />
            </div>
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
                  Overall follow-through
                </p>
              </div>
            </div>
          </Card>
        </section>
      )}

      {/* Needs attention — a loud, act-now call to action */}
      {attentionCohorts.length > 0 && (
        <section data-tour="attention" className="mb-8">
          <div
            className="rounded-xl p-6"
            style={{
              background: "var(--color-warning-bg)",
              border: "1px solid var(--color-warning)",
              borderLeft: "5px solid var(--color-warning)",
            }}
          >
            <div className="flex items-center gap-3 mb-1">
              <span
                className="inline-flex items-center justify-center w-7 h-7 rounded-full shrink-0"
                style={{ background: "var(--color-warning)", color: "#fff" }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4a2 2 0 00-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
                </svg>
              </span>
              <h2 className="text-card-title" style={{ color: "var(--color-warning)" }}>
                Needs attention
              </h2>
              <span
                className="ml-auto text-sm font-semibold px-2.5 py-1 rounded-full"
                style={{ background: "var(--color-warning)", color: "#fff" }}
              >
                {attentionCohorts.length} cohort{attentionCohorts.length === 1 ? "" : "s"}
              </span>
            </div>
            <p className="text-sm mb-4" style={{ color: "var(--color-text-secondary)" }}>
              These cohorts are slipping. Open one to re-send a reminder to the farmers who
              haven&apos;t acted yet.
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {attentionCohorts.map(({ c, flag }) => (
                <Link
                  key={c.cohortId}
                  href={`/dashboard/cohorts/${c.cohortId}`}
                  className="flex items-center justify-between gap-4 p-3 rounded-lg transition-shadow hover:shadow-md"
                  style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
                >
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{c.district}</p>
                    <p className="text-xs truncate" style={{ color: "var(--color-warning)" }}>
                      {flag.label}
                    </p>
                  </div>
                  <span className="text-sm font-semibold shrink-0" style={{ color: "var(--color-primary)" }}>
                    Re-nudge →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Coverage + cohorts — one consolidated view */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coverage map */}
        <div className="lg:col-span-1">
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-card-title">Where you work</h2>
              {activeDistricts.length > 0 && (
                <button
                  onClick={() => setShowCoverage(true)}
                  className="text-xs font-medium inline-flex items-center gap-1"
                  style={{ color: "var(--color-primary)" }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  Enlarge
                </button>
              )}
            </div>
            {loading ? (
              <div className="h-56 rounded-xl animate-pulse" style={{ background: "var(--color-page-bg)" }} />
            ) : (
              <button
                type="button"
                onClick={() => activeDistricts.length > 0 && setShowCoverage(true)}
                className="block w-full"
                style={{ cursor: activeDistricts.length > 0 ? "zoom-in" : "default" }}
                aria-label="Enlarge coverage map"
              >
                <MaharashtraMap highlight={activeDistricts} showLabels={false} />
              </button>
            )}
            {activeDistricts.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {activeDistricts.map((d) => (
                  <button
                    key={d}
                    onClick={() => setShowCoverage(true)}
                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{ background: "var(--color-primary-tint)", color: "var(--color-primary)" }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            )}
            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
              <CoverageStat value={activeDistricts.length} label="Districts" loading={loading} />
              <CoverageStat value={activeCohorts.length} label="Active cohorts" loading={loading} />
              <CoverageStat value={totals?.farmers || 0} label="Farmers" loading={loading} />
            </div>
          </Card>
        </div>

        {/* Cohorts — ranked, the single source for "which cohorts" */}
        <div data-tour="cohorts" className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-card-title">Your cohorts</h2>
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
            ) : listCohorts.length > 0 ? (
              <div className="space-y-3">
                {listCohorts.map((cohort, idx) => (
                  <CohortRow key={cohort.cohortId} cohort={cohort} rank={idx + 1} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No active cohorts yet"
                description="Activate a cohort to start monitoring farmer follow-through."
                action={
                  <Link href="/dashboard/cohorts">
                    <button className="btn btn-primary">Manage cohorts</button>
                  </Link>
                }
              />
            )}
          </Card>
        </div>
      </section>
    </div>
  );
}

// =============================================================================
// Coverage Stat (small figure under the map)
// =============================================================================

function CoverageStat({ value, label, loading }: { value: number; label: string; loading?: boolean }) {
  return (
    <div className="rounded-lg py-2.5" style={{ background: "var(--color-page-bg)" }}>
      {loading ? (
        <div className="h-6 w-8 mx-auto rounded animate-pulse" style={{ background: "var(--color-border)" }} />
      ) : (
        <p className="text-kpi-sm" style={{ fontSize: 22, lineHeight: 1.1 }}>
          {value.toLocaleString()}
        </p>
      )}
      <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
        {label}
      </p>
    </div>
  );
}

// =============================================================================
// KPI Card Component
// =============================================================================

function KPICard({
  label,
  term,
  value,
  format,
  highlight,
  loading,
  icon,
}: {
  label: string;
  term?: string;
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
    <Card className={highlight ? "card-kpi" : ""}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-label mb-2">{term ? <Term term={term}>{label}</Term> : label}</p>
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
    memberCount: number;
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
      {/* District thumbnail + rank badge */}
      <div className="relative flex-shrink-0">
        <DistrictThumb district={cohort.district} size={44} />
        <span
          className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
          style={{
            background: rank <= 3 ? "var(--color-primary)" : "var(--color-text-muted)",
            color: "#fff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
          }}
        >
          {rank}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{cohort.district}</p>
        <p className="text-sm truncate" style={{ color: "var(--color-text-muted)" }}>
          {cohort.crops.join(", ")} · {cohort.memberCount} farmer{cohort.memberCount === 1 ? "" : "s"}
        </p>
      </div>

      {/* Stats */}
      <div className="text-right flex-shrink-0">
        <p className="font-medium" style={{ color: "var(--color-primary)" }}>
          {Math.round(cohort.responseRate * 100)}%
        </p>
        <MiniSparkline rate={cohort.responseRate} />
        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          {cohort.nudgesCompleted}/{cohort.nudgesSent} responded
        </p>
      </div>
    </Link>
  );
}

// =============================================================================
// Mini Sparkline
// =============================================================================

function MiniSparkline({ rate }: { rate: number }) {
  const w = 48;
  const h = 16;
  const filled = Math.round(rate * 4);
  return (
    <svg width={w} height={h} className="mx-auto my-1" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={i * 12 + 2}
          y={h - 4 - (i < filled ? 8 : 4)}
          width={8}
          height={i < filled ? 12 : 6}
          rx={2}
          fill={i < filled ? "var(--color-chart-1)" : "var(--color-border)"}
        />
      ))}
    </svg>
  );
}

