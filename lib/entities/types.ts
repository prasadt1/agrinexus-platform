/**
 * DynamoDB Entity Types
 *
 * These types mirror the actual DynamoDB item shapes, including:
 * - PK/SK key attributes (template literal types for compile-time safety)
 * - GSI attributes where applicable
 *
 * Validated resolutions from VALIDATION.md:
 * - GSI1 uses LOCATION# prefix (not DISTRICT# from original spec)
 * - GSI2PK for active cohorts uses STATUS#active (distinct from NUDGE namespace)
 * - Cohort entities include lat/lon for WeatherPoller
 */

// =============================================================================
// Key Prefixes (compile-time constants)
// =============================================================================

export const KEY_PREFIXES = {
  TENANT: 'TENANT#',
  USER: 'USER#',
  COHORT: 'COHORT#',
  LICENSE: 'LICENSE#',
  SUMMARY: 'SUMMARY#',
  LOCATION: 'LOCATION#',  // GSI1 - validated: existing code uses LOCATION#, not DISTRICT#
  STATUS_ACTIVE: 'STATUS#active',  // GSI2 - distinct from NUDGE namespace
} as const;

// =============================================================================
// Base Types
// =============================================================================

export type TenantType = 'ngo' | 'agri-input' | 'government' | 'mfi';
export type PlanTier = 'starter' | 'growth' | 'enterprise';
export type CohortStatus = 'draft' | 'active' | 'paused' | 'expired';
export type LicenseStatus = 'active' | 'canceled' | 'past_due';
export type UserRole = 'admin' | 'viewer';

// =============================================================================
// Tenant Entity
// =============================================================================

export interface TenantItem {
  // Keys
  PK: `TENANT#${string}`;
  SK: 'META';

  // Attributes
  tenantId: string;
  name: string;
  type: TenantType;
  plan: PlanTier;
  stripeCustomerId?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantInput {
  tenantId: string;
  name: string;
  type: TenantType;
  plan?: PlanTier;
  stripeCustomerId?: string;
}

// =============================================================================
// Partner User Entity
// =============================================================================

export interface PartnerUserItem {
  // Keys
  PK: `TENANT#${string}`;
  SK: `USER#${string}`;

  // Attributes
  tenantId: string;
  userId: string;
  cognitoSub: string;
  email: string;
  role: UserRole;

  // Timestamps
  createdAt: string;
  lastLoginAt?: string;
}

export interface CreatePartnerUserInput {
  userId: string;
  cognitoSub: string;
  email: string;
  role: UserRole;
}

// =============================================================================
// Cohort Entity
// =============================================================================

export interface NudgeRules {
  sprayConditions: {
    maxWindSpeed: number;  // km/h
    maxHumidity: number;   // %
    minTemp: number;       // °C
    maxTemp: number;       // °C
  };
  reminderIntervals: number[];  // hours: [24, 48, 72]
}

export interface CohortFeatures {
  mandiPrices?: boolean;
  personalization?: boolean;
  streamingVoice?: boolean;
}

export interface CohortItem {
  // Keys
  PK: `TENANT#${string}`;
  SK: `COHORT#${string}`;

  // Core attributes
  tenantId: string;
  cohortId: string;

  // Location - REQUIRED for WeatherPoller (validated resolution)
  district: string;
  lat: number;
  lon: number;

  // Config
  crops: string[];
  languages: string[];
  nudgeRules: NudgeRules;
  features?: CohortFeatures;

  // Status
  status: CohortStatus;

  // Timestamps
  createdAt: string;
  activatedAt?: string;
  updatedAt: string;

  // GSI2 attributes - only present when status = 'active'
  // Namespace: STATUS#active (distinct from NUDGE namespace in existing code)
  GSI2PK?: 'STATUS#active';
  GSI2SK?: `COHORT#${string}`;
}

export interface CreateCohortInput {
  cohortId: string;
  district: string;
  lat: number;
  lon: number;
  crops: string[];
  languages: string[];
  nudgeRules: NudgeRules;
  features?: CohortFeatures;
}

// =============================================================================
// License Entity
// =============================================================================

export interface LicenseItem {
  // Keys
  PK: `TENANT#${string}`;
  SK: `LICENSE#${string}`;

  // Attributes
  tenantId: string;
  cohortId: string;
  stripeSubId: string;
  plan: PlanTier;
  status: LicenseStatus;

  // Billing period
  currentPeriodStart: string;
  currentPeriodEnd: string;

  // Demo flag
  isDemo?: boolean;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface CreateLicenseInput {
  cohortId: string;
  stripeSubId: string;
  plan: PlanTier;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  isDemo?: boolean;
}

// =============================================================================
// Outcome Summary Entity (Materialized by Streams Aggregator)
// =============================================================================

export interface CropOutcome {
  adviceSent: number;
  nudgesSent: number;
  nudgesCompleted: number;
  followThroughRate: number;
}

export interface OutcomeSummaryItem {
  // Keys
  PK: `TENANT#${string}`;
  SK: `SUMMARY#${string}#${string}`;  // SUMMARY#<cohortId>#<period>

  // Attributes
  tenantId: string;
  cohortId: string;
  period: string;  // "2026-06"

  // Counters
  adviceSent: number;
  nudgesSent: number;
  nudgesCompleted: number;
  followThroughRate: number;

  // Breakdown
  byCrop: Record<string, CropOutcome>;

  // Timestamps
  lastUpdatedAt: string;
}

// =============================================================================
// Active Cohort (GSI2 projection for WeatherPoller)
// =============================================================================

export interface ActiveCohortProjection {
  tenantId: string;
  cohortId: string;
  district: string;
  lat: number;
  lon: number;
  crops: string[];
  GSI2PK: 'STATUS#active';
  GSI2SK: `COHORT#${string}`;
}

// =============================================================================
// API Response Types (without DynamoDB internals)
// =============================================================================

export interface Tenant {
  tenantId: string;
  name: string;
  type: TenantType;
  plan: PlanTier;
  stripeCustomerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Cohort {
  tenantId: string;
  cohortId: string;
  district: string;
  lat: number;
  lon: number;
  crops: string[];
  languages: string[];
  nudgeRules: NudgeRules;
  features?: CohortFeatures;
  status: CohortStatus;
  createdAt: string;
  activatedAt?: string;
  updatedAt: string;
}

export interface License {
  tenantId: string;
  cohortId: string;
  stripeSubId: string;
  plan: PlanTier;
  status: LicenseStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  isDemo?: boolean;
  createdAt: string;
}

export interface OutcomeSummary {
  cohortId: string;
  period: string;
  adviceSent: number;
  nudgesSent: number;
  nudgesCompleted: number;
  followThroughRate: number;
  byCrop: Record<string, CropOutcome>;
  lastUpdatedAt: string;
}
