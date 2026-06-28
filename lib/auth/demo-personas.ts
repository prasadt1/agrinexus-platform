import type { PlanTier, TenantType, UserRole } from '@/lib/entities/types';

export interface DemoPersona {
  id: string;
  label: string;
  tenantId: string;
  tenantName: string;
  tenantType: TenantType;
  plan: PlanTier;
  role: UserRole;
  email: string;
  description: string;
}

export const DEMO_PERSONAS: DemoPersona[] = [
  {
    id: 'greenharvest-admin',
    label: 'GreenHarvest NGO',
    tenantId: 'demo-tenant-001',
    tenantName: 'GreenHarvest NGO',
    tenantType: 'ngo',
    plan: 'growth',
    role: 'admin',
    email: 'admin@greenharvest.demo',
    description: 'Admin — provision cohorts, run advisory cycle',
  },
  {
    id: 'greenharvest-viewer',
    label: 'GreenHarvest (Viewer)',
    tenantId: 'demo-tenant-001',
    tenantName: 'GreenHarvest NGO',
    tenantType: 'ngo',
    plan: 'growth',
    role: 'viewer',
    email: 'viewer@greenharvest.demo',
    description: 'Read-only dashboard access',
  },
  {
    id: 'agriinput-admin',
    label: 'AgriInput Corp',
    tenantId: 'demo-tenant-002',
    tenantName: 'AgriInput Corp',
    tenantType: 'agri-input',
    plan: 'enterprise',
    role: 'admin',
    email: 'admin@agriinput.demo',
    description: 'Enterprise partner — different tenant data',
  },
  {
    id: 'kvk-admin',
    label: 'Maharashtra KVK Network',
    tenantId: 'demo-tenant-003',
    tenantName: 'Maharashtra KVK Network',
    tenantType: 'government',
    plan: 'starter',
    role: 'admin',
    email: 'admin@kvk.demo',
    description: 'Government extension program',
  },
];

/**
 * Demo tenants double as white-label partners: each carries a brand colour that
 * re-themes the whole dashboard when you switch tenant. (In production this
 * would live on the tenant record; for the persona-based demo it's the source
 * of truth.) No generated logos — the brand mark is a colour + monogram.
 */
export interface DemoTenant {
  tenantId: string;
  name: string;
  brandColor: string;
}

export const DEMO_TENANTS: DemoTenant[] = [
  { tenantId: 'demo-tenant-001', name: 'GreenHarvest NGO', brandColor: '#157347' },
  { tenantId: 'demo-tenant-002', name: 'AgriInput Corp', brandColor: '#1D4ED8' },
  { tenantId: 'demo-tenant-003', name: 'Maharashtra KVK Network', brandColor: '#7C3AED' },
];

const DEFAULT_BRAND_COLOR = '#157347';

export function brandColorFor(tenantId: string): string {
  return DEMO_TENANTS.find((t) => t.tenantId === tenantId)?.brandColor ?? DEFAULT_BRAND_COLOR;
}

export function findPersona(id: string): DemoPersona | undefined {
  return DEMO_PERSONAS.find((p) => p.id === id);
}
