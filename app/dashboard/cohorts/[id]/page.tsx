"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Card, Badge, Button, EmptyState } from "@/app/components";

const TENANT_ID = "demo-tenant-001";

type Cohort = {
  cohortId: string;
  district: string;
  status: "draft" | "active" | "paused" | "expired";
  crops: string[];
  languages: string[];
  lat: number;
  lon: number;
  createdAt: string;
  activatedAt?: string;
};

type License = {
  plan: string;
  status: string;
  currentPeriodEnd: string;
  isDemo: boolean;
} | null;

type Summary = {
  period: string;
  adviceSent: number;
  nudgesSent: number;
  nudgesCompleted: number;
  nudgesExpired: number;
  followThroughRate: number;
};

export default function CohortDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [license, setLicense] = useState<License>(null);
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCohort();
  }, [id]);

  async function fetchCohort() {
    try {
      const res = await fetch(`/api/cohorts/${id}`, {
        headers: { "X-Tenant-ID": TENANT_ID },
      });
      if (res.ok) {
        const data = await res.json();
        setCohort(data.cohort);
        setLicense(data.license);
        setSummaries(data.summaries || []);
      } else {
        setError("Cohort not found");
      }
    } catch (err) {
      console.error("Failed to fetch cohort:", err);
      setError("Failed to load cohort");
    } finally {
      setLoading(false);
    }
  }

  // Aggregate stats from summaries
  const totalNudgesSent = summaries.reduce((sum, s) => sum + (s.nudgesSent || 0), 0);
  const totalNudgesCompleted = summaries.reduce((sum, s) => sum + (s.nudgesCompleted || 0), 0);
  const totalNudgesExpired = summaries.reduce((sum, s) => sum + (s.nudgesExpired || 0), 0);
  const totalPending = totalNudgesSent - totalNudgesCompleted - totalNudgesExpired;
  const overallResponseRate = totalNudgesSent > 0 ? totalNudgesCompleted / totalNudgesSent : 0;

  // For demo: estimate farmers reached (in production this would come from API)
  const farmersReached = summaries.length > 0 ? Math.ceil(totalNudgesSent / 3) : 0;

  if (loading) {
    return (
      <div className="py-10 px-8">
        <div className="animate-pulse">
          <div className="h-8 w-48 rounded" style={{ background: "var(--color-border)" }} />
          <div className="h-4 w-64 mt-3 rounded" style={{ background: "var(--color-border)" }} />
          <div className="grid grid-cols-3 gap-6 mt-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-lg" style={{ background: "var(--color-border)" }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !cohort) {
    return (
      <div className="py-10 px-8">
        <Card>
          <EmptyState
            title={error || "Cohort not found"}
            description="The cohort you're looking for doesn't exist or you don't have access to it."
            action={
              <Link href="/dashboard/cohorts">
                <Button variant="secondary">Back to Cohorts</Button>
              </Link>
            }
          />
        </Card>
      </div>
    );
  }

  const hasOutcomes = summaries.length > 0 && totalNudgesSent > 0;

  return (
    <div className="py-10 px-8">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <ol className="flex items-center gap-2 text-sm">
          <li>
            <Link
              href="/dashboard/cohorts"
              className="hover:underline"
              style={{ color: "var(--color-text-muted)" }}
            >
              Cohorts
            </Link>
          </li>
          <li style={{ color: "var(--color-text-muted)" }}>/</li>
          <li style={{ color: "var(--color-text-secondary)" }}>{cohort.district}</li>
        </ol>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-page-title">{cohort.district}</h1>
              <Badge status={cohort.status} />
            </div>
            <p style={{ color: "var(--color-text-secondary)" }}>
              {(cohort.crops || []).join(", ")} • {(cohort.languages || []).map((l) => l.toUpperCase()).join(", ")}
            </p>
          </div>
          <div className="text-right">
            <p className="text-label">Partner</p>
            <p className="font-medium" style={{ color: "var(--color-text-primary)" }}>
              {TENANT_ID.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\d+/g, "").trim()}
            </p>
            {license && (
              <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                {license.plan} plan {license.isDemo && "(demo)"}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* KPI Cards - Always show, with zeros when no data */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <KPICard
          label="Farmers Reached"
          value={farmersReached}
          format="number"
          empty={!hasOutcomes}
        />
        <KPICard
          label="Advisories Sent"
          value={totalNudgesSent}
          format="number"
          empty={!hasOutcomes}
        />
        <KPICard
          label="Response Rate"
          value={overallResponseRate}
          format="percent"
          highlight
          empty={!hasOutcomes}
        />
      </section>

      {/* Response Breakdown Chart */}
      <section className="mb-8">
        <Card>
          <h2 className="text-card-title mb-6">Response Breakdown</h2>
          {hasOutcomes ? (
            <div className="flex items-center gap-8">
              <div className="flex-1">
                {/* Three-bucket stacked bar: Done | Pending | Expired */}
                <div className="mb-4">
                  <div
                    className="h-10 rounded-lg overflow-hidden flex"
                    style={{ background: "var(--color-page-bg)" }}
                  >
                    {/* Done (green) */}
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${(totalNudgesCompleted / totalNudgesSent) * 100}%`,
                        background: "var(--color-chart-1)",
                      }}
                    />
                    {/* Pending (teal) */}
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${(Math.max(0, totalPending) / totalNudgesSent) * 100}%`,
                        background: "var(--color-chart-2)",
                      }}
                    />
                    {/* Expired (amber) */}
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${(totalNudgesExpired / totalNudgesSent) * 100}%`,
                        background: "var(--color-chart-3)",
                      }}
                    />
                  </div>
                </div>
                {/* Legend */}
                <div className="flex gap-6 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ background: "var(--color-chart-1)" }}
                    />
                    <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                      Done ({totalNudgesCompleted})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ background: "var(--color-chart-2)" }}
                    />
                    <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                      Pending ({Math.max(0, totalPending)})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ background: "var(--color-chart-3)" }}
                    />
                    <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                      Expired ({totalNudgesExpired})
                    </span>
                  </div>
                </div>
              </div>
              {/* Big number */}
              <div
                className="text-center px-8 border-l"
                style={{ borderColor: "var(--color-border)" }}
              >
                <p className="text-kpi" style={{ color: "var(--color-primary)" }}>
                  {Math.round(overallResponseRate * 100)}%
                </p>
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                  Response Rate
                </p>
              </div>
            </div>
          ) : (
            <EmptyState
              title="No outcomes yet"
              description={
                cohort.status === "draft"
                  ? "Activate this cohort to start sending advisories."
                  : "Advisories will appear here once farmers start receiving them."
              }
            />
          )}
        </Card>
      </section>

      {/* Response Over Time Chart */}
      {hasOutcomes && summaries.length > 1 && (
        <section className="mb-8">
          <Card>
            <h2 className="text-card-title mb-6">Response Rate Over Time</h2>
            <ResponseTrendChart summaries={summaries} />
          </Card>
        </section>
      )}

      {/* Audit List Section */}
      <section className="mb-8">
        <Card>
          <h2 className="text-card-title mb-6">Advisory History</h2>
          {hasOutcomes && summaries.length > 0 ? (
            <div className="space-y-3">
              {summaries.map((summary, idx) => (
                <AuditRow key={summary.period || idx} summary={summary} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No advisories sent"
              description={
                cohort.status === "draft"
                  ? "Activate this cohort to begin sending weather-based advisories to farmers."
                  : "Advisory records will appear here as they are sent."
              }
            />
          )}
        </Card>
      </section>

      {/* Cohort Details */}
      <section>
        <Card>
          <h2 className="text-card-title mb-6">Cohort Configuration</h2>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <dt className="text-label">Cohort ID</dt>
              <dd className="mt-1 font-mono text-sm" style={{ color: "var(--color-text-secondary)" }}>
                {cohort.cohortId.slice(0, 8)}…
              </dd>
            </div>
            <div>
              <dt className="text-label">Location</dt>
              <dd className="mt-1 text-sm">
                {cohort.lat?.toFixed(2)}°N, {cohort.lon?.toFixed(2)}°E
              </dd>
            </div>
            <div>
              <dt className="text-label">Created</dt>
              <dd className="mt-1 text-sm">
                {new Date(cohort.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </dd>
            </div>
            <div>
              <dt className="text-label">Activated</dt>
              <dd className="mt-1 text-sm">
                {cohort.activatedAt
                  ? new Date(cohort.activatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—"}
              </dd>
            </div>
          </dl>
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
  empty,
}: {
  label: string;
  value: number;
  format: "number" | "percent";
  highlight?: boolean;
  empty?: boolean;
}) {
  const displayValue = empty
    ? "—"
    : format === "percent"
    ? `${Math.round(value * 100)}%`
    : value.toLocaleString();

  return (
    <Card>
      <p className="text-label mb-2">{label}</p>
      <p
        className="text-kpi"
        style={{
          color: empty
            ? "var(--color-text-muted)"
            : highlight
            ? "var(--color-primary)"
            : "var(--color-text-primary)",
        }}
      >
        {displayValue}
      </p>
    </Card>
  );
}

// =============================================================================
// Response Trend Chart (Simple SVG bar chart)
// =============================================================================

function ResponseTrendChart({ summaries }: { summaries: Summary[] }) {
  // Sort by period ascending
  const sorted = [...summaries].sort((a, b) => a.period.localeCompare(b.period));
  const maxRate = Math.max(...sorted.map((s) => s.followThroughRate || 0), 0.01);

  const chartHeight = 120;
  const barWidth = 40;
  const gap = 16;
  const chartWidth = sorted.length * (barWidth + gap);

  return (
    <div className="overflow-x-auto">
      <svg
        width={Math.max(chartWidth, 200)}
        height={chartHeight + 40}
        className="mx-auto"
      >
        {sorted.map((summary, idx) => {
          const rate = summary.followThroughRate || 0;
          const barHeight = (rate / maxRate) * chartHeight;
          const x = idx * (barWidth + gap) + gap / 2;
          const y = chartHeight - barHeight;

          // Parse period for label
          const [year, month] = summary.period.split("-");
          const monthLabel = new Date(+year, +month - 1).toLocaleDateString("en-US", {
            month: "short",
          });

          return (
            <g key={summary.period}>
              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={4}
                fill="var(--color-chart-1)"
              />
              {/* Rate label above bar */}
              <text
                x={x + barWidth / 2}
                y={y - 6}
                textAnchor="middle"
                fontSize={12}
                fontWeight={500}
                fill="var(--color-text-primary)"
              >
                {Math.round(rate * 100)}%
              </text>
              {/* Month label below */}
              <text
                x={x + barWidth / 2}
                y={chartHeight + 20}
                textAnchor="middle"
                fontSize={11}
                fill="var(--color-text-muted)"
              >
                {monthLabel}
              </text>
            </g>
          );
        })}
        {/* Baseline */}
        <line
          x1={0}
          y1={chartHeight}
          x2={chartWidth}
          y2={chartHeight}
          stroke="var(--color-border)"
          strokeWidth={1}
        />
      </svg>
    </div>
  );
}

// =============================================================================
// Audit Row Component
// =============================================================================

function AuditRow({ summary }: { summary: Summary }) {
  const responseRate = summary.nudgesSent > 0
    ? summary.nudgesCompleted / summary.nudgesSent
    : 0;
  const expired = summary.nudgesExpired || 0;
  const pending = Math.max(0, summary.nudgesSent - summary.nudgesCompleted - expired);

  // Parse period (e.g., "2026-06" → "June 2026")
  const periodLabel = summary.period
    ? new Date(summary.period + "-01").toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Unknown period";

  return (
    <div
      className="flex items-center justify-between p-4 rounded-lg"
      style={{ background: "var(--color-page-bg)" }}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: "var(--color-primary-tint)",
            color: "var(--color-primary)",
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div>
          <p className="font-medium">{periodLabel}</p>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            {summary.nudgesSent} sent · {summary.nudgesCompleted} done · {pending} pending · {expired} expired
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium" style={{ color: "var(--color-primary)" }}>
          {Math.round(responseRate * 100)}%
        </p>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          response rate
        </p>
      </div>
    </div>
  );
}
