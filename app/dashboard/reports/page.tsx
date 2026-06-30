"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, PageHeader, EmptyState } from "@/app/components";
import { useAuth } from "@/lib/context/AuthProvider";

type CohortRow = {
  cohortId: string;
  district: string;
  status: string;
  crops: string[];
  memberCount: number;
  nudgesSent: number;
  nudgesCompleted: number;
  responseRate: number;
};

type AuditEvent = {
  id: string;
  eventType: string;
  actor: string;
  summary: string;
  district?: string;
  createdAt: string;
};

function pct(rate: number): string {
  return `${Math.round((rate || 0) * 100)}%`;
}

export default function ReportsPage() {
  const { authHeaders, tenantName } = useAuth();
  const [cohorts, setCohorts] = useState<CohortRow[]>([]);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(true);
  const [district, setDistrict] = useState("all");

  const load = useCallback(async () => {
    try {
      const [ovRes, auRes] = await Promise.all([
        fetch("/api/overview", { headers: authHeaders() }),
        fetch("/api/audit", { headers: authHeaders() }),
      ]);
      if (ovRes.ok) {
        const d = await ovRes.json();
        setCohorts(
          (d.cohorts || []).filter((c: CohortRow) => c.status === "active" && c.nudgesSent > 0)
        );
        setOrgName(d.tenant?.name || "");
      }
      if (auRes.ok) {
        const d = await auRes.json();
        setEvents(d.events || []);
      }
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    load();
  }, [load]);

  const districts = useMemo(
    () => Array.from(new Set(cohorts.map((c) => c.district))).sort(),
    [cohorts]
  );

  const scoped = useMemo(
    () => (district === "all" ? cohorts : cohorts.filter((c) => c.district === district)),
    [cohorts, district]
  );

  // Aggregate cohorts by district for the headline table.
  const byDistrict = useMemo(() => {
    const map = new Map<
      string,
      { district: string; cohorts: number; farmers: number; sent: number; acted: number }
    >();
    for (const c of scoped) {
      const row = map.get(c.district) || { district: c.district, cohorts: 0, farmers: 0, sent: 0, acted: 0 };
      row.cohorts += 1;
      row.farmers += c.memberCount;
      row.sent += c.nudgesSent;
      row.acted += c.nudgesCompleted;
      map.set(c.district, row);
    }
    return Array.from(map.values()).sort((a, b) => a.district.localeCompare(b.district));
  }, [scoped]);

  const totals = useMemo(() => {
    const sent = scoped.reduce((s, c) => s + c.nudgesSent, 0);
    const acted = scoped.reduce((s, c) => s + c.nudgesCompleted, 0);
    const farmers = scoped.reduce((s, c) => s + c.memberCount, 0);
    return {
      districts: byDistrict.length,
      farmers,
      sent,
      acted,
      rate: sent > 0 ? acted / sent : 0,
    };
  }, [scoped, byDistrict]);

  const period = new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const generated = new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const org = orgName || tenantName || "Partner organisation";
  const scopeLabel = district === "all" ? "All districts" : district;

  return (
    <div className="py-6 px-4 sm:py-10 sm:px-8">
      <div className="no-print">
        <PageHeader
          title="Reports"
          description="Generate a follow-through status report for district administration. Print or save as PDF."
        />

        <Card className="mb-8">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label htmlFor="rpt-district" className="block text-xs font-medium mb-1" style={{ color: "var(--color-text-muted)" }}>
                District scope
              </label>
              <select
                id="rpt-district"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="text-sm rounded-lg px-3 py-2 border outline-none"
                style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
              >
                <option value="all">All districts</option>
                {districts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--color-text-muted)" }}>
                Reporting period
              </label>
              <div className="text-sm rounded-lg px-3 py-2 border" style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}>
                {period}
              </div>
            </div>
            <button
              onClick={() => window.print()}
              className="text-sm font-medium px-4 py-2 rounded-lg"
              style={{ background: "var(--color-primary)", color: "#fff" }}
            >
              Print / Save as PDF
            </button>
          </div>
        </Card>
      </div>

      {loading ? (
        <p className="p-8 text-center text-muted">Loading report…</p>
      ) : scoped.length === 0 ? (
        <EmptyState
          title="No active cohorts to report"
          description="Activate a cohort and its follow-through will appear in the report."
        />
      ) : (
        <div
          className="report-doc"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 14,
            padding: "40px 44px",
            maxWidth: 900,
          }}
        >
          {/* Letterhead */}
          <div style={{ borderBottom: "2px solid var(--color-primary)", paddingBottom: 18, marginBottom: 24 }}>
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h1 style={{ fontFamily: "var(--font-serif), Georgia, serif", fontSize: 26, fontWeight: 600, margin: 0, color: "var(--color-text-primary)" }}>
                  Advisory Follow-Through Report
                </h1>
                <p style={{ margin: "4px 0 0", color: "var(--color-text-secondary)", fontSize: 14 }}>
                  {org} · Prepared for district administration
                </p>
              </div>
              <div style={{ textAlign: "right", fontSize: 12.5, color: "var(--color-text-muted)" }}>
                <p style={{ margin: 0 }}>Period: <strong style={{ color: "var(--color-text-secondary)" }}>{period}</strong></p>
                <p style={{ margin: "2px 0 0" }}>Scope: {scopeLabel}</p>
                <p style={{ margin: "2px 0 0" }}>Generated: {generated}</p>
              </div>
            </div>
          </div>

          {/* Summary band */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-7">
            {[
              ["Districts", String(totals.districts)],
              ["Farmers reached", totals.farmers.toLocaleString()],
              ["Advisories sent", totals.sent.toLocaleString()],
              ["Follow-through", pct(totals.rate)],
            ].map(([label, value]) => (
              <div key={label} style={{ border: "1px solid var(--color-border)", borderRadius: 10, padding: "12px 14px" }}>
                <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-muted)" }}>{label}</p>
                <p style={{ margin: "2px 0 0", fontSize: 22, fontWeight: 600, color: "var(--color-text-primary)" }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Per-district table */}
          <h2 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 10px", color: "var(--color-text-primary)" }}>
            Follow-through by district
          </h2>
          <table className="w-full" style={{ borderCollapse: "collapse", marginBottom: 28, fontSize: 13.5 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)", textAlign: "left", color: "var(--color-text-muted)" }}>
                <th style={{ padding: "8px 6px" }}>District</th>
                <th style={{ padding: "8px 6px" }}>Cohorts</th>
                <th style={{ padding: "8px 6px" }}>Farmers</th>
                <th style={{ padding: "8px 6px", textAlign: "right" }}>Sent</th>
                <th style={{ padding: "8px 6px", textAlign: "right" }}>Acted</th>
                <th style={{ padding: "8px 6px", textAlign: "right" }}>Follow-through</th>
              </tr>
            </thead>
            <tbody>
              {byDistrict.map((r) => (
                <tr key={r.district} style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
                  <td style={{ padding: "8px 6px", fontWeight: 500, color: "var(--color-text-primary)" }}>{r.district}</td>
                  <td style={{ padding: "8px 6px" }}>{r.cohorts}</td>
                  <td style={{ padding: "8px 6px" }}>{r.farmers}</td>
                  <td style={{ padding: "8px 6px", textAlign: "right" }}>{r.sent}</td>
                  <td style={{ padding: "8px 6px", textAlign: "right" }}>{r.acted}</td>
                  <td style={{ padding: "8px 6px", textAlign: "right", fontWeight: 600, color: "var(--color-primary)" }}>{pct(r.sent > 0 ? r.acted / r.sent : 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Per-cohort detail */}
          <h2 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 10px", color: "var(--color-text-primary)" }}>
            Cohort detail
          </h2>
          <table className="w-full" style={{ borderCollapse: "collapse", marginBottom: 28, fontSize: 13.5 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)", textAlign: "left", color: "var(--color-text-muted)" }}>
                <th style={{ padding: "8px 6px" }}>District</th>
                <th style={{ padding: "8px 6px" }}>Crops</th>
                <th style={{ padding: "8px 6px" }}>Farmers</th>
                <th style={{ padding: "8px 6px", textAlign: "right" }}>Sent</th>
                <th style={{ padding: "8px 6px", textAlign: "right" }}>Acted</th>
                <th style={{ padding: "8px 6px", textAlign: "right" }}>Follow-through</th>
              </tr>
            </thead>
            <tbody>
              {scoped.map((c) => (
                <tr key={c.cohortId} style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
                  <td style={{ padding: "8px 6px", fontWeight: 500, color: "var(--color-text-primary)" }}>{c.district}</td>
                  <td style={{ padding: "8px 6px", textTransform: "capitalize" }}>{c.crops.join(", ") || "—"}</td>
                  <td style={{ padding: "8px 6px" }}>{c.memberCount}</td>
                  <td style={{ padding: "8px 6px", textAlign: "right" }}>{c.nudgesSent}</td>
                  <td style={{ padding: "8px 6px", textAlign: "right" }}>{c.nudgesCompleted}</td>
                  <td style={{ padding: "8px 6px", textAlign: "right", fontWeight: 600, color: "var(--color-primary)" }}>{pct(c.responseRate)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Activity / audit excerpt */}
          <h2 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 10px", color: "var(--color-text-primary)" }}>
            Recent control-plane activity
          </h2>
          {events.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--color-text-muted)", margin: "0 0 24px" }}>
              No recorded activity for this period.
            </p>
          ) : (
            <ul style={{ listStyle: "none", margin: "0 0 24px", padding: 0 }}>
              {events.slice(0, 8).map((e) => (
                <li key={e.id} style={{ display: "flex", gap: 12, padding: "7px 0", borderBottom: "1px solid var(--color-border-subtle)", fontSize: 13 }}>
                  <span style={{ color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>
                    {new Date(e.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                  </span>
                  <span style={{ color: "var(--color-text-secondary)" }}>{e.summary}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Footer */}
          <p style={{ fontSize: 11.5, color: "var(--color-text-muted)", borderTop: "1px solid var(--color-border)", paddingTop: 14, margin: 0 }}>
            Generated by Outturn on {generated}. Follow-through reflects confirmed farmer action on WhatsApp advisories, not message delivery. Figures are for the current reporting period in the demo workspace.
          </p>
        </div>
      )}
    </div>
  );
}
