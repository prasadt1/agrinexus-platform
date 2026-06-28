"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/app/components/Card";

type Plan = {
  id: "starter" | "growth" | "enterprise";
  name: string;
  price: string;
  perFarmer: string;
  reach: string;
  popular?: boolean;
};

// Mirrors the public landing-page tiers. "enterprise" is shown as "Scale".
const PLANS: Plan[] = [
  { id: "starter", name: "Starter", price: "₹999", perFarmer: "≈ ₹240 / farmer / year", reach: "up to 50 farmers" },
  { id: "growth", name: "Growth", price: "₹2,999", perFarmer: "≈ ₹150 / farmer / year", reach: "up to 200 farmers", popular: true },
  { id: "enterprise", name: "Scale", price: "₹9,999", perFarmer: "≈ ₹120 / farmer / year", reach: "up to 1,000 farmers" },
];

const STEPS: [string, string][] = [
  ["Pick a plan", "Choose the tier that fits how many farmers you reach."],
  ["Set up your first cohort", "A district + crop group — takes about a minute."],
  ["Go live on WhatsApp", "Activate and the advisory loop starts running."],
];

export function OnboardingWelcome({ orgName }: { orgName?: string }) {
  const router = useRouter();

  function choose(plan: Plan["id"]) {
    router.push(`/dashboard/cohorts/new?plan=${plan}&checkout=1`);
  }

  return (
    <div data-tour="cohorts">
      <Card className="mb-8">
        <p className="text-label mb-1" style={{ color: "var(--color-primary)" }}>
          Welcome to Outturn
        </p>
        <h2 className="text-section mb-2">
          {orgName ? `${orgName}, let's get you set up.` : "Let's get you set up."}
        </h2>
        <p className="text-sm max-w-2xl" style={{ color: "var(--color-text-secondary)" }}>
          Your workspace is ready and empty. Choose a plan, set up your first district cohort, and
          start sending weather-timed advice that you can actually measure follow-through on.
        </p>

        <div className="grid sm:grid-cols-3 gap-4 mt-6">
          {STEPS.map(([title, body], i) => (
            <div
              key={title}
              className="p-4 rounded-lg"
              style={{ background: "var(--color-page-bg)" }}
            >
              <span
                className="inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-semibold mb-2"
                style={{ background: "var(--color-primary-tint)", color: "var(--color-primary)" }}
              >
                {i + 1}
              </span>
              <p className="font-medium text-sm">{title}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                {body}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <div className="mb-3">
        <h3 className="text-card-title">Choose your plan</h3>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Each district cohort is licensed monthly through Stripe. You can change plans later.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => (
          <Card
            key={plan.id}
            className="flex flex-col"
            style={
              plan.popular
                ? { border: "1.5px solid var(--color-primary)", position: "relative" }
                : undefined
            }
          >
            {plan.popular && (
              <span
                className="absolute -top-2.5 left-5 text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: "var(--color-primary)", color: "#fff" }}
              >
                Most popular
              </span>
            )}
            <p className="font-semibold text-lg">{plan.name}</p>
            <p className="text-xs mb-3" style={{ color: "var(--color-text-muted)" }}>
              {plan.reach}
            </p>
            <p className="text-kpi" style={{ fontSize: 32 }}>
              {plan.price}
              <span className="text-sm font-normal" style={{ color: "var(--color-text-muted)" }}>
                {" "}
                / mo
              </span>
            </p>
            <p className="text-xs mt-1 mb-4" style={{ color: "var(--color-primary)" }}>
              {plan.perFarmer}
            </p>
            <ul className="space-y-1.5 text-sm mb-5" style={{ color: "var(--color-text-secondary)" }}>
              {["WhatsApp agronomic advisory", "Audited follow-through", "Monitoring dashboard"].map(
                (f) => (
                  <li key={f} className="flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="var(--color-primary)" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                )
              )}
            </ul>
            <button
              type="button"
              onClick={() => choose(plan.id)}
              className="mt-auto w-full rounded-lg py-2.5 text-sm font-medium transition-colors"
              style={
                plan.popular
                  ? { background: "var(--color-primary)", color: "#fff", border: "1px solid var(--color-primary)" }
                  : { background: "var(--color-surface)", color: "var(--color-primary)", border: "1px solid var(--color-border)" }
              }
            >
              Choose {plan.name}
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
