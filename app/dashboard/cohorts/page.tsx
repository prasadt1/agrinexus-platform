"use client";

import { useState, useEffect } from "react";

const TENANT_ID = "demo-tenant-001";

// Supported districts from lib/districts.ts
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
    <div className="p-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Cohorts</h1>
          <p className="text-zinc-400 mt-1">
            Manage farmer cohorts by district
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Cohort
        </button>
      </header>

      {/* Create Form Modal */}
      {showCreateForm && (
        <CreateCohortForm
          onClose={() => setShowCreateForm(false)}
          onCreated={() => {
            setShowCreateForm(false);
            fetchCohorts();
          }}
        />
      )}

      {/* Cohorts Table */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800 text-left">
              <th className="px-6 py-4 text-zinc-400 font-medium text-sm">District</th>
              <th className="px-6 py-4 text-zinc-400 font-medium text-sm">Crops</th>
              <th className="px-6 py-4 text-zinc-400 font-medium text-sm">Languages</th>
              <th className="px-6 py-4 text-zinc-400 font-medium text-sm">Status</th>
              <th className="px-6 py-4 text-zinc-400 font-medium text-sm">Outcomes</th>
              <th className="px-6 py-4 text-zinc-400 font-medium text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                  Loading cohorts...
                </td>
              </tr>
            ) : cohorts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                  No cohorts yet. Create your first cohort to get started.
                </td>
              </tr>
            ) : (
              cohorts.map((cohort) => (
                <tr key={cohort.cohortId} className="hover:bg-zinc-800/50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-white font-medium">{cohort.district}</p>
                      <p className="text-zinc-600 text-xs font-mono">
                        {cohort.cohortId.slice(0, 8)}...
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {cohort.crops.map((crop) => (
                        <span
                          key={crop}
                          className="text-xs px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded"
                        >
                          {crop}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-400">
                    {cohort.languages.map((l) => l.toUpperCase()).join(", ")}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={cohort.status} />
                  </td>
                  <td className="px-6 py-4">
                    {cohort.outcomes ? (
                      <div className="text-sm">
                        <span className="text-green-400 font-medium">
                          {(cohort.outcomes.followThroughRate * 100).toFixed(0)}%
                        </span>
                        <span className="text-zinc-500 ml-1">follow-through</span>
                        <p className="text-zinc-600 text-xs">
                          {cohort.outcomes.nudgesCompleted}/{cohort.outcomes.nudgesSent} nudges
                        </p>
                      </div>
                    ) : (
                      <span className="text-zinc-600 text-sm">No data yet</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {cohort.status === "draft" && (
                      <button
                        onClick={() => activateCohort(cohort.cohortId)}
                        disabled={activatingId === cohort.cohortId}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-zinc-700 text-white text-sm px-3 py-1.5 rounded-lg transition-colors"
                      >
                        {activatingId === cohort.cohortId ? "Activating..." : "Activate"}
                      </button>
                    )}
                    {cohort.status === "active" && (
                      <span className="text-zinc-500 text-sm">Active</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 w-full max-w-lg">
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Create Cohort</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* District */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              District
            </label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select a district...</option>
              {SUPPORTED_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Crops */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Crops
            </label>
            <div className="flex flex-wrap gap-2">
              {CROPS.map((crop) => (
                <button
                  key={crop}
                  type="button"
                  onClick={() => toggleCrop(crop)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    selectedCrops.includes(crop)
                      ? "bg-green-600 text-white"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}
                >
                  {crop}
                </button>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Languages
            </label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => toggleLang(lang.code)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    selectedLangs.includes(lang.code)
                      ? "bg-green-600 text-white"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-zinc-700 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              {submitting ? "Creating..." : "Create Cohort"}
            </button>
          </div>
        </form>
      </div>
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
