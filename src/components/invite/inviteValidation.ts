import {
  hasConfiguredCreateScope,
  hasConfiguredEditScope,
  hasConfiguredViewScope,
} from '../../rbac/permitApplicationAccess';
import { hasServiceAccessSelection } from '../../rbac/services';
import type { PermitApplicationAccess, RoleId, ServiceAccess } from '../../rbac/types';

export type InviteFieldKey =
  | 'email'
  | 'confirmEmail'
  | 'role'
  | 'serviceAccess'
  | 'permitAccess';

export type InviteFieldErrors = Partial<Record<InviteFieldKey, string>>;

export type InviteErrorSummaryItem = {
  key: InviteFieldKey;
  href: string;
  message: string;
};

export const INVITE_FIELD_ANCHORS: Record<InviteFieldKey, string> = {
  email: 'invite-email',
  confirmEmail: 'invite-confirm-email',
  role: 'invite-role',
  serviceAccess: 'invite-service-access',
  permitAccess: 'invite-permit-access',
};

const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateInviteEmailStep(email: string, confirmEmail: string): InviteFieldErrors {
  const errors: InviteFieldErrors = {};
  const trimmedEmail = email.trim();
  const trimmedConfirm = confirmEmail.trim();

  if (!trimmedEmail) {
    errors.email = 'Enter an email address.';
  } else if (!EMAIL_FORMAT.test(trimmedEmail)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!trimmedConfirm) {
    errors.confirmEmail = 'Confirm the email address.';
  } else if (!EMAIL_FORMAT.test(trimmedConfirm)) {
    errors.confirmEmail = 'Enter a valid email address.';
  } else if (trimmedEmail.toLowerCase() !== trimmedConfirm.toLowerCase()) {
    errors.confirmEmail = 'Email addresses must match.';
  }

  return errors;
}

export function validateInviteRoleStep(roleId: RoleId | ''): InviteFieldErrors {
  if (roleId) {
    return {};
  }

  return { role: 'Select a role.' };
}

/** True when any enabled service has view or view & edit on a project. */
export function hasConfiguredServicePermissions(serviceAccess: ServiceAccess): boolean {
  return Object.values(serviceAccess.services).some((entry) => {
    if (!entry.enabled) {
      return false;
    }

    return Object.values(entry.projectPermissions).some(
      (permission) => permission === 'view' || permission === 'view_edit',
    );
  });
}

function hasConfiguredMiningPermissions(serviceAccess: ServiceAccess): boolean {
  const mining = serviceAccess.services.mining;
  if (!mining?.enabled) {
    return false;
  }

  return Object.values(mining.projectPermissions).some(
    (permission) => permission === 'view' || permission === 'view_edit',
  );
}

/**
 * @param mode `service` — enable at least one service (v1 / v2 provision).
 * `permissions` — assign view or edit on at least one project (v2 permissions / legacy mining).
 */
export function validateInviteServiceAccessStep(
  serviceAccess: ServiceAccess,
  mode: 'service' | 'permissions',
): InviteFieldErrors {
  if (mode === 'service') {
    if (hasServiceAccessSelection(serviceAccess)) {
      return {};
    }

    return { serviceAccess: 'Select at least one service.' };
  }

  if (hasConfiguredServicePermissions(serviceAccess)) {
    return {};
  }

  return {
    serviceAccess: 'Select view or edit access for at least one project.',
  };
}

/**
 * V3 domain-gate validation (Shape A).
 * Neither domain on is allowed. Opted-in domains must have at least one grant.
 */
export function validateInviteDomainAccessStep(
  serviceAccess: ServiceAccess,
  permitApplicationAccess: PermitApplicationAccess,
): InviteFieldErrors {
  const errors: InviteFieldErrors = {};
  const miningOn = serviceAccess.services.mining.enabled;
  const permitsOn = permitApplicationAccess.enabled;

  if (miningOn && !hasConfiguredMiningPermissions(serviceAccess)) {
    errors.serviceAccess = 'Select view or edit access for at least one mining project.';
  }

  if (permitsOn) {
    Object.assign(errors, validateInvitePermitApplicationsStep(permitApplicationAccess));
  }

  return errors;
}

/** V4 mining detail step — domain already opted in. */
export function validateInviteMiningStep(serviceAccess: ServiceAccess): InviteFieldErrors {
  if (hasConfiguredMiningPermissions(serviceAccess)) {
    return {};
  }

  return {
    serviceAccess: 'Select view or edit access for at least one mining project.',
  };
}

/**
 * V4 permits detail step (tabs). Require create scope and/or existing grants.
 * Neither create nor existing grants fails.
 */
export function validateInvitePermitApplicationsStep(
  permitApplicationAccess: PermitApplicationAccess,
): InviteFieldErrors {
  const hasCreate = hasConfiguredCreateScope(permitApplicationAccess);
  const hasExisting =
    hasConfiguredViewScope(permitApplicationAccess) ||
    hasConfiguredEditScope(permitApplicationAccess);

  if (hasCreate || hasExisting) {
    return {};
  }

  // Distinguish empty create vs empty existing when one track was started.
  if (
    permitApplicationAccess.create.enabled &&
    Object.keys(permitApplicationAccess.create.byMinistry).length > 0 &&
    !hasCreate
  ) {
    return {
      permitAccess:
        'For create access, include at least one ministry with all or selected permit types.',
    };
  }

  return {
    permitAccess:
      'Assign create scope and/or view or edit access for at least one existing application.',
  };
}

export function buildInviteErrorSummaryItems(
  errors: InviteFieldErrors,
): InviteErrorSummaryItem[] {
  const order: InviteFieldKey[] = [
    'email',
    'confirmEmail',
    'role',
    'serviceAccess',
    'permitAccess',
  ];

  return order.flatMap((key) => {
    const message = errors[key];
    if (!message) {
      return [];
    }

    return [
      {
        key,
        href: `#${INVITE_FIELD_ANCHORS[key]}`,
        message,
      },
    ];
  });
}
