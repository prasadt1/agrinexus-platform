/**
 * Idempotent demo seed for H0 judges.
 * Run: npm run seed
 */

import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const PERIOD = new Date().toISOString().slice(0, 7);

const TENANTS = [
  {
    tenantId: 'demo-tenant-001',
    name: 'GreenHarvest NGO',
    type: 'ngo' as const,
    plan: 'growth' as const,
    cohorts: [
      { district: 'Latur', crops: ['cotton', 'soybean'], languages: ['hi', 'mr'], status: 'active' as const },
      { district: 'Jalna', crops: ['cotton'], languages: ['mr'], status: 'active' as const },
      { district: 'Pune', crops: ['wheat'], languages: ['hi'], status: 'draft' as const },
    ],
    farmers: ['919876543210', '919876543211', '919876543212'],
  },
  {
    tenantId: 'demo-tenant-002',
    name: 'AgriInput Corp',
    type: 'agri-input' as const,
    plan: 'enterprise' as const,
    cohorts: [
      { district: 'Nagpur', crops: ['cotton', 'soybean'], languages: ['hi', 'mr'], status: 'active' as const },
      { district: 'Wardha', crops: ['soybean'], languages: ['mr'], status: 'active' as const },
    ],
    farmers: ['919876543220', '919876543221', '919876543222'],
  },
  {
    tenantId: 'demo-tenant-003',
    name: 'Maharashtra KVK Network',
    type: 'government' as const,
    plan: 'starter' as const,
    cohorts: [
      { district: 'Aurangabad', crops: ['cotton'], languages: ['hi', 'mr'], status: 'active' as const },
      { district: 'Amravati', crops: ['soybean', 'wheat'], languages: ['mr'], status: 'draft' as const },
    ],
    farmers: ['919876543230', '919876543231'],
  },
];

const DEFAULT_NUDGE_RULES = {
  sprayConditions: { maxWindSpeed: 15, maxHumidity: 85, minTemp: 15, maxTemp: 35 },
  reminderIntervals: [24, 48, 72],
};

async function main() {
  if (!process.env.DYNAMODB_TABLE_NAME) {
    console.error('Set DYNAMODB_TABLE_NAME in .env.local');
    process.exit(1);
  }

  const { ulid } = await import('ulid');
  const { docClient, TABLE_NAME, PutCommand, GetCommand } = await import('../lib/dynamo');
  const { KEY_PREFIXES } = await import('../lib/entities/types');
  const { DISTRICT_COORDS } = await import('../lib/districts');

  async function exists(pk: string, sk: string) {
    const res = await docClient.send(new GetCommand({ TableName: TABLE_NAME, Key: { PK: pk, SK: sk } }));
    return !!res.Item;
  }

  async function put(item: Record<string, unknown>, label: string) {
    await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
    console.log(`  ✓ ${label}`);
  }

  console.log(`Seeding table: ${TABLE_NAME}`);

  for (const t of TENANTS) {
    console.log(`\nSeeding ${t.name} (${t.tenantId})...`);
    const now = new Date().toISOString();
    const pk = `${KEY_PREFIXES.TENANT}${t.tenantId}`;

    const existingMeta = await docClient.send(new GetCommand({ TableName: TABLE_NAME, Key: { PK: pk, SK: 'META' } }));
    const tenantCreatedAt = (existingMeta.Item?.createdAt as string) ?? now;
    await put({ PK: pk, SK: 'META', tenantId: t.tenantId, name: t.name, type: t.type, plan: t.plan, createdAt: tenantCreatedAt, updatedAt: now }, `tenant ${t.name}`);

    const cohortIds: string[] = [];

    for (let i = 0; i < t.cohorts.length; i++) {
      const spec = t.cohorts[i];
      const cohortId = `seed-${t.tenantId}-${spec.district.toLowerCase()}`;
      cohortIds.push(cohortId);
      const coords = DISTRICT_COORDS[spec.district];
      if (!coords) throw new Error(`No coords for ${spec.district}`);

      const sk = `${KEY_PREFIXES.COHORT}${cohortId}`;
      const item: Record<string, unknown> = {
        PK: pk, SK: sk, tenantId: t.tenantId, cohortId, district: spec.district,
        lat: coords.lat, lon: coords.lon, crops: spec.crops, languages: spec.languages,
        nudgeRules: DEFAULT_NUDGE_RULES, status: spec.status, createdAt: now, updatedAt: now,
        activatedAt: spec.status === 'active' ? now : undefined,
      };
      if (spec.status === 'active') {
        item.GSI2PK = KEY_PREFIXES.STATUS_ACTIVE;
        item.GSI2SK = `${KEY_PREFIXES.COHORT}${cohortId}`;
      }
      if (!(await exists(pk, sk))) await put(item, `cohort ${spec.district}`);

      if (spec.status === 'active') {
        const licenseSk = `${KEY_PREFIXES.LICENSE}${cohortId}`;
        if (!(await exists(pk, licenseSk))) {
          await put({
            PK: pk, SK: licenseSk, tenantId: t.tenantId, cohortId,
            stripeSubId: `demo_${cohortId}`, plan: t.plan, status: 'active',
            currentPeriodStart: now, currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
            isDemo: true, createdAt: now, updatedAt: now,
          }, `license ${spec.district}`);
        }

        const summarySk = `${KEY_PREFIXES.SUMMARY}${cohortId}#${PERIOD}`;
        if (!(await exists(pk, summarySk))) {
          const nudgesSent = 12 + i * 4;
          const nudgesCompleted = Math.floor(nudgesSent * (0.55 + i * 0.1));
          const nudgesExpired = Math.floor((nudgesSent - nudgesCompleted) * 0.3);
          await put({
            PK: pk, SK: summarySk, tenantId: t.tenantId, cohortId, period: PERIOD,
            adviceSent: nudgesSent, nudgesSent, nudgesCompleted, nudgesExpired,
            followThroughRate: nudgesCompleted / nudgesSent, byCrop: {}, lastUpdatedAt: now,
          }, `summary ${spec.district}`);
        }
      }
    }

    const activeCohortIds = cohortIds.filter((_, i) => t.cohorts[i].status === 'active');
    for (let fi = 0; fi < t.farmers.length; fi++) {
      const phone = t.farmers[fi];
      const cohortId = activeCohortIds[fi % activeCohortIds.length];
      const phonePk = `${KEY_PREFIXES.PHONE}${phone}`;
      if (!(await exists(phonePk, 'MEMBERSHIP'))) {
        await put({
          PK: phonePk, SK: 'MEMBERSHIP', GSI1PK: `${KEY_PREFIXES.COHORT}${cohortId}`,
          GSI1SK: `MEMBER#${phone}`, phone, tenantId: t.tenantId, cohortId, enrolledAt: now,
        }, `farmer ${phone.slice(-4)}`);
        for (let ni = 0; ni < 4; ni++) {
          const nudgeId = ulid();
          const userPk = `USER#${phone}`;
          const nudgeSk = `NUDGE#${nudgeId}`;
          if (!(await exists(userPk, nudgeSk))) {
            await put({
              PK: userPk, SK: nudgeSk, phone, status: ['DONE', 'DONE', 'EXPIRED', 'PENDING'][ni],
              cohortId, tenantId: t.tenantId, createdAt: now,
            }, `nudge ${phone.slice(-4)} #${ni + 1}`);
          }
        }
      }
    }
  }

  console.log('\nDone. Demo tenants: demo-tenant-001, 002, 003');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
