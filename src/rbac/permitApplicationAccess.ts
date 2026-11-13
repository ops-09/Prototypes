import {
  filterApplications,
  filterPermitTypes,
  getApplicationById,
  getMinistryLabel,
  getPermitTypeById,
  listEligiblePermitTypes,
  listMinistriesWithEligiblePermits,
  listOrgApplications,
  listPermitTypesByMinistry,
  type CdpsApplication,
  type CdpsMinistryId,
  type CdpsPermitType,
} from './cdpsPermitCatalog';
import type {
  PermitApplicationAccess,
  PermitMinistryCreateScope,
} from './types';

export const DEFAULT_PERMIT_APPLICATION_ACCESS: PermitApplicationAccess = {
  enabled: false,
  create: {
    enabled: false,
    byMinistry: {},
  },
  view: {
    enabled: false,
    applicationIds: [],
  },
  edit: {
    enabled: false,
    applicationIds: [],
  },
};

export function createDefaultPermitApplicationAccess(): PermitApplicationAccess {
  return structuredClone(DEFAULT_PERMIT_APPLICATION_ACCESS);
}

export function hasConfiguredCreateScope(access: PermitApplicationAccess): boolean {
  if (!access.create.enabled) {
    return false;
  }

  return Object.values(access.create.byMinistry).some((scope) => {
    if (!scope) {
      return false;
    }
    if (scope.mode === 'all') {
      return true;
    }
    return scope.permitTypeIds.length > 0;
  });
}

export function hasConfiguredViewScope(access: PermitApplicationAccess): boolean {
  return access.view.enabled && access.view.applicationIds.length > 0;
}

export function hasConfiguredEditScope(access: PermitApplicationAccess): boolean {
  return access.edit.enabled && access.edit.applicationIds.length > 0;
}

/** True when Permit Applications domain is on and at least one action has grants. */
export function hasConfiguredPermitApplicationAccess(
  access: PermitApplicationAccess,
): boolean {
  if (!access.enabled) {
    return false;
  }

  return (
    hasConfiguredCreateScope(access) ||
    hasConfiguredViewScope(access) ||
    hasConfiguredEditScope(access)
  );
}

export function summarizePermitApplicationAccess(
  access: PermitApplicationAccess | undefined,
): string {
  if (!access?.enabled) {
    return 'No permit application access';
  }

  const parts: string[] = [];

  if (hasConfiguredCreateScope(access)) {
    const ministryCount = Object.keys(access.create.byMinistry).length;
    parts.push(`Create (${ministryCount} ministries)`);
  }

  if (hasConfiguredViewScope(access)) {
    parts.push(`View (${access.view.applicationIds.length})`);
  }

  if (hasConfiguredEditScope(access)) {
    parts.push(`Edit (${access.edit.applicationIds.length})`);
  }

  return parts.length > 0 ? parts.join(' · ') : 'Permit Applications (no grants)';
}

function canCreatePermitType(
  access: PermitApplicationAccess,
  permit: CdpsPermitType,
): boolean {
  if (!access.enabled || !access.create.enabled) {
    return false;
  }

  const scope = access.create.byMinistry[permit.ministryId];
  if (!scope) {
    return false;
  }

  if (scope.mode === 'all') {
    return true;
  }

  return scope.permitTypeIds.includes(permit.permitTypeId);
}

/** Runtime create browse: eligible permit types within create grants. */
export function listCreateBrowsePermitTypes(
  access: PermitApplicationAccess | undefined,
  query = '',
  ministryId?: CdpsMinistryId,
): CdpsPermitType[] {
  if (!access?.enabled || !access.create.enabled) {
    return [];
  }

  return filterPermitTypes(query, ministryId).filter((permit) =>
    canCreatePermitType(access, permit),
  );
}

/** Runtime create browse: ministries that have at least one creatable permit type. */
export function listCreateBrowseMinistries(access: PermitApplicationAccess | undefined) {
  if (!access?.enabled || !access.create.enabled) {
    return [];
  }

  return listMinistriesWithEligiblePermits().filter((ministry) => {
    const scope = access.create.byMinistry[ministry.ministryId];
    if (!scope) {
      return false;
    }
    if (scope.mode === 'all') {
      return listPermitTypesByMinistry(ministry.ministryId).length > 0;
    }
    return scope.permitTypeIds.length > 0;
  });
}

function applicationGrantIds(access: PermitApplicationAccess): Set<string> {
  const ids = new Set<string>();
  if (access.view.enabled) {
    for (const id of access.view.applicationIds) {
      ids.add(id);
    }
  }
  if (access.edit.enabled) {
    for (const id of access.edit.applicationIds) {
      ids.add(id);
    }
  }
  return ids;
}

export function getApplicationAccessLevel(
  access: PermitApplicationAccess | undefined,
  applicationId: string,
): 'none' | 'view' | 'edit' {
  if (!access?.enabled) {
    return 'none';
  }

  if (access.edit.enabled && access.edit.applicationIds.includes(applicationId)) {
    return 'edit';
  }

  if (access.view.enabled && access.view.applicationIds.includes(applicationId)) {
    return 'view';
  }

  return 'none';
}

/** Runtime existing browse: org applications filtered by view/edit grants. */
export function listExistingBrowseApplications(
  access: PermitApplicationAccess | undefined,
  query = '',
  organizationId?: string,
): Array<CdpsApplication & { accessLevel: 'view' | 'edit' }> {
  if (!access?.enabled) {
    return [];
  }

  const grantIds = applicationGrantIds(access);
  if (grantIds.size === 0) {
    return [];
  }

  const apps = filterApplications(query, listOrgApplications(organizationId)).flatMap(
    (app) => {
      if (!grantIds.has(app.applicationId)) {
        return [];
      }

      const accessLevel = getApplicationAccessLevel(access, app.applicationId);
      if (accessLevel === 'none') {
        return [];
      }

      return [{ ...app, accessLevel }];
    },
  );

  return apps;
}

export function describeCreateMinistryScope(
  ministryId: string,
  scope: PermitMinistryCreateScope | undefined,
): string {
  const label = getMinistryLabel(ministryId as CdpsMinistryId);
  if (!scope) {
    return label;
  }

  if (scope.mode === 'all') {
    return `${label} — all permit types`;
  }

  const names = scope.permitTypeIds
    .map((id) => getPermitTypeById(id)?.permitShortName ?? id)
    .filter(Boolean);

  if (names.length === 0) {
    return `${label} — no permit types selected`;
  }

  return `${label} — ${names.join('; ')}`;
}

export function describeApplicationGrant(applicationId: string): string {
  const app = getApplicationById(applicationId);
  if (!app) {
    return applicationId;
  }

  return `${app.displayName} (${app.status})`;
}

export function listAllEligiblePermitTypeIds(): string[] {
  return listEligiblePermitTypes().map((permit) => permit.permitTypeId);
}
