"use client";

import { useState } from "react";

type HealthCheckResult = {
  status: "healthy" | "degraded" | "error";
  message: string;
  timestamp: string;
  total_duration_ms: number;
  checks: {
    env_configured: boolean;
    table_name: string;
    write: { success: boolean; duration_ms?: number; error?: string };
    read: {
      success: boolean;
      duration_ms?: number;
      data_matches?: boolean;
      error?: string;
    };
    cleanup: { success: boolean; duration_ms?: number; error?: string };
  };
  error?: { name: string; message: string };
};

export default function Home() {
  const [result, setResult] = useState<HealthCheckResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runHealthcheck = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/healthcheck");
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({
        status: "error",
        message: err instanceof Error ? err.message : "Request failed",
        timestamp: new Date().toISOString(),
        total_duration_ms: 0,
        checks: {
          env_configured: false,
          table_name: "",
          write: { success: false },
          read: { success: false },
          cleanup: { success: false },
        },
      });
    }
    setLoading(false);
  };

  const statusColor = {
    healthy: "bg-green-500",
    degraded: "bg-yellow-500",
    error: "bg-red-500",
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <div className="max-w-2xl mx-auto">
        <header className="mb-12">
          <h1 className="text-3xl font-bold text-white mb-2">
            AgriNexus Platform
          </h1>
          <p className="text-zinc-400">
            Multi-tenant B2B control plane for agricultural advisory services
          </p>
        </header>

        <section className="bg-zinc-900 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">DynamoDB Integration</h2>
          <p className="text-zinc-400 mb-6">
            Test the connection to DynamoDB by running a write → read → delete
            cycle.
          </p>

          <button
            onClick={runHealthcheck}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            {loading ? "Running..." : "Run Healthcheck"}
          </button>
        </section>

        {result && (
          <section className="bg-zinc-900 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div
                className={`w-3 h-3 rounded-full ${statusColor[result.status]}`}
              />
              <h3 className="text-lg font-semibold capitalize">
                {result.status}
              </h3>
              <span className="text-zinc-500 text-sm ml-auto">
                {result.total_duration_ms}ms
              </span>
            </div>

            <p className="text-zinc-300 mb-6">{result.message}</p>

            <div className="space-y-3">
              <CheckRow
                label="Environment Configured"
                success={result.checks.env_configured}
              />
              {result.checks.table_name && (
                <div className="text-sm text-zinc-500 pl-6 -mt-2">
                  Table: {result.checks.table_name}
                </div>
              )}
              <CheckRow
                label="Write Test Item"
                success={result.checks.write.success}
                duration={result.checks.write.duration_ms}
              />
              <CheckRow
                label="Read Test Item"
                success={result.checks.read.success}
                duration={result.checks.read.duration_ms}
              />
              <CheckRow
                label="Cleanup (Delete)"
                success={result.checks.cleanup.success}
                duration={result.checks.cleanup.duration_ms}
              />
            </div>

            {result.error && (
              <div className="mt-6 p-4 bg-red-950 border border-red-900 rounded-lg">
                <p className="text-red-400 font-mono text-sm">
                  {result.error.name}: {result.error.message}
                </p>
              </div>
            )}

            <div className="mt-6 text-xs text-zinc-600">
              {result.timestamp}
            </div>
          </section>
        )}

        <footer className="mt-12 text-center text-zinc-600 text-sm">
          <a href="/api/healthcheck" className="hover:text-zinc-400">
            GET /api/healthcheck
          </a>
        </footer>
      </div>
    </div>
  );
}

function CheckRow({
  label,
  success,
  duration,
}: {
  label: string;
  success: boolean;
  duration?: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className={success ? "text-green-400" : "text-red-400"}>
        {success ? "✓" : "✗"}
      </span>
      <span className="text-zinc-300">{label}</span>
      {duration !== undefined && (
        <span className="text-zinc-600 text-sm ml-auto">{duration}ms</span>
      )}
    </div>
  );
}
