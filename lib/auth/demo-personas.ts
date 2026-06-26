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

export const DEMO_TENANTS = [
  { tenantId: 'demo-tenant-001', name: 'GreenHarvest NGO' },
  { tenantId: 'demo-tenant-002', name: 'AgriInput Corp' },
  { tenantId: 'demo-tenant-003', name: 'Maharashtra KVK Network' },
];

export function findPersona(id: string): DemoPersona | undefined {
  return DEMO_PERSONAS.find((p) => p.id === id);
}
