/**
 * "Needs attention" detection — the *detect* half of the action loop.
 *
 * Flags an active cohort whose advisory program is underperforming so the
 * partner knows where to act (re-nudge / send a field team), instead of just
 * reading a passive report.
 */
export type CohortOutcomes = {
  followThroughRate: number;
  nudgesSent: number;
  nudgesCompleted: number;
} | null | undefined;

export type AttentionReason = "no-replies" | "low-response";

export interface AttentionFlag {
  needsAttention: boolean;
  reason?: AttentionReason;
  label?: string;
}

/** Follow-through at or below this is "low" and worth acting on. */
export const LOW_RESPONSE_THRESHOLD = 0.4;

export function attentionFor(cohort: {
  status: string;
  outcomes: CohortOutcomes;
}): AttentionFlag {
  if (cohort.status !== "active") return { needsAttention: false };

  const o = cohort.outcomes;
  // Nothing sent yet → not underperforming, just new.
  if (!o || o.nudgesSent === 0) return { needsAttention: false };

  if (o.nudgesCompleted === 0) {
    return { needsAttention: true, reason: "no-replies", label: "No replies yet" };
  }
  if (o.followThroughRate <= LOW_RESPONSE_THRESHOLD) {
    return {
      needsAttention: true,
      reason: "low-response",
      label: `Low follow-through · ${Math.round(o.followThroughRate * 100)}%`,
    };
  }
  return { needsAttention: false };
}
