import type { InviteWizardVersion } from '../../config/inviteWizardVersion';
import { roleSkipsServiceAccess } from '../../rbac/roles';
import type { InviteStep, RoleId } from '../../rbac/types';

export const INVITE_STEP_COUNT_V1 = 4;
export const INVITE_STEP_COUNT_V2 = 5;
export const INVITE_STEP_COUNT = INVITE_STEP_COUNT_V2;

export function getInviteStepCount(
  version: InviteWizardVersion,
  roleId: RoleId | '' = '',
): number {
  if (roleId && roleSkipsServiceAccess(roleId)) {
    return 3;
  }

  return version === 'v1' ? INVITE_STEP_COUNT_V1 : INVITE_STEP_COUNT_V2;
}

export function getInviteReviewStep(version: InviteWizardVersion): InviteStep {
  return version === 'v1' ? 4 : 5;
}

export function getInviteDisplayStep(
  currentStep: InviteStep,
  version: InviteWizardVersion,
  roleId: RoleId | '',
): number {
  const reviewStep = getInviteReviewStep(version);

  if (roleId && roleSkipsServiceAccess(roleId) && currentStep === reviewStep) {
    return 3;
  }

  return currentStep;
}

export function formatInviteStepTitle(title: string) {
  return title;
}

export const INVITE_REVIEW_STEP_TITLE = 'Review & confirm';

export function formatInviteNextStepLabel(stepTitle: string) {
  return `Next: ${stepTitle}`;
}

export function formatInviteBackStepLabel(stepTitle: string) {
  return `Back: ${stepTitle}`;
}

export function getInvitePreviousStepTitle(
  version: InviteWizardVersion,
  currentStep: InviteStep,
  reviewStep: InviteStep,
  roleId: RoleId | '',
): string | null {
  if (currentStep === reviewStep) {
    if (roleId && roleSkipsServiceAccess(roleId)) {
      return 'Assign a role';
    }

    return version === 'v1' ? 'Service access' : 'Service permissions';
  }

  switch (currentStep) {
    case 2:
      return 'User details';
    case 3:
      return 'Assign a role';
    case 4:
      return version === 'v2' ? 'Provision services' : null;
    case 5:
      return 'Service permissions';
    default:
      return null;
  }
}

export function getInviteBackStepLabel(
  version: InviteWizardVersion,
  currentStep: InviteStep,
  reviewStep: InviteStep,
  roleId: RoleId | '',
): string | null {
  const previousStepTitle = getInvitePreviousStepTitle(version, currentStep, reviewStep, roleId);
  return previousStepTitle ? formatInviteBackStepLabel(previousStepTitle) : null;
}

export function getInviteNextStepLabel(
  version: InviteWizardVersion,
  currentStep: InviteStep,
  roleId: RoleId | '',
): string | null {
  switch (currentStep) {
    case 1:
      return formatInviteNextStepLabel('Assign a role');
    case 2:
      if (roleId && roleSkipsServiceAccess(roleId)) {
        return formatInviteNextStepLabel('Review');
      }

      if (roleId === 'delegate') {
        return formatInviteNextStepLabel('Assign permissions');
      }

      return formatInviteNextStepLabel(
        version === 'v1' ? 'Service access' : 'Provision services',
      );
    case 3:
      return formatInviteNextStepLabel(
        version === 'v1' ? INVITE_REVIEW_STEP_TITLE : 'Service permissions',
      );
    case 4:
      return version === 'v2' ? formatInviteNextStepLabel(INVITE_REVIEW_STEP_TITLE) : null;
    default:
      return null;
  }
}

export function getInviteProgressLabel(
  currentStep: InviteStep,
  totalSteps = INVITE_STEP_COUNT,
) {
  const completedPercent = Math.round(((currentStep - 1) / totalSteps) * 100);

  if (completedPercent === 0) {
    return 'Not started';
  }

  return `${completedPercent} percent complete`;
}
