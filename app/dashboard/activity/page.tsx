"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, PageHeader, EmptyState } from "@/app/components";
import { useAuth } from "@/lib/context/AuthProvider";

type AuditEvent = {
  id: string;
  eventType: "cohort.created" | "cohort.activated" | "cycle.run" | "license.issued" | "cohort.renudged";
  actor: string;
  actorRole?: string;
  summary: string;
  targetType?: string;
  targetId?: string;
  district?: string;
  createdAt: string;
};

const EVENT_META: Record<
  AuditEvent["eventType"],
  { label: string; color: string; tint: string }
> = {
  "cohort.created": { label: "Cohort created", color: "#1570EF", tint: "#EFF8FF" },
  "cohort.activated": { label: "Activated", color: "#157347", tint: "#E6F4EC" },
  "license.issued": { label: "License issued", color: "#6938EF", tint: "#F4F3FF" },
  "cycle.run": { label: "Reminders sent", color: "#B54708", tint: "#FFFAEB" },
  "cohort.renudged": { label: "Re-nudged", color: "#0E7490", tint: "#ECFEFF" },
};

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const s = Math.max(0, Math.round((Date.now() - then) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export default function ActivityPage() {
  const { authHeaders } = useAuth();
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [configured, setConfigured] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchActivity = useCallback(async () => {
    try {
      const res = await fetch("/api/audit", { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
        setConfigured(data.configured !== false);
      }
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  return (
    <div className="py-6 px-4 sm:py-10 sm:px-8">
      <PageHeader
        title="Activity"
        description="A running record of everything that's happened — cohorts created and activated, licenses, and reminder cycles."
      />

      <Card noPadding className="overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-muted">Loading activity…</p>
        ) : !configured ? (
          <EmptyState
            title="No activity recorded yet"
            description="Once you create or activate a cohort, or run a reminder cycle, it will show up here."
          />
        ) : events.length === 0 ? (
          <EmptyState
            title="No activity yet"
            description="Create or activate a cohort, or run an advisory cycle, and it will appear here."
          />
        ) : (
          <ul style={{ margin: 0, padding: "8px 0", listStyle: "none" }}>
            {events.map((ev, i) => {
              const meta = EVENT_META[ev.eventType] ?? {
                label: ev.eventType,
                color: "var(--color-text-muted)",
                tint: "var(--color-page-bg)",
              };
              const last = i === events.length - 1;
              return (
                <li
                  key={ev.id}
                  style={{
                    display: "flex",
                    gap: 14,
                    padding: "14px 20px",
                    borderBottom: last ? "none" : "1px solid var(--color-border)",
                  }}
                >
                  {/* Timeline rail dot */}
                  <div
                    style={{
                      flexShrink: 0,
                      width: 30,
                      height: 30,
                      borderRadius: 999,
                      background: meta.tint,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: 2,
                    }}
                    aria-hidden="true"
                  >
                    <span
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: 999,
                        background: meta.color,
                      }}
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span
                        style={{
                          fontSize: 11.5,
                          fontWeight: 700,
                          letterSpacing: "0.01em",
                          padding: "2px 9px",
                          borderRadius: 999,
                          background: meta.tint,
                          color: meta.color,
                        }}
                      >
                        {meta.label}
                      </span>
                      {ev.district && (
                        <span style={{ fontSize: 12.5, color: "var(--color-text-muted)" }}>
                          {ev.district}
                        </span>
                      )}
                    </div>

                    <p
                      style={{
                        margin: "5px 0 0",
                        fontSize: 14,
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {ev.summary}
                    </p>

                    <p
                      style={{
                        margin: "3px 0 0",
                        fontSize: 12,
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {ev.actor}
                      {ev.actorRole ? ` · ${ev.actorRole}` : ""} ·{" "}
                      <time dateTime={ev.createdAt} title={new Date(ev.createdAt).toLocaleString()}>
                        {relativeTime(ev.createdAt)}
                      </time>
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <p className="mt-6 text-sm" style={{ color: "var(--color-text-muted)" }}>
        Every action here is recorded automatically and can&apos;t be edited after the fact.
      </p>
    </div>
  );
}
