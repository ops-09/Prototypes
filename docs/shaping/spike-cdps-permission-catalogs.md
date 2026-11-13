---
shaping: true
---

# Spike: CDPS permission catalogs (ministries, permit types, applications)

Parent: [invite-cdps-permissions.md](./invite-cdps-permissions.md) · Breadboard N3 / N4

## Context

Shape A needs catalogs for Create scope (ministry → permit types) and View/Edit scope (existing application instances). The invite prototype today only has mining projects in `src/rbac/services.ts`. Stakeholder source provided a `PERMIT_TYPENAME` × `PERMIT_SHORT_NAME` table and clarified that ministries ≈ permit categories and applications ≈ draft or submitted permits in the org profile.

## Goal

Learn what data we need, what exists in this repo vs what we must mock, and the concrete steps to feed InviteAccess and Runtime create/existing browse.

## Questions

| # | Question |
|---|----------|
| **S1-Q1** | Where (if anywhere) does this codebase already model ministries, CDPS permit types, or org application instances? |
| **S1-Q2** | What fields are required for Create scope pickers (ministry id/label, permit type id/short name, org-eligibility / RBAC org-based flag)? |
| **S1-Q3** | What fields are required for existing applications (id, display name, number, ministry, status draft\|submitted, org profile id)? |
| **S1-Q4** | How should the stakeholder permit table map into mock catalog modules for the prototype? |
| **S1-Q5** | What filter rules enforce “organization-based RBAC only” and “only permits for org applicant type”? |
| **S1-Q6** | What changes are needed so InviteAccess (U8/U9) and Runtime (U17–U20) read the same catalog + grants store? |

## Acceptance

Spike is complete when all questions are answered and we can describe: (1) mock catalog shapes and file locations for the prototype, (2) how Scenario A–D data would be represented, and (3) the steps to wire catalogs into invite draft + runtime filters.

---

## Findings

### S1-Q1 — Existing models in repo

| Area | Finding |
|------|---------|
| RBAC invite | `ServiceAccess` / `SERVICE_GROUPS` — mining projects only; `construction` / `highways` empty project lists; no ministry or application instance types |
| Forms / continuance | Ministry names appear in form copy/PDF contexts, not as an invite permission catalog |
| User management | Stores `serviceAccess` on `BusinessUser`; no permit-application grants |

**Conclusion:** No production CDPS catalog in this prototype. Invite must introduce mock (then API-backed) catalog modules.

### S1-Q2 — Create scope fields

| Field | Purpose |
|-------|---------|
| `ministryId` | Stable key (e.g. `MOF`, `MPBSDP`, `MECP`) |
| `ministryLabel` | Display name for browse |
| `permitTypeId` | Stable id per short name |
| `permitShortName` | Display label (stakeholder `PERMIT_SHORT_NAME`) |
| `orgBasedRbac` | `true` only if eligible for org RBAC assignment |
| `applicantTypes[]` | Optional filter for org applicant type |

Create grant on invite draft:

```ts
// Conceptual — not yet in codebase
createAccess: {
  byMinistry: Record<ministryId, {
    mode: 'all' | 'selected';
    permitTypeIds: string[]; // empty when mode === 'all'
  }>;
}
```

### S1-Q3 — Existing application fields

| Field | Purpose |
|-------|---------|
| `applicationId` | Stable instance id |
| `applicationNumber` | Human number (e.g. `#2456`) |
| `displayName` | e.g. “MECP Wells Contractor Licence Application #2456” |
| `ministryId` | Browse/filter |
| `permitTypeId` | Link to type |
| `status` | `draft` \| `submitted` (Scenario B) |
| `organizationId` | Org profile scope |

View/Edit grants:

```ts
viewApplicationIds: string[];
editApplicationIds: string[]; // edit implies view at runtime
```

### S1-Q4 — Mapping stakeholder table → mocks

1. Add `src/rbac/cdpsPermitCatalog.ts` (or `src/data/cdps/`) exporting:
   - `CDPS_MINISTRIES` derived from distinct `PERMIT_TYPENAME`
   - `CDPS_PERMIT_TYPES[]` from each table row (`ministryId` + `permitShortName` + generated `permitTypeId`)
2. Seed `orgBasedRbac: true` for all rows in the stakeholder list until product marks exclusions.
3. Add `src/rbac/cdpsApplicationFixtures.ts` with ~8–12 fake instances across MOF / MPBSDP / MECP (mix of draft + submitted) for U9 / Scenario B/D.

### S1-Q5 — Eligibility filter rules

Prototype rules (until API exists):

1. Include only types with `orgBasedRbac === true`.
2. If org has `applicantType`, include types where `applicantTypes` is empty **or** contains that type.
3. Individual-facing types stay out of the mock file (or flagged `orgBasedRbac: false` and filtered out).
4. Mining projects never appear in CDPS permit catalogs (R7).

### S1-Q6 — Shared read path for invite + runtime

| Step | Action |
|------|--------|
| 1 | Publish catalogs via pure getters (`listEligiblePermitTypes(org)`, `listOrgApplications(org)`) |
| 2 | Persist `permitApplicationAccess` on invite alongside `serviceAccess` |
| 3 | On invite success, copy grants onto `BusinessUser` (or session mock) |
| 4 | Runtime create page: `listEligiblePermitTypes` ∩ create grants |
| 5 | Runtime existing page: `listOrgApplications` ∩ view/edit id sets |
| 6 | Search helpers: filter by ministry label, short name, application number/name (shared util) |

---

## Concrete next steps (prototype)

1. Add mock catalog + fixtures modules from the stakeholder table.
2. Extend RBAC types with `permitApplicationAccess`.
3. Wire InviteAccess U8/U9 to getters; wire Runtime create/existing stubs to the same getters + stored grants.
4. Replace mocks with API adapters without changing affordance IDs (N3/N4).

---

## Spike status

| Question | Answered |
|----------|:--------:|
| S1-Q1 | ✅ |
| S1-Q2 | ✅ |
| S1-Q3 | ✅ |
| S1-Q4 | ✅ |
| S1-Q5 | ✅ |
| S1-Q6 | ✅ |

Acceptance met for shaping: catalogs can be mocked in-repo; Scenario A–D representations are defined; wiring steps for invite + runtime are listed.
