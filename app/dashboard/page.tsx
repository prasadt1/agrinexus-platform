"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const TENANT_ID = "demo-tenant-001";

type Cohort = {
  cohortId: string;
  district: string;
  status: "draft" | "active" | "paused" | "expired";
  crops: string[];
  languages: string[];
  createdAt: string;
  activatedAt?: string;
  outcomes?: {
    period: string;
    followThroughRate: number;
    nudgesSent: number;
    nudgesCompleted: number;
  } | null;
};

type TriggerResult = {
  message: string;
  cohorts_checked: number;
  nudges_triggered: number;
  results: Array<{
    cohortId: string;
    district: string;
    weather: {
      favorable: boolean;
      wind_speed: number;
      rain: number;
      mock: boolean;
    };
    triggered: boolean;
    executionArn?: string;
  }>;
};

export default function DashboardPage() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggerLoading, setTriggerLoading] = useState(false);
  const [triggerResult, setTriggerResult] = useState<TriggerResult | null>(null);

  useEffect(() => {
    fetchCohorts();
  }, []);

  async function fetchCohorts() {
    try {
      const res = await fetch("/api/cohorts", {
        headers: { "X-Tenant-ID": TENANT_ID },
      });
      const data = await res.json();
      setCohorts(data.cohorts || []);
    } catch (err) {
      console.error("Failed to fetch cohorts:", err);
    } finally {
      setLoading(false);
    }
  }

  async function triggerPoller() {
    setTriggerLoading(true);
    setTriggerResult(null);
    try {
      const res = await fetch("/api/demo/trigger-poller", {
        method: "POST",
        headers: { "X-Tenant-ID": TENANT_ID },
      });
      const data = await res.json();
      setTriggerResult(data);
    } catch (err) {
      console.error("Failed to trigger poller:", err);
    } finally {
      setTriggerLoading(false);
    }
  }

  const activeCohorts = cohorts.filter((c) => c.status === "active");
  const draftCohorts = cohorts.filter((c) => c.status === "draft");

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-page-title">Overview</h1>
        <p className="mt-1" style={{ color: "var(--color-text-secondary)" }}>
          Monitor cohort performance and send advisories
        </p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          label="Total Cohorts"
          value={cohorts.length}
          loading={loading}
        />
        <StatCard
          label="Active Cohorts"
          value={activeCohorts.length}
          highlight
          loading={loading}
        />
        <StatCard
          label="Draft Cohorts"
          value={draftCohorts.length}
          loading={loading}
        />
      </div>

      {/* Trigger Poller Section */}
      <section className="card mb-8">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <h2 className="text-card-title mb-2">Weather Check</h2>
            <p style={{ color: "var(--color-text-secondary)" }}>
              Run a weather check for all active cohorts. If conditions are favorable
              (wind &lt; 10 km/h, no rain), advisories will be sent to farmers.
            </p>
          </div>
          <button
            onClick={triggerPoller}
            disabled={triggerLoading || activeCohorts.length === 0}
            className="btn btn-primary"
          >
            {triggerLoading ? (
              <>
                <Spinner />
                Checking...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Run Weather Check
              </>
            )}
          </button>
        </div>

        {activeCohorts.length === 0 && !loading && (
          <div
            className="mt-6 p-4 rounded-lg"
            style={{ background: "var(--color-page-bg)" }}
          >
            <p style={{ color: "var(--color-text-secondary)" }}>
              No active cohorts.{" "}
              <Link
                href="/dashboard/cohorts"
                className="font-medium"
                style={{ color: "var(--color-primary)" }}
              >
                Create and activate a cohort
              </Link>{" "}
              to start sending advisories.
            </p>
          </div>
        )}

        {triggerResult && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span style={{ color: "var(--color-text-secondary)" }}>Cohorts checked: </span>
                <span className="font-medium">{triggerResult.cohorts_checked}</span>
              </div>
              <div>
                <span style={{ color: "var(--color-text-secondary)" }}>Advisories triggered: </span>
                <span
                  className="font-medium"
                  style={{ color: triggerResult.nudges_triggered > 0 ? "var(--color-status-active)" : "var(--color-text-muted)" }}
                >
                  {triggerResult.nudges_triggered}
                </span>
              </div>
            </div>

            {triggerResult.results.map((r) => (
              <div
                key={r.cohortId}
                className="p-4 rounded-lg border"
                style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">{r.district}</span>
                  {r.triggered ? (
                    <span className="badge badge-active flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Sent
                    </span>
                  ) : (
                    <span className="badge badge-draft">Not sent</span>
                  )}
                </div>
                <div className="flex gap-6 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  <span>
                    Wind: <span style={{ color: "var(--color-text-primary)" }}>{r.weather.wind_speed.toFixed(1)} km/h</span>
                  </span>
                  <span>
                    Rain: <span style={{ color: "var(--color-text-primary)" }}>{r.weather.rain} mm</span>
                  </span>
                  <span style={{ color: r.weather.favorable ? "var(--color-status-active)" : "var(--color-status-attention)" }}>
                    {r.weather.favorable ? "Favorable" : "Unfavorable"}
                  </span>
                  {r.weather.mock && (
                    <span style={{ color: "var(--color-text-muted)" }}>(simulated)</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Active Cohorts Quick View */}
      <section className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-card-title">Active Cohorts</h2>
          <Link
            href="/dashboard/cohorts"
            className="text-sm font-medium"
            style={{ color: "var(--color-text-secondary)" }}
          >
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="empty-state">
            <p style={{ color: "var(--color-text-muted)" }}>Loading...</p>
          </div>
        ) : activeCohorts.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-title">No active cohorts</p>
            <p className="empty-state-description">
              Activate a cohort to start monitoring farmer engagement and sending advisories.
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--color-border)" }}>
            {activeCohorts.slice(0, 5).map((cohort) => (
              <Link
                key={cohort.cohortId}
                href={`/dashboard/cohorts/${cohort.cohortId}`}
                className="flex items-center justify-between py-4 -mx-6 px-6 transition-colors table-row"
              >
                <div>
                  <p className="font-medium">{cohort.district}</p>
                  <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                    {cohort.crops.join(", ")}
                  </p>
                </div>
                <div className="text-right">
                  <span className="badge badge-active">Active</span>
                  {cohort.activatedAt && (
                    <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                      Since {new Date(cohort.activatedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
  loading,
}: {
  label: string;
  value: number;
  highlight?: boolean;
  loading?: boolean;
}) {
  return (
    <div className="card">
      <p className="text-label mb-2">{label}</p>
      {loading ? (
        <div
          className="h-9 w-16 rounded animate-pulse"
          style={{ background: "var(--color-page-bg)" }}
        />
      ) : (
        <p
          className="text-kpi"
          style={{ color: highlight ? "var(--color-primary)" : "var(--color-text-primary)" }}
        >
          {value}
        </p>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
