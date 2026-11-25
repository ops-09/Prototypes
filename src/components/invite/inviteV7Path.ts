import { roleSkipsServiceAccess } from '../../rbac/roles';
import type { RoleId } from '../../rbac/types';
import { INVITE_REVIEW_STEP_TITLE } from './inviteWizardContent';
import type { InviteV4PathOptions } from './inviteV4Path';

export type InviteV7LogicalStep =
  | 'email'
  | 'role'
  | 'accessNeeds'
  | 'permissions'
  | 'review';

export type InviteV7PathOptions = InviteV4PathOptions;

export type PermissionsTabId = 'mining' | 'create' | 'existing';

/**
 * V7–V12: all three tabs.
 * V13 access needs: `create_permits` (Permits and licences) → New + Existing;
 * `mining_projects` → Mining. Both selected → all three.
 */
export function getPermissionsTabs(accessNeedIds?: string[]): PermissionsTabId[] {
  const allTabs: PermissionsTabId[] = ['create', 'existing', 'mining'];
  if (!accessNeedIds || accessNeedIds.length === 0) {
    return allTabs;
  }

  const tabs: PermissionsTabId[] = [];
  const wantsPermits = accessNeedIds.includes('create_permits');
  const wantsMining = accessNeedIds.includes('mining_projects');

  if (wantsPermits) {
    tabs.push('create', 'existing');
  }
  if (wantsMining) {
    tabs.push('mining');
  }

  return tabs.length > 0 ? tabs : allTabs;
}

export function getInviteV7Path({
  roleId = '',
  includeAccessNeeds = false,
}: InviteV7PathOptions = {}): InviteV7LogicalStep[] {
  if (roleId && roleSkipsServiceAccess(roleId)) {
    return ['email', 'role', 'review'];
  }

  // No separate domain-gates step — permissions tabs cover mining + permits.
  if (includeAccessNeeds) {
    return ['email', 'role', 'accessNeeds', 'permissions', 'review'];
  }

  return ['email', 'role', 'permissions', 'review'];
}

export function getInviteV7StepCount(options: InviteV7PathOptions = {}) {
  return getInviteV7Path(options).length;
}

export function getInviteV7LogicalStep(
  displayStep: number,
  options: InviteV7PathOptions = {},
): InviteV7LogicalStep {
  const path = getInviteV7Path(options);
  const index = Math.min(Math.max(displayStep, 1), path.length) - 1;
  return path[index] ?? 'email';
}

export function getInviteV7DisplayStep(
  logicalStep: InviteV7LogicalStep,
  options: InviteV7PathOptions = {},
): number {
  const path = getInviteV7Path(options);
  const index = path.indexOf(logicalStep);
  if (index === -1) {
    if (logicalStep === 'permissions') {
      return path.indexOf('review') + 1;
    }
    return 1;
  }
  return index + 1;
}

export function getInviteV7StepTitle(logicalStep: InviteV7LogicalStep): string {
  switch (logicalStep) {
    case 'email':
      return 'User details';
    case 'role':
      return 'Assign role';
    case 'accessNeeds':
      return 'Access needs';
    case 'permissions':
      return 'Permissions';
    case 'review':
      return INVITE_REVIEW_STEP_TITLE;
    default:
      return 'Invite';
  }
}

export function getInviteV7NextStepLabel(
  displayStep: number,
  options: InviteV7PathOptions = {},
): string | null {
  const path = getInviteV7Path(options);
  if (displayStep >= path.length) {
    return null;
  }

  const nextLogical = path[displayStep];
  if (!nextLogical) {
    return null;
  }

  if (nextLogical === 'review') {
    return `Next: ${INVITE_REVIEW_STEP_TITLE}`;
  }

  return `Next: ${getInviteV7StepTitle(nextLogical)}`;
}

export function getInviteV7BackStepLabel(
  displayStep: number,
  options: InviteV7PathOptions = {},
): string | null {
  if (displayStep <= 1) {
    return null;
  }

  const path = getInviteV7Path(options);
  const previousLogical = path[displayStep - 2];
  if (!previousLogical) {
    return null;
  }

  return `Back: ${getInviteV7StepTitle(previousLogical)}`;
}

export type InviteDynamicLogicalStep =
  | import('./inviteV4Path').InviteV4LogicalStep
  | InviteV7LogicalStep;
