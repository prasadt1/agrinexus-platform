/**
 * Plain-language definitions for the B2B terms used across the platform.
 * Surfaced as hover/tap tooltips via the <Term> component so first-time
 * visitors (NGO / government / agri-input staff) are never lost in jargon.
 */
export const glossary: Record<string, string> = {
  cohort:
    "A group of farmers in one district or village that a partner sponsors for advisory. The unit you provision, activate, and bill.",
  nudge:
    "A timed, plain-language WhatsApp reminder sent to farmers — for example, a safe window to spray before the wind picks up.",
  "advisory loop":
    "The repeating cycle that turns weather into a timely reminder, and farmer replies into proof of follow-through.",
  "follow-through":
    "The share of nudged farmers who actually confirmed they acted — outcomes, not just messages delivered.",
  aggregate:
    "Farmer replies rolled up across a whole cohort into a single follow-through rate the partner can act on.",
  "farmers reached":
    "Unique farmers enrolled in this cohort who can receive WhatsApp advisories.",
  "farmers enrolled":
    "Total unique farmers across all your cohorts who can receive WhatsApp advisories.",
  responses:
    "Reminders where the farmer confirmed they acted — what your follow-through rate is built on.",
  "reminders sent":
    "Total weather-timed WhatsApp reminders delivered to this cohort's farmers.",
  "response rate":
    "Share of reminders where the farmer confirmed they acted — your proof of follow-through, not just delivery.",
};

export type GlossaryKey = keyof typeof glossary;
