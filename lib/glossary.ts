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
    "Farmer replies rolled up across a whole cohort into a single response rate the partner can act on.",
};

export type GlossaryKey = keyof typeof glossary;
