import { listUsers } from './rbacService';
import type { PermitApplicationAccess } from './types';

const DEMO_SESSION_USER_KEY = 'ops-rbac:demo-runtime-user-id';

/** Scenario A + B sample grants for runtime stubs without a prior invite. */
export const SCENARIO_DEMO_PERMIT_ACCESS: PermitApplicationAccess = {
  enabled: true,
  create: {
    enabled: true,
    byMinistry: {
      MPBSDP: { mode: 'all', permitTypeIds: [] },
      MOF: {
        mode: 'selected',
        permitTypeIds: [
          'mof-tobacco-retailer-dealer-s-permit',
          'mof-international-fuel-tax-agreement-licence',
        ],
      },
    },
  },
  view: {
    enabled: true,
    applicationIds: ['app-mecp-2456', 'app-mecp-2458', 'app-mof-3101'],
  },
  edit: {
    enabled: true,
    applicationIds: ['app-mecp-2456', 'app-mpbsdp-4401'],
  },
};

export function getDemoRuntimeUserId(): string | null {
  if (typeof sessionStorage === 'undefined') {
    return null;
  }
  return sessionStorage.getItem(DEMO_SESSION_USER_KEY);
}

export function setDemoRuntimeUserId(userId: string | null) {
  if (typeof sessionStorage === 'undefined') {
    return;
  }
  if (!userId) {
    sessionStorage.removeItem(DEMO_SESSION_USER_KEY);
    return;
  }
  sessionStorage.setItem(DEMO_SESSION_USER_KEY, userId);
}

export function resolveDemoPermitAccess(): {
  access: PermitApplicationAccess;
  sourceLabel: string;
} {
  const selectedId = getDemoRuntimeUserId();
  if (selectedId) {
    const user = listUsers().find((entry) => entry.id === selectedId);
    if (user?.permitApplicationAccess) {
      return {
        access: structuredClone(user.permitApplicationAccess),
        sourceLabel: `${user.email} (invited user grants)`,
      };
    }
  }

  const invitedWithGrants = listUsers().find(
    (user) => user.status === 'invited' && user.permitApplicationAccess?.enabled,
  );
  if (invitedWithGrants?.permitApplicationAccess) {
    return {
      access: structuredClone(invitedWithGrants.permitApplicationAccess),
      sourceLabel: `${invitedWithGrants.email} (latest invited grants)`,
    };
  }

  return {
    access: structuredClone(SCENARIO_DEMO_PERMIT_ACCESS),
    sourceLabel: 'Scenario A/B demo grants',
  };
}
