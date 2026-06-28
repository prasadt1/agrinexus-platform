"use client";

import { useState } from "react";
import { Button } from "@/app/components";
import { useAuth } from "@/lib/context/AuthProvider";
import { toast } from "@/app/components/Toast";

type PollerResult = {
  cohortId: string;
  district: string;
  weather: { wind_speed: number; rain: number; mock?: boolean };
  triggered: boolean;
  executionArn?: string;
};

type PollerResponse = {
  message: string;
  cohorts_checked: number;
  nudges_triggered: number;
  results: PollerResult[];
};

const LOOP_STEPS = [
  { id: "provision", label: "Set up", plain: "Add a district" },
  { id: "activate", label: "Go live", plain: "Activate the group" },
  { id: "poll", label: "Check weather", plain: "Watch each district" },
  { id: "nudge", label: "Send reminders", plain: "WhatsApp reminders" },
  { id: "stream", label: "Collect replies", plain: "Tally responses" },
  { id: "dashboard", label: "See results", plain: "Follow-through rate" },
];

export function AdvisoryLoopHero({ onHowItWorks }: { onHowItWorks?: () => void } = {}) {
  const { isAdmin, authHeaders } = useAuth();
  const [running, setRunning] = useState(false);
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [result, setResult] = useState<PollerResponse | null>(null);

  async function runCycle() {
    setRunning(true);
    setResult(null);
    setActiveStep("poll");
    try {
      const res = await fetch("/api/demo/trigger-poller", {
        method: "POST",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "Failed to run cycle", "error");
        return;
      }
      setActiveStep("nudge");
      setTimeout(() => setActiveStep("stream"), 600);
      setTimeout(() => setActiveStep("dashboard"), 1200);
      setResult(data);
      toast(`Processed ${data.cohorts_checked} cohort(s), ${data.nudges_triggered} nudge(s) triggered`, "success");
    } catch {
      toast("Network error running advisory cycle", "error");
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="mb-8">
      <div
        className="card card-elevated overflow-hidden"
        style={{ borderColor: "var(--color-primary)", borderWidth: "1px" }}
      >
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6">
          <div>
            <p className="text-label mb-1" style={{ color: "var(--color-primary)" }}>
              Advisory loop
            </p>
            <h2 className="text-section">From weather to confirmed follow-through</h2>
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Each active cohort is watched for the right conditions, nudged on WhatsApp, and measured by who acted.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {onHowItWorks && (
              <button
                onClick={onHowItWorks}
                className="btn btn-secondary inline-flex items-center gap-1.5"
                style={{ fontSize: 13 }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                How it works
              </button>
            )}
            {isAdmin && (
              <Button onClick={runCycle} disabled={running}>
                {running ? "Running cycle…" : "Run advisory cycle"}
              </Button>
            )}
          </div>
        </div>

        {/* Loop steps */}
        <div className="flex flex-wrap gap-2 mb-6">
          {LOOP_STEPS.map((step, i) => {
            const isLit = activeStep === step.id || (running && step.id === "poll");
            return (
              <div key={step.id} className="flex items-center gap-2">
                <div
                  className="px-3 py-2 rounded-lg text-center min-w-[88px] transition-all duration-300"
                  style={{
                    background: isLit ? "var(--color-primary)" : "var(--color-page-bg)",
                    color: isLit ? "#fff" : "var(--color-text-secondary)",
                    boxShadow: isLit ? "var(--shadow-card-hover)" : "none",
                  }}
                >
                  <p className="text-xs font-semibold">{step.label}</p>
                  <p className="text-[10px] opacity-80 mt-0.5">{step.plain}</p>
                </div>
                {i < LOOP_STEPS.length - 1 && (
                  <span style={{ color: "var(--color-text-muted)" }}>→</span>
                )}
              </div>
            );
          })}
        </div>

        {isAdmin && !result && !running && (
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            <strong style={{ color: "var(--color-text-secondary)" }}>Run advisory cycle</strong> checks
            live weather for every active cohort and sends real WhatsApp spray reminders where
            conditions are right. It is a live action, not a simulation.
          </p>
        )}

        {result && (
          <div className="space-y-2 pt-4 border-t" style={{ borderColor: "var(--color-border)" }}>
            <p className="text-sm font-medium">
              Checked {result.cohorts_checked} active cohort{result.cohorts_checked === 1 ? "" : "s"}
              {" · "}
              <span style={{ color: "var(--color-success)" }}>
                {result.nudges_triggered} reminder{result.nudges_triggered === 1 ? "" : "s"} sent
              </span>
              {result.cohorts_checked - result.nudges_triggered > 0 &&
                ` · ${result.cohorts_checked - result.nudges_triggered} skipped (weather not right)`}
            </p>
            {result.results.map((r) => (
              <div
                key={r.cohortId}
                className="flex items-center justify-between p-3 rounded-lg text-sm"
                style={{ background: "var(--color-page-bg)" }}
              >
                <span className="font-medium">{r.district}</span>
                <span style={{ color: "var(--color-text-muted)" }}>
                  wind {r.weather.wind_speed.toFixed(1)} km/h · rain {r.weather.rain}mm
                  {r.weather.mock && " (mock)"}
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: r.triggered ? "var(--color-success-bg)" : "var(--color-page-bg)",
                    color: r.triggered ? "var(--color-success)" : "var(--color-text-muted)",
                  }}
                >
                  {r.triggered ? "Reminder sent" : "Weather not right"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function LineageBadge() {
  return (
    <span className="lineage-badge" title="These numbers update on their own as farmers reply — you never refresh or import anything.">
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      Updated automatically
    </span>
  );
}
