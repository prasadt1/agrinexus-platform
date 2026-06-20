# Delivery Engine Validation Report

> **Purpose:** Validate existing agrinexus-ai architecture against the multi-tenant B2B platform requirements in H0-AgriNexus-Platform-Build-Spec.md §13.
> **Date:** 2026-06-20
> **Scope:** Read-only analysis; no code modifications.

---

## Executive Summary

| Question | Finding |
|----------|---------|
| 1. WeatherPoller district selection | **Hardcoded** — 3 districts in `DISTRICT_COORDS` dict |
| 2. Nudge/Step Functions scope | **District-scoped** — one execution per location |
| 3. Farmer → district attribution | **Yes** — `location` field + `GSI1PK = LOCATION#{district}` |
| 4. Existing district GSI | **Yes** — GSI1 already supports cohort attribution |
| 5. Blast radius for cohort-driven polling | **Low** — 2 files + template.yaml; can isolate in separate stack |

**Bottom line:** The architecture is well-prepared for cohort-driven delivery. The main gap is the hardcoded district list in `WeatherPoller`. The nudge flow is already location-parameterized, and GSI1 enables efficient farmer-by-district queries.

---

## 1. How does the WeatherPoller pick which districts to check?

### Finding: **Hardcoded list of 3 Indian districts**

**File:** `agrinexus-ai/src/weather/handler.py` (lines 49-53)

```python
DISTRICT_COORDS = {
    'Latur': {'lat': 18.4088, 'lon': 76.5604},
    'Jalna': {'lat': 19.8347, 'lon': 75.8816},
    'Nagpur': {'lat': 21.1458, 'lon': 79.0882},
}
```

The `get_unique_locations()` function (lines 56-78) does query DynamoDB to confirm which districts have active farmers, but it **only checks districts present in the hardcoded dict**:

```python
def get_unique_locations() -> List[str]:
    """
    Get unique locations from user profiles.
    Uses GSI1 query instead of full table scan to reduce DynamoDB costs.
    GSI1PK is set to LOCATION#{location} for all user profiles.
    """
    locations = set()
    for district in DISTRICT_COORDS.keys():  # <-- Iterates hardcoded keys only
        try:
            response = table.query(
                IndexName='GSI1',
                KeyConditionExpression='GSI1PK = :pk',
                ExpressionAttributeValues={':pk': f'LOCATION#{district}'},
                Limit=1
            )
            if response.get('Items'):
                locations.add(district)
        except Exception as e:
            print(f"Error querying GSI1 for {district}: {e}")
            locations.add(district)
    return list(locations)
```

### Implication for Platform Build

A partner provisioning a cohort for district "Pune" would never receive weather checks or nudges because "Pune" is not in `DISTRICT_COORDS`. The §13 design (WeatherPoller reads active cohorts from GSI2) directly addresses this gap.

---

## 2. Is the nudge / Step Functions flow district-scoped, or one global run?

### Finding: **District-scoped** — one Step Functions execution per location

**Trigger:** `agrinexus-ai/src/weather/handler.py` (lines 184-191)

When favorable spray conditions are detected, WeatherPoller triggers a **separate** Step Functions execution for each location:

```python
stepfunctions.start_execution(
    stateMachineArn=STATE_MACHINE_ARN,
    input=json.dumps({
        'location': location,      # <-- Location passed as parameter
        'weather': weather,
        'activity': 'spray'
    })
)
```

**State Machine:** `agrinexus-ai/statemachine/nudge-workflow.asl.json` (lines 1-72)

```json
{
  "Comment": "Nudge workflow: Send nudge to farmers and schedule follow-up reminders",
  "StartAt": "SendNudgeToFarmers",
  "States": {
    "SendNudgeToFarmers": {
      "Type": "Task",
      "Resource": "${NudgeSenderArn}",
      "Parameters": {
        "location.$": "$.location",
        "weather.$": "$.weather",
        "activity.$": "$.activity"
      },
      ...
    }
  }
}
```

**NudgeSender:** `agrinexus-ai/src/nudge/sender.py` (lines 199-206)

The sender queries farmers scoped to the passed location:

```python
response = table.query(
    IndexName='GSI1',
    KeyConditionExpression='GSI1PK = :location',
    ExpressionAttributeValues={
        ':location': f'LOCATION#{location}'
    }
)
farmers = response.get('Items', [])
print(f"Found {len(farmers)} farmers in {location}")
```

### Implication for Platform Build

This is good news. The nudge flow is already parameterized by location. No structural changes needed to the Step Functions or NudgeSender — only the **source of locations** in WeatherPoller needs to change (from hardcoded → DynamoDB query).

---

## 3. How are farmers attributed to a district? Can records be grouped by district?

### Finding: **Yes** — `location` field stored on profile with GSI1 for efficient queries

**File:** `agrinexus-ai/src/processor/handler.py` (lines 285-305)

During onboarding, a farmer's district is captured and indexed:

```python
def create_user_profile(phone_number: str, dialect: str, location: str, crop: str, consent: bool):
    """Create complete user profile"""
    coords = DISTRICT_COORDS.get(location)
    table.put_item(
        Item={
            'PK': f'USER#{phone_number}',
            'SK': 'PROFILE',
            'phone_number': phone_number,
            'dialect': dialect,
            'location': location,              # <-- Plain-text district name
            'location_coords': list(coords) if coords else None,
            'crop': crop,
            'consent': consent,
            'onboarding_complete': True,
            'created_at': datetime.utcnow().isoformat(),
            'GSI1PK': f'LOCATION#{location}',  # <-- Enables efficient district queries
            'GSI1SK': f'CROP#{crop}',          # <-- Secondary filter by crop
            'demo_tier': 'public',
        }
    )
```

### Key Attributes for Cohort Attribution

| Attribute | Value Example | Purpose |
|-----------|---------------|---------|
| `location` | `"Latur"` | Human-readable district name |
| `GSI1PK` | `"LOCATION#Latur"` | Partition key for GSI1 queries |
| `GSI1SK` | `"CROP#Cotton"` | Sort key for crop filtering |

### Implication for Platform Build

Farmer → cohort attribution via district mapping (§4 of the spec) is already supported. The aggregator Lambda can group interactions by `location` and roll them up to the matching cohort.

---

## 4. Does the single-table schema already have a district attribute or GSI usable for cohort attribution?

### Finding: **Yes** — GSI1 already supports district-based queries

**Schema Documentation:** `agrinexus-ai/docs/architecture.md` (lines 191-262)

**Table Structure:**

```
Table Name: agrinexus-data
Billing Mode: On-Demand (PAY_PER_REQUEST)
Partition Key: PK (String)
Sort Key: SK (String)
```

**Global Secondary Indexes:**

| Index | PK | SK | Purpose |
|-------|----|----|---------|
| **GSI1** | `GSI1PK` (e.g., `LOCATION#Latur`) | `GSI1SK` (e.g., `CROP#Cotton`) | Query farmers by district/crop |
| **GSI2** | `GSI2PK` (e.g., `NUDGE`) | `GSI2SK` (timestamp) | Operational nudge queries |

**Entity Patterns (from code analysis):**

1. **User Profile:**
   ```
   PK: USER#+919876543210
   SK: PROFILE
   GSI1PK: LOCATION#{location}
   GSI1SK: CROP#{crop}
   ```

2. **Nudge Records:**
   ```
   PK: USER#+919876543210
   SK: NUDGE#{timestamp}#{activity}
   district: {location value}
   GSI2PK: NUDGE
   GSI2SK: {timestamp}
   ```

### Implication for Platform Build

GSI1 is **directly usable** for cohort attribution. The spec's proposed GSI1 design (`GSI1PK = DISTRICT#<district>`) aligns with the existing pattern (`GSI1PK = LOCATION#<district>`). Minor naming difference only.

**Net-new for the platform:**
- GSI2 repurposing or a new index for `STATUS#active` cohort queries
- New entity types: `TENANT#`, `COHORT#`, `LICENSE#`, `SUMMARY#`

---

## 5. Blast radius of changing WeatherPoller to read active cohorts from DynamoDB

### Finding: **Low blast radius** — 2 source files + infrastructure template

### Files Requiring Modification

| File | Lines | Change Required |
|------|-------|-----------------|
| `src/weather/handler.py` | 49-78 | Replace `DISTRICT_COORDS` with DynamoDB cohort query |
| `src/processor/handler.py` | 216-220 | Move `DISTRICT_COORDS` to shared config (for onboarding validation) |
| `template.yaml` | 578-609 | Add IAM permissions for cohort table reads |

### Files That Do NOT Require Changes

| File | Reason |
|------|--------|
| `src/nudge/sender.py` | Already location-agnostic via parameter |
| `statemachine/nudge-workflow.asl.json` | Location passed as input; no hardcoding |
| `src/nudge/reminder.py` | Reads nudge records; doesn't select districts |
| `src/nudge/detector.py` | Processes Streams; no district logic |

### Detailed Code Impact

**1. `src/weather/handler.py`** — Primary change

Current (hardcoded):
```python
DISTRICT_COORDS = {
    'Latur': {'lat': 18.4088, 'lon': 76.5604},
    'Jalna': {'lat': 19.8347, 'lon': 75.8816},
    'Nagpur': {'lat': 21.1458, 'lon': 79.0882},
}
```

Target (data-driven):
```python
def get_active_cohort_districts() -> List[dict]:
    """
    Query active cohorts from DynamoDB using GSI2.
    Returns list of {district, lat, lon} for weather polling.
    """
    response = table.query(
        IndexName='GSI2',
        KeyConditionExpression='GSI2PK = :status',
        ExpressionAttributeValues={':status': 'STATUS#active'}
    )
    return [
        {'district': item['district'], 'lat': item['lat'], 'lon': item['lon']}
        for item in response.get('Items', [])
    ]
```

**2. `src/processor/handler.py`** — Onboarding validation

Current (hardcoded):
```python
DISTRICT_COORDS = {
    'Latur': {'lat': 18.4088, 'lon': 76.5604},
    ...
}
```

Options:
- Move to shared config file in common-layer
- Or query DynamoDB for valid districts during onboarding

**3. `template.yaml`** — IAM permissions

Add to `WeatherPoller` Lambda's policy:
```yaml
- Effect: Allow
  Action:
    - dynamodb:Query
  Resource:
    - !Sub "arn:aws:dynamodb:${AWS::Region}:${AWS::AccountId}:table/${TableName}/index/GSI2"
```

### Can it live in a separate stack without touching production?

**Yes.** Recommended approach:

1. **New stack:** `agrinexus-platform-stack`
   - Defines new entity types (TENANT#, COHORT#, etc.)
   - Adds GSI2 definition for `STATUS#active` queries
   - Contains modified WeatherPoller that reads from cohorts

2. **Isolation strategy:**
   - Deploy to separate AWS account or use resource prefixes
   - Production (AIdeas demo) continues using existing hardcoded WeatherPoller
   - Platform stack uses cohort-driven WeatherPoller

3. **Shared resources:**
   - Both stacks can read/write to same DynamoDB table (if desired)
   - Or platform stack uses its own table copy

**Risk mitigation:**
- Environment variable `COHORT_MODE=dynamic|static` to toggle behavior
- Feature flag for gradual rollout

---

## Appendix: Architecture Diagram (Current State)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DELIVERY ENGINE                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐     ┌─────────────────┐     ┌──────────────────┐ │
│  │ WeatherPoller│────▶│ Step Functions  │────▶│   NudgeSender    │ │
│  │  (EventBridge│     │ (per location)  │     │ (queries GSI1)   │ │
│  │   Schedule)  │     └─────────────────┘     └──────────────────┘ │
│  └──────────────┘                                      │            │
│         │                                              │            │
│         │ Hardcoded:                                   │            │
│         │ Latur, Jalna, Nagpur                         ▼            │
│         │                                    ┌──────────────────┐   │
│         │                                    │    WhatsApp      │   │
│         │                                    │   (via Meta)     │   │
│         │                                    └──────────────────┘   │
│         │                                              │            │
│         ▼                                              ▼            │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                      DynamoDB                                │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────────┐ │   │
│  │  │ USER#   │  │ MSG#    │  │ NUDGE#  │  │ GSI1: LOCATION# │ │   │
│  │  │ profiles│  │ convos  │  │ records │  │ GSI2: NUDGE     │ │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Appendix: Key Source Files Reference

| Component | File Path | Key Lines |
|-----------|-----------|-----------|
| WeatherPoller | `src/weather/handler.py` | 49-78, 184-191 |
| NudgeSender | `src/nudge/sender.py` | 199-206 |
| Step Functions | `statemachine/nudge-workflow.asl.json` | 1-72 |
| Farmer Profiles | `src/processor/handler.py` | 285-305 |
| Architecture Docs | `docs/architecture.md` | 191-262 |
| CDK/SAM Template | `template.yaml` | 578-609 |

---

## Recommendation

Proceed with the §13 design:

1. **Add cohort entities** to DynamoDB (TENANT#, COHORT#, LICENSE#, SUMMARY#)
2. **Add GSI2 index** for `STATUS#active` cohort queries
3. **Modify WeatherPoller** to read districts from active cohorts instead of hardcoded dict
4. **Deploy as separate stack** to isolate from production AIdeas demo

The existing architecture is well-suited for this evolution. The blast radius is contained, and the nudge flow's location-parameterized design means most components require no changes.
