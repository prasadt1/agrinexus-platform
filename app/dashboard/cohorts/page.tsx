"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
} from "@/app/components";

const TENANT_ID = "demo-tenant-001";

const SUPPORTED_DISTRICTS = [
  "Latur", "Jalna", "Nagpur", "Pune", "Aurangabad", "Amravati", "Akola",
  "Yavatmal", "Wardha", "Washim", "Adilabad", "Warangal", "Khammam",
  "Rajkot", "Ahmedabad", "Surat", "Indore", "Ujjain", "Dewas",
];

const CROPS = ["cotton", "soybean", "groundnut", "wheat", "rice", "maize"];
const LANGUAGES = [
  { code: "hi", name: "Hindi" },
  { code: "mr", name: "Marathi" },
  { code: "te", name: "Telugu" },
  { code: "gu", name: "Gujarati" },
  { code: "en", name: "English" },
];

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
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activatingId, setActivatingId] = useState<string | null>(null);

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

  async function activateCohort(cohortId: string) {
    setActivatingId(cohortId);
    try {
      const res = await fetch(`/api/cohorts/${cohortId}/demo-activate`, {
        method: "POST",
        headers: { "X-Tenant-ID": TENANT_ID },
      });
      if (res.ok) {
        await fetchCohorts();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to activate cohort");
      }
    } catch (err) {
      console.error("Failed to activate cohort:", err);
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
          <Button onClick={() => setShowCreateForm(true)}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Cohort
          </Button>
        }
      />

      {showCreateForm && (
        <CreateCohortForm
          onClose={() => setShowCreateForm(false)}
          onCreated={() => {
            setShowCreateForm(false);
            fetchCohorts();
          }}
        />
      )}

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
                        <span key={crop} className="chip">
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
                    {cohort.status === "draft" && (
                      <Button
                        onClick={() => activateCohort(cohort.cohortId)}
                        disabled={activatingId === cohort.cohortId}
                        className="text-sm py-1.5"
                      >
                        {activatingId === cohort.cohortId ? "Activating..." : "Activate"}
                      </Button>
                    )}
                    {cohort.status === "active" && (
                      <Link
                        href={`/dashboard/cohorts/${cohort.cohortId}`}
                        className="btn btn-secondary text-sm py-1.5"
                      >
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

function CreateCohortForm({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [district, setDistrict] = useState("");
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [selectedLangs, setSelectedLangs] = useState<string[]>(["hi"]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!district) {
      setError("Please select a district");
      return;
    }
    if (selectedCrops.length === 0) {
      setError("Please select at least one crop");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/cohorts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-ID": TENANT_ID,
        },
        body: JSON.stringify({
          district,
          crops: selectedCrops,
          languages: selectedLangs,
        }),
      });

      if (res.ok) {
        onCreated();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create cohort");
      }
    } catch {
      setError("Request failed");
    } finally {
      setSubmitting(false);
    }
  }

  function toggleCrop(crop: string) {
    setSelectedCrops((prev) =>
      prev.includes(crop) ? prev.filter((c) => c !== crop) : [...prev, crop]
    );
  }

  function toggleLang(lang: string) {
    setSelectedLangs((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div
        className="rounded-lg w-full max-w-lg overflow-hidden"
        style={{
          background: "var(--color-surface)",
          boxShadow: "var(--shadow-modal)",
        }}
      >
        <div
          className="px-6 py-5 flex items-center justify-between"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          <h2 className="text-section">Create Cohort</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
            style={{ color: "var(--color-text-muted)" }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="text-label block mb-2">District</label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="input select"
            >
              <option value="">Select a district...</option>
              {SUPPORTED_DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-label block mb-2">Crops</label>
            <div className="flex flex-wrap gap-2">
              {CROPS.map((crop) => (
                <button
                  key={crop}
                  type="button"
                  onClick={() => toggleCrop(crop)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border"
                  style={{
                    background: selectedCrops.includes(crop) ? "var(--color-primary)" : "var(--color-surface)",
                    color: selectedCrops.includes(crop) ? "white" : "var(--color-text-secondary)",
                    borderColor: selectedCrops.includes(crop) ? "var(--color-primary)" : "var(--color-border)",
                  }}
                >
                  {crop}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-label block mb-2">Languages</label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => toggleLang(lang.code)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border"
                  style={{
                    background: selectedLangs.includes(lang.code) ? "var(--color-primary)" : "var(--color-surface)",
                    color: selectedLangs.includes(lang.code) ? "white" : "var(--color-text-secondary)",
                    borderColor: selectedLangs.includes(lang.code) ? "var(--color-primary)" : "var(--color-border)",
                  }}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div
              className="p-3 rounded-lg"
              style={{ background: "var(--color-status-attention-bg)" }}
            >
              <p style={{ color: "var(--color-status-attention)" }}>{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" onClick={onClose} variant="secondary" className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="flex-1">
              {submitting ? "Creating..." : "Create Cohort"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
