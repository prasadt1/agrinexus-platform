/**
 * Request Validation Schemas
 *
 * Using Zod for runtime validation of API request bodies.
 * Schemas match the entity types in lib/entities/types.ts.
 */

import { z } from 'zod';

// =============================================================================
// Cohort Schemas
// =============================================================================

export const nudgeRulesSchema = z.object({
  sprayConditions: z.object({
    maxWindSpeed: z.number().min(0).max(50).default(15),
    maxHumidity: z.number().min(0).max(100).default(85),
    minTemp: z.number().min(-10).max(50).default(15),
    maxTemp: z.number().min(-10).max(60).default(35),
  }),
  reminderIntervals: z.array(z.number().min(1).max(168)).default([24, 48, 72]),
});

export const cohortFeaturesSchema = z.object({
  mandiPrices: z.boolean().optional(),
  personalization: z.boolean().optional(),
  streamingVoice: z.boolean().optional(),
});

export const createCohortSchema = z.object({
  district: z.string().min(1).max(100),
  // lat/lon optional - will be looked up from district if not provided
  lat: z.number().min(-90).max(90).optional(),
  lon: z.number().min(-180).max(180).optional(),
  crops: z.array(z.string().min(1).max(50)).min(1).max(10),
  languages: z.array(z.string().length(2)).min(1).max(5), // ISO 639-1 codes
  nudgeRules: nudgeRulesSchema.optional(),
  features: cohortFeaturesSchema.optional(),
});

export type CreateCohortRequest = z.infer<typeof createCohortSchema>;

// =============================================================================
// Query Parameter Schemas
// =============================================================================

export const listCohortsQuerySchema = z.object({
  status: z.enum(['draft', 'active', 'paused', 'expired']).optional(),
});

export const outcomesQuerySchema = z.object({
  period: z.string().regex(/^\d{4}-\d{2}$/).optional(), // YYYY-MM format
});

// =============================================================================
// Validation Helper
// =============================================================================

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; details: z.ZodIssue[] };

export function validateBody<T>(
  schema: z.ZodSchema<T>,
  body: unknown
): ValidationResult<T> {
  const result = schema.safeParse(body);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    error: 'Validation failed',
    details: result.error.issues,
  };
}
