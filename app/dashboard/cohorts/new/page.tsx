"use client";

import { useState, useEffect } from "react";
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
  const [checkoutIntent, setCheckoutIntent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Came from the onboarding plan selector? Preselect the plan + jump to checkout.
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const p = sp.get("plan");
    if (p === "starter" || p === "growth" || p === "enterprise") setPlan(p);
    if (sp.get("checkout") === "1") setCheckoutIntent(true);
  }, []);

  if (!isAdmin) {
    return (
      <div className="py-10 px-8">
        <Card>
          <p className="font-medium">Admin access required</p>
          <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
            You need an admin account to create cohorts. Ask your team&apos;s admin, or switch to an admin login.
          </p>
          <Link href="/dashboard/cohorts" className="btn btn-secondary mt-4 inline-flex">
            Back to cohorts
          </Link>
        </Card>
      </div>
    );
  }

  async function handleSubmit(mode: "draft" | "checkout") {
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
      if (!res.ok) {
        toast(data.error || "Failed to create cohort", "error");
        return;
      }
      const newId = data.cohortId;

      if (mode === "checkout") {
        // Take them straight to Stripe Checkout for the chosen plan.
        const act = await fetch(`/api/cohorts/${newId}/activate`, {
          method: "POST",
          headers: { ...authHeaders(), "Content-Type": "application/json" },
          body: JSON.stringify({ plan }),
        });
        const actData = await act.json().catch(() => ({}));
        if (act.ok && actData.checkoutUrl) {
          window.location.href = actData.checkoutUrl;
          return;
        }
        // Stripe unavailable — don't lose the work; land them on the draft cohort.
        toast("Checkout isn’t available right now — cohort saved as draft.", "info");
        router.push(`/dashboard/cohorts/${newId}`);
        return;
      }

      toast(`Cohort created for ${district}`, "success");
      router.push(`/dashboard/cohorts/${newId}`);
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

      {checkoutIntent && (
        <div
          className="mb-6 p-3 rounded-lg text-sm"
          style={{ background: "var(--color-primary-tint)", color: "var(--color-primary)" }}
        >
          Setting up your first cohort on the <strong>{PLANS.find((p) => p.id === plan)?.name}</strong>{" "}
          plan — you&apos;ll continue to secure payment after this quick review.
        </div>
      )}

      {/* Step indicator */}
      <div className="flex gap-2 mb-8">
        {["Location & crops", "Reminder settings", "Plan & review"].map((label, i) => (
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
              <label className="text-label block mb-2">District</label>
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
              Next: Reminder settings
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              These limits decide when this cohort&apos;s farmers are nudged to spray, and how
              reminders are paced.
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
              <p><strong>Plan:</strong> {PLANS.find((p) => p.id === plan)?.name} ({PLANS.find((p) => p.id === plan)?.price})</p>
              <p>
                <strong>Next:</strong> secure Stripe checkout for the{" "}
                {PLANS.find((p) => p.id === plan)?.name} plan — or save as a draft and activate later.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => setStep(2)}>Back</Button>
              <Button onClick={() => handleSubmit("checkout")} disabled={submitting}>
                {submitting ? "Working…" : "Create & continue to payment"}
              </Button>
              <Button variant="secondary" onClick={() => handleSubmit("draft")} disabled={submitting}>
                Save as draft
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
