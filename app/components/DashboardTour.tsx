"use client";

import { useCallback, useEffect, useRef } from "react";
import { driver, type Driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";
import "./tour/tour-theme.css";

const SEEN_KEY = "outturn_tour_seen";
const START_EVENT = "outturn:start-tour";

/** Keep only steps whose anchor is actually in the DOM (centered steps have no element). */
function presentSteps(steps: DriveStep[]): DriveStep[] {
  if (typeof document === "undefined") return steps;
  return steps.filter(
    (s) => !s.element || (typeof s.element === "string" && document.querySelector(s.element))
  );
}

export function DashboardTour({
  cohortCount,
  loading = false,
}: {
  cohortCount: number;
  loading?: boolean;
}) {
  const driverRef = useRef<Driver | null>(null);
  const autoStartedRef = useRef(false);

  const buildSteps = useCallback((): DriveStep[] => {
    // Empty-state partner (zero cohorts): a short "get started" tour instead.
    if (cohortCount === 0) {
      return presentSteps([
        {
          popover: {
            title: "Welcome to Outturn",
            description:
              "This is the control plane your team logs into. Let's get you set up — it only takes a moment.",
            showButtons: ["next", "close"],
            showProgress: false,
            nextBtnText: "Show me",
            onPopoverRender: (popover, { driver: d }) => addSkipButton(popover, d),
          },
        },
        {
          element: '[data-tour="cohorts"]',
          popover: {
            title: "Create your first cohort",
            description:
              "A cohort is a district + crop group you sponsor. Create one, then enroll farmers to start the advisory loop.",
          },
        },
      ]);
    }

    return presentSteps([
      {
        popover: {
          title: "Welcome to Outturn",
          description:
            "The control plane your team logs into. Want a 45-second tour of what's where?",
          showButtons: ["next", "close"],
          showProgress: false,
          nextBtnText: "Start tour",
          onPopoverRender: (popover, { driver: d }) => addSkipButton(popover, d),
        },
      },
      {
        element: '[data-tour="kpi"]',
        popover: {
          title: "Follow-through, front and centre",
          description:
            "Not \u201Cmessages sent\u201D \u2014 the share of farmers who actually acted on the advice.",
        },
      },
      {
        element: '[data-tour="cohorts"]',
        popover: {
          title: "Your cohorts",
          description:
            "Each one is a district + crop group you sponsor \u2014 provision it, activate it, bill it.",
        },
      },
      {
        element: '[data-tour="attention"]',
        popover: {
          title: "We flag cohorts going quiet",
          description: "So you catch them before the season slips away.",
        },
      },
      {
        element: '[data-tour="run-cycle"]',
        popover: {
          title: "Run an advisory cycle",
          description:
            "Trigger a weather-checked advisory on demand and watch it go out over WhatsApp.",
        },
      },
      {
        element: '[data-tour="nav-activity"]',
        popover: {
          title: "Everything's logged",
          description:
            "Every action is a tenant-scoped audit trail, and licensing runs through Stripe. That's the loop: advise \u2192 measure \u2192 act.",
        },
      },
    ]);
  }, [cohortCount]);

  const startTour = useCallback(() => {
    const steps = buildSteps();
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
          /* private mode / storage disabled — tour just won't persist */
        }
      },
      steps,
    });
    driverRef.current = d;
    d.drive();
  }, [buildSteps]);

  // Auto-start once on a partner's first visit, only on desktop widths.
  // Wait for overview data to load so cohortCount (empty-state branch) is accurate.
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

/** Inject a working "Skip" button on the welcome step (driver disables the native prev on step 1). */
function addSkipButton(
  popover: { footerButtons: HTMLElement; nextButton: HTMLButtonElement },
  d: Driver
) {
  if (popover.footerButtons.querySelector(".outturn-skip-btn")) return;
  const skip = document.createElement("button");
  skip.type = "button";
  skip.textContent = "Skip";
  skip.className = "driver-popover-prev-btn outturn-skip-btn";
  skip.addEventListener("click", () => d.destroy());
  popover.footerButtons.insertBefore(skip, popover.nextButton);
}
