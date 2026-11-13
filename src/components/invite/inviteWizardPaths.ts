import type { InviteWizardVersion } from '../../config/inviteWizardVersion';
import { usesV4InviteSteps } from '../../config/inviteWizardVersion';
import { roleSkipsServiceAccess } from '../../rbac/roles';
import { createDefaultPermitApplicationAccess } from '../../rbac/permitApplicationAccess';
import { DEFAULT_SERVICE_ACCESS } from '../../rbac/services';
import type {
  InviteStep,
  PermitApplicationAccess,
  RoleId,
  ServiceAccess,
} from '../../rbac/types';
import {
  getInviteDisplayStep,
  getInviteReviewStep,
  getInviteStepCount,
  type InviteStepCountOptions,
} from './inviteWizardContent';
import { getInviteV4LogicalStep, type InviteV4LogicalStep } from './inviteV4Path';

export const INVITE_BASE_PATH = '/user-management/invite';
export const INVITE_DRAFT_STORAGE_KEY = 'ops-rbac:invite-draft';

export type InviteWizardDraft = {
  email: string;
  confirmEmail: string;
  roleId: RoleId | '';
  serviceAccess: ServiceAccess;
  permitApplicationAccess: PermitApplicationAccess;
};

export function getInviteStepPath(displayStep: number) {
  return `${INVITE_BASE_PATH}/step-${displayStep}`;
}

export function parseInviteDisplayStepParam(stepParam: string | undefined): number | null {
  if (!stepParam) {
    return null;
  }

  // Route param is a whole segment: "step-1" (from /invite/:step). Also accept "1".
  const match = stepParam.match(/^step-(\d+)$/i) ?? stepParam.match(/^(\d+)$/);
  if (!match) {
    return null;
  }

  const parsed = Number.parseInt(match[1], 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return null;
  }

  return parsed;
}

export function readInviteWizardDraft(): InviteWizardDraft | null {
  if (typeof sessionStorage === 'undefined') {
    return null;
  }

  try {
    const raw = sessionStorage.getItem(INVITE_DRAFT_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<InviteWizardDraft>;
    return {
      email: typeof parsed.email === 'string' ? parsed.email : '',
      confirmEmail: typeof parsed.confirmEmail === 'string' ? parsed.confirmEmail : '',
      roleId: (parsed.roleId as RoleId | '') || '',
      serviceAccess: parsed.serviceAccess
        ? structuredClone(parsed.serviceAccess)
        : structuredClone(DEFAULT_SERVICE_ACCESS),
      permitApplicationAccess: parsed.permitApplicationAccess
        ? structuredClone(parsed.permitApplicationAccess)
        : createDefaultPermitApplicationAccess(),
    };
  } catch {
    return null;
  }
}

export function writeInviteWizardDraft(draft: InviteWizardDraft) {
  if (typeof sessionStorage === 'undefined') {
    return;
  }

  sessionStorage.setItem(INVITE_DRAFT_STORAGE_KEY, JSON.stringify(draft));
}

export function clearInviteWizardDraft() {
  if (typeof sessionStorage === 'undefined') {
    return;
  }

  sessionStorage.removeItem(INVITE_DRAFT_STORAGE_KEY);
}

/**
 * Map a URL display step to the wizard's internal step.
 * URL steps match the step indicator (1..N).
 */
export function inviteDisplayStepToInternal(
  displayStep: number,
  version: InviteWizardVersion,
  roleId: RoleId | '',
  options: InviteStepCountOptions = {},
): InviteStep {
  const reviewStep = getInviteReviewStep(version, { ...options, roleId });
  const stepCount = getInviteStepCount(version, roleId, options);
  const clampedDisplay = Math.min(Math.max(displayStep, 1), stepCount);

  if (roleId && roleSkipsServiceAccess(roleId) && clampedDisplay >= 3) {
    return reviewStep;
  }

  return clampedDisplay as InviteStep;
}

/**
 * Resolve the step from the URL. Allows jumping to any in-range step (like forms).
 * Only clamps invalid / out-of-range numbers — not incomplete field validation.
 */
export function resolveInviteStepFromUrl(
  stepParam: string | undefined,
  version: InviteWizardVersion,
  roleId: RoleId | '',
  options: InviteStepCountOptions = {},
): {
  internalStep: InviteStep;
  displayStep: number;
  needsUrlSync: boolean;
  logicalStep: InviteV4LogicalStep | null;
} {
  const mergedOptions = { ...options, roleId };
  const stepCount = getInviteStepCount(version, roleId, mergedOptions);
  const parsed = parseInviteDisplayStepParam(stepParam);
  const requestedDisplay = parsed ?? 1;
  const displayStep = Math.min(Math.max(requestedDisplay, 1), stepCount);
  const internalStep = inviteDisplayStepToInternal(
    displayStep,
    version,
    roleId,
    mergedOptions,
  );
  const canonicalDisplay = getInviteDisplayStep(
    internalStep,
    version,
    roleId,
    mergedOptions,
  );
  // Compare numeric steps — route param is "step-1", not "1".
  const needsUrlSync = parsed !== canonicalDisplay;

  return {
    internalStep,
    displayStep: canonicalDisplay,
    needsUrlSync,
    logicalStep: usesV4InviteSteps(version)
      ? getInviteV4LogicalStep(canonicalDisplay, mergedOptions)
      : null,
  };
}
