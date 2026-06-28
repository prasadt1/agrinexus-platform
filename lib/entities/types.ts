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
  PHONE: 'PHONE#',        // Cohort membership by phone
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
  nudgesExpired: number;
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
  nudgesExpired: number;  // Separate bucket: farmer didn't respond before T+72h
  followThroughRate: number;

  // Breakdown
  byCrop: Record<string, CropOutcome>;

  // Timestamps
  lastUpdatedAt: string;
}

// =============================================================================
// Cohort Membership Entity (Platform-side phone → cohort mapping)
// =============================================================================

export interface CohortMembershipItem {
  // Keys
  PK: `PHONE#${string}`;
  SK: 'MEMBERSHIP';

  // GSI1: Query members by cohort
  GSI1PK: `COHORT#${string}`;
  GSI1SK: `MEMBER#${string}`;

  // Attributes
  phone: string;
  name?: string;          // optional display name set at enrollment
  tenantId: string;
  cohortId: string;
  enrolledAt: string;
}

// =============================================================================
// Member Stats (computed from NUDGE# records)
// =============================================================================

export interface MemberStats {
  phone: string;
  name?: string;
  tenantId: string;
  cohortId: string;
  enrolledAt: string;
  nudgesSent: number;
  nudgesCompleted: number;
  nudgesExpired: number;
  responseRate: number;  // nudgesCompleted / nudgesSent
}

// =============================================================================
// Farmer Profile (USER#<phone>/PROFILE)
// Owned by the AgriNexus delivery engine. The platform pre-seeds a
// consent=pending profile on partner enrollment so the engine can see the
// farmer by district (GSI1=LOCATION#) but will NOT nudge until they opt in
// over WhatsApp (consent -> granted).
// See docs/superpowers/specs/2026-06-26-close-the-loop-consent-design.md
// =============================================================================

export type ConsentState = 'pending' | 'granted' | 'declined';

export interface FarmerProfileItem {
  // Keys
  PK: `USER#${string}`;
  SK: 'PROFILE';

  // Attributes (mirrors the engine's PROFILE shape)
  phone_number: string;
  dialect: string;
  location: string;                          // district
  location_coords: [number, number] | null;
  crop: string;
  consent: ConsentState;
  consentSource: 'self' | 'partner' | 'template';
  consentAt?: string;
  onboarding_complete: boolean;
  onboarding_state: string;
  created_at: string;
  demo_tier: string;

  // GSI1: recipient selection by district / crop (engine reads LOCATION#)
  GSI1PK: `LOCATION#${string}`;
  GSI1SK: `CROP#${string}`;
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
  nudgeRules?: NudgeRules;
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
  nudgesExpired: number;
  followThroughRate: number;
  byCrop: Record<string, CropOutcome>;
  lastUpdatedAt: string;
}

export interface CohortMembership {
  phone: string;
  name?: string;
  tenantId: string;
  cohortId: string;
  enrolledAt: string;
}
