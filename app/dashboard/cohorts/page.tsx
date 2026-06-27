"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PageHeader,
  Card,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
  Button,
  EmptyState,
  toast,
  CropIcon,
} from "@/app/components";
import { useAuth } from "@/lib/context/AuthProvider";

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

export default function CohortsPage() {
  const router = useRouter();
  const { isAdmin, authHeaders } = useAuth();
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [activatingId, setActivatingId] = useState<string | null>(null);

  const fetchCohorts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cohorts", { headers: authHeaders() });
      const data = await res.json();
      setCohorts(data.cohorts || []);
    } catch (err) {
      console.error("Failed to fetch cohorts:", err);
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    fetchCohorts();
  }, [fetchCohorts]);

  async function activateCohort(cohortId: string, mode: "demo" | "stripe", plan = "growth") {
    setActivatingId(cohortId);
    try {
      if (mode === "stripe") {
        const res = await fetch(`/api/cohorts/${cohortId}/activate`, {
          method: "POST",
          headers: { ...authHeaders(), "Content-Type": "application/json" },
          body: JSON.stringify({ plan }),
        });
        const data = await res.json();
        if (res.ok && data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
          return;
        }
        if (res.status === 503) {
          toast('Card checkout isn’t enabled in this demo — use “Demo activate” to go live.', "error");
          return;
        }
        toast(data.error || "Stripe checkout unavailable — use demo activate", "error");
        return;
      }

      const res = await fetch(`/api/cohorts/${cohortId}/demo-activate`, {
        method: "POST",
        headers: authHeaders(),
      });
      if (res.ok) {
        toast("Cohort activated (demo mode)", "success");
        await fetchCohorts();
      } else {
        const data = await res.json();
        toast(data.error || "Failed to activate cohort", "error");
      }
    } catch {
      toast("Activation request failed", "error");
    } finally {
      setActivatingId(null);
    }
  }

  return (
    <div className="py-10 px-8">
      <PageHeader
        title="Cohorts"
        description="Manage farmer cohorts by district"
        actions={
          isAdmin ? (
            <Button onClick={() => router.push("/dashboard/cohorts/new")}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Cohort
            </Button>
          ) : undefined
        }
      />

      <Card noPadding className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>District</TableHead>
              <TableHead>Crops</TableHead>
              <TableHead>Languages</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Outcomes</TableHead>
              <TableHead align="right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <tr>
                <TableCell colSpan={6} className="text-center py-12 text-muted">
                  Loading cohorts...
                </TableCell>
              </tr>
            ) : cohorts.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12">
                  <EmptyState
                    title="No cohorts yet"
                    description="Create your first cohort to start onboarding farmers and sending advisories."
                    action={
                      isAdmin ? (
                        <Link href="/dashboard/cohorts/new">
                          <Button>Create cohort</Button>
                        </Link>
                      ) : undefined
                    }
                  />
                </td>
              </tr>
            ) : (
              cohorts.map((cohort) => (
                <TableRow key={cohort.cohortId}>
                  <TableCell>
                    <Link
                      href={`/dashboard/cohorts/${cohort.cohortId}`}
                      className="font-medium hover:underline"
                      style={{ color: "var(--color-primary)" }}
                    >
                      {cohort.district}
                    </Link>
                    <p className="text-xs mt-0.5 font-mono text-muted">
                      {cohort.cohortId.slice(0, 8)}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {cohort.crops.map((crop) => (
                        <span key={crop} className="chip inline-flex items-center gap-1.5">
                          <CropIcon crop={crop} size={14} />
                          {crop}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-secondary">
                    {cohort.languages.map((l) => l.toUpperCase()).join(", ")}
                  </TableCell>
                  <TableCell>
                    <Badge status={cohort.status} />
                  </TableCell>
                  <TableCell>
                    {cohort.outcomes ? (
                      <div>
                        <span className="font-medium" style={{ color: "var(--color-status-active)" }}>
                          {(cohort.outcomes.followThroughRate * 100).toFixed(0)}%
                        </span>
                        <span className="ml-1 text-muted">follow-through</span>
                        <p className="text-xs text-muted">
                          {cohort.outcomes.nudgesCompleted}/{cohort.outcomes.nudgesSent} advisories
                        </p>
                      </div>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {isAdmin && cohort.status === "draft" && (
                      <div className="flex gap-2 justify-end">
                        <Button
                          onClick={() => activateCohort(cohort.cohortId, "demo")}
                          disabled={activatingId === cohort.cohortId}
                          variant="secondary"
                          className="text-sm py-1.5"
                        >
                          {activatingId === cohort.cohortId ? "…" : "Demo activate"}
                        </Button>
                        <Button
                          onClick={() => activateCohort(cohort.cohortId, "stripe", "growth")}
                          disabled={activatingId === cohort.cohortId}
                          className="text-sm py-1.5"
                        >
                          Pay & activate
                        </Button>
                      </div>
                    )}
                    {cohort.status === "active" && (
                      <Link href={`/dashboard/cohorts/${cohort.cohortId}`} className="btn btn-secondary text-sm py-1.5">
                        View
                      </Link>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
