/**
 * Entity Layer - Re-exports
 *
 * All entity access functions enforce tenant isolation in their signatures.
 * Every read/write function takes tenantId as the first required argument
 * (except cross-tenant system queries like listActiveCohorts).
 */

// Types
export * from './types';

// Tenant operations
export {
  getTenant,
  createTenant,
  listTenantUsers,
  createPartnerUser,
  findUserByCognitoSub,
  type PartnerUser,
} from './tenant';

// Cohort operations
export {
  listCohorts,
  getCohort,
  createCohort,
  activateCohort,
  deactivateCohort,
  listActiveCohorts,
  findActiveCohortByDistrict,
} from './cohort';

// License operations
export {
  getLicense,
  createLicense,
  listTenantLicenses,
  createDemoLicense,
} from './license';

// Summary operations
export {
  getCohortSummary,
  listCohortSummaries,
  getLatestCohortSummary,
  getDashboardSummaries,
  getCurrentPeriod,
  upsertCohortSummary,
  recalculateFollowThroughRate,
  type SummaryIncrement,
} from './summary';

// Membership operations
export {
  enrollFarmer,
  getMembership,
  bulkEnrollFarmers,
  listCohortMembers,
  getMemberStats,
} from './membership';

// Re-export MemberStats type
export type { MemberStats } from './types';
