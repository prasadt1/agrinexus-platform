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
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-zinc-400 mt-1">
          Monitor your cohorts and trigger advisory nudges
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
      <section className="bg-zinc-900 rounded-xl p-6 mb-8 border border-zinc-800">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white mb-2">
              Weather Poller
            </h2>
            <p className="text-zinc-400 text-sm max-w-xl">
              Manually trigger the weather check for all active cohorts. If
              conditions are favorable (wind &lt; 10 km/h, no rain), nudges will
              be sent to farmers in those districts.
            </p>
          </div>
          <button
            onClick={triggerPoller}
            disabled={triggerLoading || activeCohorts.length === 0}
            className="bg-green-600 hover:bg-green-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-medium px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
          >
            {triggerLoading ? (
              <>
                <Spinner />
                Checking...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Trigger Poller
              </>
            )}
          </button>
        </div>

        {activeCohorts.length === 0 && !loading && (
          <div className="mt-4 p-4 bg-zinc-800 rounded-lg">
            <p className="text-zinc-400 text-sm">
              No active cohorts.{" "}
              <Link href="/dashboard/cohorts" className="text-green-400 hover:underline">
                Create and activate a cohort
              </Link>{" "}
              to trigger nudges.
            </p>
          </div>
        )}

        {triggerResult && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-zinc-400">Cohorts checked:</span>
              <span className="text-white font-medium">
                {triggerResult.cohorts_checked}
              </span>
              <span className="text-zinc-400 ml-4">Nudges triggered:</span>
              <span className={`font-medium ${triggerResult.nudges_triggered > 0 ? "text-green-400" : "text-zinc-500"}`}>
                {triggerResult.nudges_triggered}
              </span>
            </div>

            {triggerResult.results.map((r) => (
              <div
                key={r.cohortId}
                className="p-4 bg-zinc-800 rounded-lg border border-zinc-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{r.district}</span>
                  {r.triggered ? (
                    <span className="text-green-400 text-sm flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Nudge triggered
                    </span>
                  ) : (
                    <span className="text-zinc-500 text-sm">Not triggered</span>
                  )}
                </div>
                <div className="flex gap-6 text-sm">
                  <span className="text-zinc-400">
                    Wind: <span className="text-zinc-300">{r.weather.wind_speed.toFixed(1)} km/h</span>
                  </span>
                  <span className="text-zinc-400">
                    Rain: <span className="text-zinc-300">{r.weather.rain} mm</span>
                  </span>
                  <span className={r.weather.favorable ? "text-green-400" : "text-amber-400"}>
                    {r.weather.favorable ? "Favorable" : "Unfavorable"}
                  </span>
                  {r.weather.mock && (
                    <span className="text-zinc-600">(mock data)</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Active Cohorts Quick View */}
      <section className="bg-zinc-900 rounded-xl border border-zinc-800">
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Active Cohorts</h2>
          <Link
            href="/dashboard/cohorts"
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            View all →
          </Link>
        </div>
        <div className="divide-y divide-zinc-800">
          {loading ? (
            <div className="p-6 text-center text-zinc-500">Loading...</div>
          ) : activeCohorts.length === 0 ? (
            <div className="p-6 text-center text-zinc-500">
              No active cohorts yet
            </div>
          ) : (
            activeCohorts.slice(0, 5).map((cohort) => (
              <div
                key={cohort.cohortId}
                className="p-4 flex items-center justify-between hover:bg-zinc-800/50"
              >
                <div>
                  <p className="text-white font-medium">{cohort.district}</p>
                  <p className="text-zinc-500 text-sm">
                    {cohort.crops.join(", ")}
                  </p>
                </div>
                <div className="text-right">
                  <StatusBadge status={cohort.status} />
                  {cohort.activatedAt && (
                    <p className="text-zinc-600 text-xs mt-1">
                      Since {new Date(cohort.activatedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
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
    <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
      <p className="text-zinc-400 text-sm mb-2">{label}</p>
      {loading ? (
        <div className="h-9 w-16 bg-zinc-800 rounded animate-pulse" />
      ) : (
        <p className={`text-3xl font-bold ${highlight ? "text-green-400" : "text-white"}`}>
          {value}
        </p>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-green-500/20 text-green-400",
    draft: "bg-zinc-700 text-zinc-400",
    paused: "bg-amber-500/20 text-amber-400",
    expired: "bg-red-500/20 text-red-400",
  };
  return (
    <span className={`text-xs px-2 py-1 rounded-full ${styles[status] || styles.draft}`}>
      {status}
    </span>
  );
}

function Spinner() {
  return (
    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
