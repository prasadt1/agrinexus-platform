"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, PageHeader, toast } from "@/app/components";
import { useAuth } from "@/lib/context/AuthProvider";
import type { PlanTier } from "@/lib/entities/types";

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

const PLANS: { id: PlanTier; name: string; price: string; desc: string }[] = [
  { id: "starter", name: "Starter", price: "₹999/mo", desc: "Up to 1 active cohort, 500 farmers" },
  { id: "growth", name: "Growth", price: "₹2,999/mo", desc: "Up to 5 cohorts, 5,000 farmers" },
  { id: "enterprise", name: "Enterprise", price: "₹9,999/mo", desc: "Unlimited cohorts, priority support" },
];

const DEFAULT_NUDGE = {
  sprayConditions: { maxWindSpeed: 15, maxHumidity: 85, minTemp: 15, maxTemp: 35 },
  reminderIntervals: [24, 48, 72],
};

export default function NewCohortPage() {
  const router = useRouter();
  const { isAdmin, authHeaders } = useAuth();
  const [step, setStep] = useState(1);
  const [district, setDistrict] = useState("");
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [selectedLangs, setSelectedLangs] = useState<string[]>(["hi"]);
  const [nudgeRules, setNudgeRules] = useState(DEFAULT_NUDGE);
  const [plan, setPlan] = useState<PlanTier>("growth");
  const [submitting, setSubmitting] = useState(false);

  if (!isAdmin) {
    return (
      <div className="py-10 px-8">
        <Card>
          <p className="font-medium">Admin access required</p>
          <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
            Sign in with an admin demo persona to provision cohorts.
          </p>
          <Link href="/dashboard/cohorts" className="btn btn-secondary mt-4 inline-flex">
            Back to cohorts
          </Link>
        </Card>
      </div>
    );
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/cohorts", {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          district,
          crops: selectedCrops,
          languages: selectedLangs,
          nudgeRules,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast(`Cohort created for ${district}`, "success");
        router.push(`/dashboard/cohorts/${data.cohortId}`);
      } else {
        toast(data.error || "Failed to create cohort", "error");
      }
    } catch {
      toast("Request failed", "error");
    } finally {
      setSubmitting(false);
    }
  }

  function toggleCrop(crop: string) {
    setSelectedCrops((p) => (p.includes(crop) ? p.filter((c) => c !== crop) : [...p, crop]));
  }

  function toggleLang(code: string) {
    setSelectedLangs((p) => (p.includes(code) ? p.filter((l) => l !== code) : [...p, code]));
  }

  return (
    <div className="py-10 px-8 max-w-2xl">
      <PageHeader
        title="New cohort"
        description="Set up a group of farmers in one district for WhatsApp advisory."
      />

      {/* Step indicator */}
      <div className="flex gap-2 mb-8">
        {["Location & crops", "Nudge rules", "Plan & review"].map((label, i) => (
          <div
            key={label}
            className="flex-1 text-center py-2 rounded-lg text-xs font-medium"
            style={{
              background: step === i + 1 ? "var(--color-primary)" : "var(--color-page-bg)",
              color: step === i + 1 ? "#fff" : "var(--color-text-muted)",
            }}
          >
            {i + 1}. {label}
          </div>
        ))}
      </div>

      <Card>
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="text-label block mb-2">District → GSI1 LOCATION#</label>
              <select value={district} onChange={(e) => setDistrict(e.target.value)} className="input select">
                <option value="">Select district…</option>
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
                    className="px-3 py-1.5 rounded-lg text-sm font-medium border"
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
                    className="px-3 py-1.5 rounded-lg text-sm font-medium border"
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
            <Button onClick={() => setStep(2)} disabled={!district || selectedCrops.length === 0}>
              Next: Nudge rules
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              The safe-spray window for this cohort — the weather conditions under which farmers are
              nudged to spray.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: "maxWindSpeed", label: "Max wind (km/h)" },
                { key: "maxHumidity", label: "Max humidity (%)" },
                { key: "minTemp", label: "Min temp (°C)" },
                { key: "maxTemp", label: "Max temp (°C)" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="text-label block mb-1">{label}</label>
                  <input
                    type="number"
                    className="input"
                    value={nudgeRules.sprayConditions[key as keyof typeof nudgeRules.sprayConditions]}
                    onChange={(e) =>
                      setNudgeRules({
                        ...nudgeRules,
                        sprayConditions: {
                          ...nudgeRules.sprayConditions,
                          [key]: Number(e.target.value),
                        },
                      })
                    }
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={() => setStep(3)}>Next: Plan</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-3">
              {PLANS.map((p) => (
                <label
                  key={p.id}
                  className="flex items-start gap-3 p-4 rounded-lg border cursor-pointer"
                  style={{
                    borderColor: plan === p.id ? "var(--color-primary)" : "var(--color-border)",
                    background: plan === p.id ? "var(--color-primary-tint)" : "var(--color-surface)",
                  }}
                >
                  <input
                    type="radio"
                    name="plan"
                    checked={plan === p.id}
                    onChange={() => setPlan(p.id)}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium">{p.name} — {p.price}</p>
                    <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{p.desc}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="p-4 rounded-lg text-sm" style={{ background: "var(--color-page-bg)" }}>
              <p><strong>District:</strong> {district}</p>
              <p><strong>Crops:</strong> {selectedCrops.join(", ")}</p>
              <p><strong>Languages:</strong> {selectedLangs.join(", ")}</p>
              <p><strong>Status:</strong> draft (activate after creation)</p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(2)}>Back</Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Creating…" : "Create cohort (draft)"}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
