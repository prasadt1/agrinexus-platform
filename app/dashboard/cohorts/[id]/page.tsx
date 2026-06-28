"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Card, Badge, Button, EmptyState, LineageBadge, toast, CropImage } from "@/app/components";
import { useAuth } from "@/lib/context/AuthProvider";
import { parseFarmerLines } from "@/lib/parse-farmers";
import { attentionFor } from "@/lib/attention";
import { Term } from "@/app/components/Term";

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

type Member = {
  phone: string;
  name?: string;
  enrolledAt: string;
  nudgesSent: number;
  nudgesCompleted: number;
  nudgesExpired: number;
  responseRate: number;
};

export default function CohortDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { tenantName, authHeaders, isAdmin } = useAuth();
  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [license, setLicense] = useState<License>(null);
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(true);
  const [showAddFarmers, setShowAddFarmers] = useState(false);
  const [addFarmersText, setAddFarmersText] = useState("");
  const [enrolling, setEnrolling] = useState(false);
  const [renudging, setRenudging] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCohort();
    fetchMembers();
  }, [id, authHeaders]);

  async function fetchCohort() {
    try {
      const res = await fetch(`/api/cohorts/${id}`, {
        headers: authHeaders(),
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

  async function fetchMembers() {
    try {
      const res = await fetch(`/api/cohorts/${id}/members`, {
        headers: authHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
      }
    } catch (err) {
      console.error("Failed to fetch members:", err);
    } finally {
      setMembersLoading(false);
    }
  }

  async function handleEnrollFarmers() {
    const farmers = parseFarmerLines(addFarmersText);
    if (farmers.length === 0) {
      toast("Add at least one valid phone number (10+ digits)", "error");
      return;
    }
    setEnrolling(true);
    try {
      const res = await fetch(`/api/cohorts/${id}/members`, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ farmers }),
      });
      const data = await res.json();
      if (res.ok) {
        toast(`Enrolled ${data.enrolled} farmer${data.enrolled === 1 ? "" : "s"}`, "success");
        setAddFarmersText("");
        setShowAddFarmers(false);
        setMembersLoading(true);
        fetchMembers();
      } else {
        toast(data.error || "Failed to enroll farmers", "error");
      }
    } catch {
      toast("Request failed", "error");
    } finally {
      setEnrolling(false);
    }
  }

  async function handleRenudge() {
    setRenudging(true);
    try {
      const res = await fetch(`/api/cohorts/${id}/nudge`, {
        method: "POST",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (res.ok) {
        const sent = Number(data.sent) || 0;
        const skipped = Number(data.skipped) || 0;
        const skippedNote =
          skipped > 0 ? ` · ${skipped} skipped (already have a pending reminder)` : "";
        if (data.status === "RUNNING") {
          toast("Nudge cycle started — results will appear in a moment.", "info");
        } else if (sent > 0) {
          toast(`Sent ${sent} reminder${sent === 1 ? "" : "s"}${skippedNote}`, "success");
        } else if (skipped > 0) {
          toast(
            `No new reminders — all ${skipped} eligible farmer${skipped === 1 ? "" : "s"} already have a pending reminder.`,
            "info"
          );
        } else {
          toast("No farmers were due for a reminder right now.", "info");
        }
        // Reflect the new send in the KPIs and farmer table.
        fetchCohort();
        setMembersLoading(true);
        fetchMembers();
      } else {
        toast(data.error || "Failed to send nudge", "error");
      }
    } catch {
      toast("Request failed", "error");
    } finally {
      setRenudging(false);
    }
  }

  // Aggregate stats from summaries
  const totalNudgesSent = summaries.reduce((sum, s) => sum + (s.nudgesSent || 0), 0);
  const totalNudgesCompleted = summaries.reduce((sum, s) => sum + (s.nudgesCompleted || 0), 0);
  const totalNudgesExpired = summaries.reduce((sum, s) => sum + (s.nudgesExpired || 0), 0);
  const totalPending = totalNudgesSent - totalNudgesCompleted - totalNudgesExpired;
  const overallResponseRate = totalNudgesSent > 0 ? totalNudgesCompleted / totalNudgesSent : 0;

  const farmersReached = members.length;

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
  const attention = attentionFor({
    status: cohort.status,
    outcomes: hasOutcomes
      ? {
          followThroughRate: overallResponseRate,
          nudgesSent: totalNudgesSent,
          nudgesCompleted: totalNudgesCompleted,
        }
      : null,
  });

  // One plain-language sentence that tells the partner what's happening here,
  // so the page leads with meaning before the numbers.
  const cropLabel = (cohort.crops || []).join(", ") || "the crop";
  const storyLine =
    cohort.status === "draft"
      ? "This cohort is in draft. Activate it to start sending weather-timed reminders to enrolled farmers."
      : cohort.status === "paused"
      ? "This cohort is paused. No reminders go out until you resume it."
      : cohort.status === "expired"
      ? "This cohort's license has expired. Renew it to resume sending reminders."
      : !hasOutcomes
      ? `Active. Reminders go out automatically when the weather is right for ${cropLabel}.`
      : `${totalNudgesSent} reminder${totalNudgesSent === 1 ? "" : "s"} sent to ${farmersReached} farmer${farmersReached === 1 ? "" : "s"}. ${totalNudgesCompleted} confirmed they acted — a ${Math.round(overallResponseRate * 100)}% follow-through rate.`;

  return (
    <div className="py-10 px-8">
      {/* Breadcrumb + partner */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <nav>
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
        <div className="text-right shrink-0">
          <p className="text-label">Partner</p>
          <p className="font-medium" style={{ color: "var(--color-text-primary)" }}>
            {tenantName || "Partner"}
          </p>
          {license && (
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              {license.plan} plan {license.isDemo && "(demo)"}
            </p>
          )}
        </div>
      </div>

      {/* Hero banner — large crop photo (falls back to a themed crop emblem) */}
      <div
        className="relative h-48 md:h-60 rounded-xl overflow-hidden mb-6"
        style={{ background: "var(--color-primary-tint)" }}
      >
        <CropImage crop={(cohort.crops && cohort.crops[0]) || ""} fill priority rounded="none" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.66) 0%, rgba(0,0,0,0.18) 45%, rgba(0,0,0,0) 72%)",
          }}
        />
        <div className="absolute left-5 right-5 bottom-4">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-page-title" style={{ color: "#fff" }}>
              {cohort.district}
            </h1>
            <Badge status={cohort.status} />
          </div>
          <p style={{ color: "rgba(255,255,255,0.92)" }}>
            {(cohort.crops || []).join(", ")} • {(cohort.languages || []).map((l) => l.toUpperCase()).join(", ")}
          </p>
        </div>
      </div>

      {/* Plain-language summary: what's happening in this cohort, in one line. */}
      <p className="mb-8 max-w-2xl" style={{ color: "var(--color-text-secondary)" }}>
        {storyLine}
      </p>

      {/* Action loop: detect (attention banner) + act (re-nudge) */}
      {isAdmin && cohort.status === "active" && (
        attention.needsAttention ? (
          <div
            className="mb-8 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            style={{ background: "var(--color-warning-bg)", border: "1px solid rgba(181,71,8,0.25)" }}
          >
            <div>
              <p className="font-medium" style={{ color: "var(--color-warning)" }}>
                Needs attention · {attention.label}
              </p>
              <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
                Follow-through is lagging. Send a fresh WhatsApp nudge to the farmers who haven&apos;t
                acted yet.
              </p>
            </div>
            <Button onClick={handleRenudge} disabled={renudging} className="shrink-0">
              {renudging ? "Sending…" : "Re-nudge cohort"}
            </Button>
          </div>
        ) : (
          <div className="mb-8 flex justify-end">
            <Button variant="secondary" onClick={handleRenudge} disabled={renudging}>
              {renudging ? "Sending…" : "Re-nudge cohort"}
            </Button>
          </div>
        )
      )}

      {/* KPI Cards - Always show, with zeros when no data */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <KPICard
          label="Farmers Reached"
          term="farmers reached"
          value={farmersReached}
          format="number"
          empty={false}
        />
        <KPICard
          label="Reminders sent"
          term="reminders sent"
          value={totalNudgesSent}
          format="number"
          empty={!hasOutcomes}
        />
        <KPICard
          label="Response Rate"
          term="response rate"
          value={overallResponseRate}
          format="percent"
          highlight
          empty={!hasOutcomes}
        />
      </section>

      {/* Response Breakdown Chart */}
      <section className="mb-8">
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-card-title">Response Breakdown</h2>
            <LineageBadge />
          </div>
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
              title="No reminders sent yet"
              description={
                cohort.status === "draft"
                  ? "Activate this cohort to begin sending weather-based advisories to farmers."
                  : "Advisory records will appear here as they are sent."
              }
            />
          )}
        </Card>
      </section>

      {/* Farmers Section */}
      <section className="mb-8">
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-card-title">Enrolled Farmers</h2>
            <div className="flex items-center gap-3">
              <span
                className="text-sm px-2 py-1 rounded"
                style={{ background: "var(--color-primary-tint)", color: "var(--color-primary)" }}
              >
                {members.length} farmers
              </span>
              {isAdmin && (
                <Button variant="secondary" onClick={() => setShowAddFarmers((v) => !v)}>
                  {showAddFarmers ? "Cancel" : "Add farmers"}
                </Button>
              )}
            </div>
          </div>

          {showAddFarmers && isAdmin && (
            <div
              className="mb-6 p-4 rounded-lg"
              style={{ background: "var(--color-page-bg)", border: "1px solid var(--color-border)" }}
            >
              <label className="text-label block mb-2">
                Paste one farmer per line —{" "}
                <span style={{ color: "var(--color-text-muted)" }}>phone, name (name optional)</span>
              </label>
              <textarea
                className="input w-full font-mono text-sm"
                rows={5}
                placeholder={"+91 98765 43210, Ramesh Patil\n+91 91234 56789, Sita Devi"}
                value={addFarmersText}
                onChange={(e) => setAddFarmersText(e.target.value)}
              />
              <div className="flex items-center gap-3 mt-3">
                <Button onClick={handleEnrollFarmers} disabled={enrolling || !addFarmersText.trim()}>
                  {enrolling ? "Enrolling…" : "Enroll farmers"}
                </Button>
                <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                  {parseFarmerLines(addFarmersText).length} valid
                </span>
              </div>
              <p className="text-sm mt-2" style={{ color: "var(--color-text-muted)" }}>
                Enrolled farmers join with consent pending — they start receiving advisories after they opt in on WhatsApp.
              </p>
            </div>
          )}
          {membersLoading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 rounded" style={{ background: "var(--color-border)" }} />
              ))}
            </div>
          ) : members.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <th className="text-left py-3 px-4 text-label font-medium">Farmer</th>
                    <th className="text-center py-3 px-4 text-label font-medium">Nudges</th>
                    <th className="text-center py-3 px-4 text-label font-medium">Completed</th>
                    <th className="text-center py-3 px-4 text-label font-medium">Expired</th>
                    <th className="text-right py-3 px-4 text-label font-medium">Response Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <MemberRow key={member.phone} member={member} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No farmers enrolled"
              description="Farmers will appear here once they are enrolled in this cohort."
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
  term,
  value,
  format,
  highlight,
  empty,
}: {
  label: string;
  term?: string;
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
      <p className="text-label mb-2">{term ? <Term term={term}>{label}</Term> : label}</p>
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

// =============================================================================
// Member Row Component
// =============================================================================

function MemberRow({ member }: { member: Member }) {
  // Responsiveness indicator
  const getResponsivenessColor = (rate: number) => {
    if (rate >= 0.7) return "var(--color-success)";
    if (rate >= 0.4) return "var(--color-warning)";
    return "var(--color-text-muted)";
  };

  const getResponsivenessLabel = (rate: number) => {
    if (rate >= 0.7) return "High";
    if (rate >= 0.4) return "Medium";
    if (rate > 0) return "Low";
    return "No data";
  };

  // Format phone for display (mask middle digits)
  const maskedPhone = member.phone.length > 6
    ? `${member.phone.slice(0, 3)}***${member.phone.slice(-3)}`
    : member.phone;

  const initials = member.name
    ? member.name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : member.phone.slice(-2);

  return (
    <tr
      className="hover:bg-opacity-50 transition-colors"
      style={{ borderBottom: "1px solid var(--color-border)" }}
    >
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium"
            style={{
              background: "var(--color-primary-tint)",
              color: "var(--color-primary)",
            }}
          >
            {initials}
          </div>
          {member.name ? (
            <div className="flex flex-col">
              <span className="text-sm font-medium">{member.name}</span>
              <span className="font-mono text-xs" style={{ color: "var(--color-text-muted)" }}>
                {maskedPhone}
              </span>
            </div>
          ) : (
            <span className="font-mono text-sm">{maskedPhone}</span>
          )}
        </div>
      </td>
      <td className="py-3 px-4 text-center">
        <span style={{ color: "var(--color-text-secondary)" }}>
          {member.nudgesSent}
        </span>
      </td>
      <td className="py-3 px-4 text-center">
        <span style={{ color: "var(--color-success)" }}>
          {member.nudgesCompleted}
        </span>
      </td>
      <td className="py-3 px-4 text-center">
        <span style={{ color: "var(--color-text-muted)" }}>
          {member.nudgesExpired}
        </span>
      </td>
      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              background: `${getResponsivenessColor(member.responseRate)}20`,
              color: getResponsivenessColor(member.responseRate),
            }}
          >
            {getResponsivenessLabel(member.responseRate)}
          </span>
          <span className="font-medium" style={{ color: getResponsivenessColor(member.responseRate) }}>
            {member.nudgesSent > 0 ? `${Math.round(member.responseRate * 100)}%` : "—"}
          </span>
        </div>
      </td>
    </tr>
  );
}
