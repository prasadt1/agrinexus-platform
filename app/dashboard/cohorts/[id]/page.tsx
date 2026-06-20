"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";

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

type NudgeRecord = {
  id: string;
  activity: string;
  status: string;
  message: string;
  createdAt: string;
  completedAt?: string;
};

export default function CohortDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Mock data for demo - in production, this would come from API
  const [stats] = useState({
    farmersReached: 47,
    nudgesSent: 128,
    responseRate: 0.72,
    doneCount: 92,
    notYetCount: 36,
  });

  const [recentNudges] = useState<NudgeRecord[]>([
    {
      id: "1",
      activity: "spray",
      status: "COMPLETED",
      message: "Weather favorable for spraying. Wind 8.5 km/h.",
      createdAt: "2026-06-20T16:34:25Z",
      completedAt: "2026-06-20T17:15:00Z",
    },
    {
      id: "2",
      activity: "spray",
      status: "SENT",
      message: "Weather favorable for spraying. Wind 6.2 km/h.",
      createdAt: "2026-06-19T09:15:00Z",
    },
    {
      id: "3",
      activity: "spray",
      status: "COMPLETED",
      message: "Weather favorable for spraying. Wind 7.8 km/h.",
      createdAt: "2026-06-18T08:30:00Z",
      completedAt: "2026-06-18T10:45:00Z",
    },
  ]);

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

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 w-48 rounded" style={{ background: "var(--color-border)" }} />
          <div className="h-4 w-32 mt-2 rounded" style={{ background: "var(--color-border)" }} />
        </div>
      </div>
    );
  }

  if (error || !cohort) {
    return (
      <div className="p-8">
        <div className="card">
          <div className="empty-state">
            <p className="empty-state-title">{error || "Cohort not found"}</p>
            <Link href="/dashboard/cohorts" className="btn btn-secondary mt-4">
              Back to Cohorts
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <ol className="flex items-center gap-2 text-sm">
          <li>
            <Link href="/dashboard/cohorts" style={{ color: "var(--color-text-muted)" }} className="hover:underline">
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
              <span className={`badge badge-${cohort.status}`}>{cohort.status}</span>
            </div>
            <p style={{ color: "var(--color-text-secondary)" }}>
              {(cohort.crops || []).join(", ")} • {(cohort.languages || []).map(l => l.toUpperCase()).join(", ")}
            </p>
          </div>
          <div className="text-right">
            <p className="text-label">Tenant</p>
            <p className="font-medium">{TENANT_ID}</p>
          </div>
        </div>
      </header>

      {/* KPI Cards */}
      {cohort.status === "active" ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <KPICard
              label="Farmers Reached"
              value={stats.farmersReached}
              format="number"
            />
            <KPICard
              label="Advisories Sent"
              value={stats.nudgesSent}
              format="number"
            />
            <KPICard
              label="Response Rate"
              value={stats.responseRate}
              format="percent"
              highlight
            />
          </div>

          {/* Response Chart */}
          <section className="card mb-8">
            <h2 className="text-card-title mb-6">Response Breakdown</h2>
            <div className="flex items-center gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex-1 h-8 rounded-lg overflow-hidden flex" style={{ background: "var(--color-page-bg)" }}>
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${(stats.doneCount / (stats.doneCount + stats.notYetCount)) * 100}%`,
                        background: "var(--color-chart-1)",
                      }}
                    />
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${(stats.notYetCount / (stats.doneCount + stats.notYetCount)) * 100}%`,
                        background: "var(--color-chart-3)",
                      }}
                    />
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ background: "var(--color-chart-1)" }} />
                    <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                      Done ({stats.doneCount})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ background: "var(--color-chart-3)" }} />
                    <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                      Not Yet ({stats.notYetCount})
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-center px-6 border-l" style={{ borderColor: "var(--color-border)" }}>
                <p className="text-kpi" style={{ color: "var(--color-primary)" }}>
                  {Math.round(stats.responseRate * 100)}%
                </p>
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Response Rate</p>
              </div>
            </div>
          </section>

          {/* Recent Activity */}
          <section className="card">
            <h2 className="text-card-title mb-6">Recent Advisories</h2>
            <div className="space-y-4">
              {recentNudges.map((nudge) => (
                <div
                  key={nudge.id}
                  className="flex items-start gap-4 p-4 rounded-lg"
                  style={{ background: "var(--color-page-bg)" }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: nudge.status === "COMPLETED" ? "var(--color-status-active-bg)" : "var(--color-status-draft-bg)",
                      color: nudge.status === "COMPLETED" ? "var(--color-status-active)" : "var(--color-status-draft)",
                    }}
                  >
                    {nudge.status === "COMPLETED" ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium capitalize">{nudge.activity} Advisory</span>
                      <span className={`badge badge-${nudge.status === "COMPLETED" ? "active" : "draft"}`}>
                        {nudge.status === "COMPLETED" ? "Acted on" : "Pending"}
                      </span>
                    </div>
                    <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                      {nudge.message}
                    </p>
                    <p className="text-xs mt-2" style={{ color: "var(--color-text-muted)" }}>
                      Sent {new Date(nudge.createdAt).toLocaleString()}
                      {nudge.completedAt && (
                        <> • Completed {new Date(nudge.completedAt).toLocaleString()}</>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <div className="card">
          <div className="empty-state">
            <p className="empty-state-title">No outcomes yet</p>
            <p className="empty-state-description">
              Activate this cohort to start sending advisories and tracking farmer engagement.
            </p>
          </div>
        </div>
      )}

      {/* Cohort Details */}
      <section className="card mt-8">
        <h2 className="text-card-title mb-4">Cohort Details</h2>
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <dt className="text-label">Cohort ID</dt>
            <dd className="mt-1 font-mono text-sm">{cohort.cohortId}</dd>
          </div>
          <div>
            <dt className="text-label">Coordinates</dt>
            <dd className="mt-1 text-sm">{cohort.lat.toFixed(4)}, {cohort.lon.toFixed(4)}</dd>
          </div>
          <div>
            <dt className="text-label">Created</dt>
            <dd className="mt-1 text-sm">{new Date(cohort.createdAt).toLocaleDateString()}</dd>
          </div>
          <div>
            <dt className="text-label">Activated</dt>
            <dd className="mt-1 text-sm">
              {cohort.activatedAt ? new Date(cohort.activatedAt).toLocaleDateString() : "—"}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

function KPICard({
  label,
  value,
  format,
  highlight,
}: {
  label: string;
  value: number;
  format: "number" | "percent";
  highlight?: boolean;
}) {
  const displayValue = format === "percent" ? `${Math.round(value * 100)}%` : value.toLocaleString();

  return (
    <div className="card">
      <p className="text-label mb-2">{label}</p>
      <p
        className="text-kpi"
        style={{ color: highlight ? "var(--color-primary)" : "var(--color-text-primary)" }}
      >
        {displayValue}
      </p>
    </div>
  );
}
