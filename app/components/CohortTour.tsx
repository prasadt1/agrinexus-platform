"use client";

import { useCallback, useEffect, useRef } from "react";
import { driver, type Driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";
import "./tour/tour-theme.css";

const SEEN_KEY = "outturn_cohort_tour_seen";
const START_EVENT = "outturn:start-tour";

/** Keep only steps whose anchor is in the DOM (e.g. re-nudge is admin-only). */
function presentSteps(steps: DriveStep[]): DriveStep[] {
  if (typeof document === "undefined") return steps;
  return steps.filter(
    (s) => !s.element || (typeof s.element === "string" && document.querySelector(s.element))
  );
}

export function CohortTour({ loading = false }: { loading?: boolean }) {
  const driverRef = useRef<Driver | null>(null);
  const autoStartedRef = useRef(false);

  const startTour = useCallback(() => {
    const steps = presentSteps([
      {
        element: '[data-tour="cohort-followthrough"]',
        popover: {
          title: "Follow-through for this cohort",
          description: "Rolled up from real farmer replies, not delivery receipts.",
        },
      },
      {
        element: '[data-tour="cohort-roster"]',
        popover: {
          title: "The roster",
          description: "Who's enrolled, and who's confirmed they acted.",
        },
      },
      {
        element: '[data-tour="cohort-renudge"]',
        popover: {
          title: "Re-nudge the quiet farmers",
          description:
            "One click re-nudges the farmers who haven't acted \u2014 admin-only, and it won't double-send.",
        },
      },
    ]);
    if (steps.length === 0) return;

    const d = driver({
      showProgress: true,
      progressText: "{{current}} of {{total}}",
      allowClose: true,
      overlayColor: "#1a1714",
      overlayOpacity: 0.55,
      stagePadding: 6,
      stageRadius: 10,
      popoverClass: "outturn-tour",
      nextBtnText: "Next",
      prevBtnText: "Back",
      doneBtnText: "Done",
      onDestroyed: () => {
        try {
          localStorage.setItem(SEEN_KEY, "1");
        } catch {
          /* storage blocked — tour just won't persist */
        }
      },
      steps,
    });
    driverRef.current = d;
    d.drive();
  }, []);

  // Auto-start once on a partner's first cohort visit, desktop only, after data loads.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (loading || autoStartedRef.current) return;
    let seen = "0";
    try {
      seen = localStorage.getItem(SEEN_KEY) || "0";
    } catch {
      seen = "1"; // storage blocked → don't nag
    }
    if (seen === "1") return;
    if (window.innerWidth < 768) return;
    autoStartedRef.current = true;
    const t = window.setTimeout(() => startTour(), 600);
    return () => window.clearTimeout(t);
  }, [loading, startTour]);

  // Global "Take a tour" trigger (sidebar) — explicit action ignores the seen flag.
  useEffect(() => {
    const handler = () => startTour();
    window.addEventListener(START_EVENT, handler);
    return () => window.removeEventListener(START_EVENT, handler);
  }, [startTour]);

  return (
    <button
      type="button"
      onClick={startTour}
      className="inline-flex items-center gap-1.5 text-sm font-medium rounded-lg px-3 py-1.5 transition-colors"
      style={{
        border: "1px solid var(--color-border)",
        background: "var(--color-surface)",
        color: "var(--color-primary)",
      }}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      Take the tour
    </button>
  );
}
