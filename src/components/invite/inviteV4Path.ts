import { roleSkipsServiceAccess } from '../../rbac/roles';
import type { RoleId, ServiceAccess } from '../../rbac/types';
import type { PermitApplicationAccess } from '../../rbac/types';
import { INVITE_REVIEW_STEP_TITLE } from './inviteWizardContent';

export type InviteV4LogicalStep =
  | 'email'
  | 'role'
  | 'domains'
  | 'mining'
  | 'permits'
  | 'review';

export type InviteV4PathOptions = {
  roleId?: RoleId | '';
  miningOn?: boolean;
  permitsOn?: boolean;
};

export function isMiningDomainOn(serviceAccess: ServiceAccess) {
  return serviceAccess.services.mining.enabled;
}

export function isPermitsDomainOn(permitAccess: PermitApplicationAccess) {
  return permitAccess.enabled;
}

export function getInviteV4Path({
  roleId = '',
  miningOn = false,
  permitsOn = false,
}: InviteV4PathOptions = {}): InviteV4LogicalStep[] {
  if (roleId && roleSkipsServiceAccess(roleId)) {
    return ['email', 'role', 'review'];
  }

  const path: InviteV4LogicalStep[] = ['email', 'role', 'domains'];

  if (miningOn) {
    path.push('mining');
  }

  if (permitsOn) {
    path.push('permits');
  }

  path.push('review');
  return path;
}

export function getInviteV4StepCount(options: InviteV4PathOptions = {}) {
  return getInviteV4Path(options).length;
}

export function getInviteV4LogicalStep(
  displayStep: number,
  options: InviteV4PathOptions = {},
): InviteV4LogicalStep {
  const path = getInviteV4Path(options);
  const index = Math.min(Math.max(displayStep, 1), path.length) - 1;
  return path[index] ?? 'email';
}

export function getInviteV4DisplayStep(
  logicalStep: InviteV4LogicalStep,
  options: InviteV4PathOptions = {},
): number {
  const path = getInviteV4Path(options);
  const index = path.indexOf(logicalStep);
  if (index === -1) {
    // Domain turned off while on that step — land on review or domains.
    if (logicalStep === 'mining' || logicalStep === 'permits') {
      return path.indexOf('review') + 1;
    }
    return 1;
  }
  return index + 1;
}

export function getInviteV4StepTitle(logicalStep: InviteV4LogicalStep): string {
  switch (logicalStep) {
    case 'email':
      return 'User details';
    case 'role':
      return 'Assign role';
    case 'domains':
      return 'Choose access domains';
    case 'mining':
      return 'Mining Projects';
    case 'permits':
      return 'Permit Applications';
    case 'review':
      return INVITE_REVIEW_STEP_TITLE;
    default:
      return 'Invite';
  }
}

export function getInviteV4NextStepLabel(
  displayStep: number,
  options: InviteV4PathOptions = {},
): string | null {
  const path = getInviteV4Path(options);
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

  return `Next: ${getInviteV4StepTitle(nextLogical)}`;
}

export function getInviteV4BackStepLabel(
  displayStep: number,
  options: InviteV4PathOptions = {},
): string | null {
  if (displayStep <= 1) {
    return null;
  }

  const path = getInviteV4Path(options);
  const previousLogical = path[displayStep - 2];
  if (!previousLogical) {
    return null;
  }

  return `Back: ${getInviteV4StepTitle(previousLogical)}`;
}

/** Map Review "Change" targets to a V4 logical step. */
export function inviteV4LogicalFromLegacyEdit(
  legacyStep: number,
  options: InviteV4PathOptions,
): InviteV4LogicalStep {
  if (legacyStep <= 1) {
    return 'email';
  }
  if (legacyStep === 2) {
    return 'role';
  }

  // Access edits: prefer the domain that is on; if both, mining first for "service" edits.
  if (options.miningOn) {
    return 'mining';
  }
  if (options.permitsOn) {
    return 'permits';
  }
  return 'domains';
}
