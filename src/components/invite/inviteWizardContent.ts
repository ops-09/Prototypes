import {
  usesV2InviteSteps,
  usesV4InviteSteps,
  type InviteWizardVersion,
} from '../../config/inviteWizardVersion';
import { roleSkipsServiceAccess } from '../../rbac/roles';
import type { InviteStep, RoleId } from '../../rbac/types';
import {
  getInviteV4BackStepLabel,
  getInviteV4NextStepLabel,
  getInviteV4Path,
  getInviteV4StepCount,
  getInviteV4StepTitle,
  type InviteV4PathOptions,
} from './inviteV4Path';

export const INVITE_STEP_COUNT_V1 = 4;
export const INVITE_STEP_COUNT_V2 = 5;
export const INVITE_STEP_COUNT_V3 = 4;
export const INVITE_STEP_COUNT = INVITE_STEP_COUNT_V2;

export type InviteStepCountOptions = InviteV4PathOptions;

export function getInviteStepCount(
  version: InviteWizardVersion,
  roleId: RoleId | '' = '',
  options: InviteStepCountOptions = {},
): number {
  if (roleId && roleSkipsServiceAccess(roleId)) {
    return 3;
  }

  if (usesV4InviteSteps(version)) {
    return getInviteV4StepCount({ ...options, roleId });
  }

  if (usesV2InviteSteps(version)) {
    return INVITE_STEP_COUNT_V2;
  }

  if (version === 'v3') {
    return INVITE_STEP_COUNT_V3;
  }

  return INVITE_STEP_COUNT_V1;
}

export function getInviteReviewStep(
  version: InviteWizardVersion,
  options: InviteStepCountOptions = {},
): InviteStep {
  if (usesV4InviteSteps(version)) {
    return getInviteV4StepCount(options) as InviteStep;
  }

  return usesV2InviteSteps(version) ? 5 : 4;
}

export function getInviteDisplayStep(
  currentStep: InviteStep,
  version: InviteWizardVersion,
  roleId: RoleId | '',
  options: InviteStepCountOptions = {},
): number {
  const reviewStep = getInviteReviewStep(version, { ...options, roleId });

  if (roleId && roleSkipsServiceAccess(roleId) && currentStep === reviewStep) {
    return 3;
  }

  if (usesV4InviteSteps(version)) {
    const stepCount = getInviteStepCount(version, roleId, options);
    return Math.min(Math.max(currentStep, 1), stepCount);
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
  options: InviteStepCountOptions = {},
): string | null {
  if (usesV4InviteSteps(version)) {
    const label = getInviteV4BackStepLabel(currentStep, { ...options, roleId });
    if (!label) {
      return null;
    }
    return label.replace(/^Back:\s*/, '');
  }

  if (currentStep === reviewStep) {
    if (roleId && roleSkipsServiceAccess(roleId)) {
      return 'Assign role';
    }

    return usesV2InviteSteps(version) ? 'Service permissions' : 'Service access';
  }

  switch (currentStep) {
    case 2:
      return 'User details';
    case 3:
      return 'Assign role';
    case 4:
      return usesV2InviteSteps(version) ? 'Service access' : null;
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
  options: InviteStepCountOptions = {},
): string | null {
  if (usesV4InviteSteps(version)) {
    return getInviteV4BackStepLabel(currentStep, { ...options, roleId });
  }

  const previousStepTitle = getInvitePreviousStepTitle(
    version,
    currentStep,
    reviewStep,
    roleId,
    options,
  );
  return previousStepTitle ? formatInviteBackStepLabel(previousStepTitle) : null;
}

export function getInviteNextStepLabel(
  version: InviteWizardVersion,
  currentStep: InviteStep,
  roleId: RoleId | '',
  options: InviteStepCountOptions = {},
): string | null {
  if (usesV4InviteSteps(version)) {
    return getInviteV4NextStepLabel(currentStep, { ...options, roleId });
  }

  switch (currentStep) {
    case 1:
      return formatInviteNextStepLabel('Assign role');
    case 2:
      if (roleId && roleSkipsServiceAccess(roleId)) {
        return formatInviteNextStepLabel('Review');
      }

      return formatInviteNextStepLabel(
        version === 'v3' ? 'Service access' : 'Assign permissions',
      );
    case 3:
      return formatInviteNextStepLabel(
        usesV2InviteSteps(version) ? 'Service permissions' : INVITE_REVIEW_STEP_TITLE,
      );
    case 4:
      return usesV2InviteSteps(version)
        ? formatInviteNextStepLabel(INVITE_REVIEW_STEP_TITLE)
        : null;
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

export function getInviteV4CurrentTitle(
  displayStep: number,
  options: InviteStepCountOptions = {},
) {
  const path = getInviteV4Path(options);
  const logical = path[Math.min(Math.max(displayStep, 1), path.length) - 1];
  return logical ? getInviteV4StepTitle(logical) : 'Invite';
}
