import { OntarioCallout } from '@ongov/ontario-design-system-component-library-react';
import { formatRoleLabel } from '../../rbac/rbacService';
import { roleSkipsServiceAccess } from '../../rbac/roles';
import type { RoleId } from '../../rbac/types';
import {
  INVITE_ACCESS_NEEDS,
  isInviteAccessNeedId,
} from './inviteAccessNeedsCatalog';
import type { InviteDynamicLogicalStep } from './inviteWizardPaths';
import styles from './InviteUserWizard.module.scss';

type InviteeCalloutProps = {
  email: string;
  roleId: RoleId | '';
  accessNeedIds: string[];
  /** Current wizard step — rows unlock as the user advances (up to access needs). */
  logicalStep: InviteDynamicLogicalStep;
};

function formatAccessNeeds(accessNeedIds: string[]) {
  const labels = accessNeedIds
    .filter(isInviteAccessNeedId)
    .map((id) => INVITE_ACCESS_NEEDS.find((need) => need.id === id)?.label ?? id);

  if (labels.length === 0) {
    return 'None selected';
  }

  return labels.join(', ');
}

type CalloutRow = {
  label: string;
  value: string;
};

/**
 * Invite context callout — Form 7–style labeled rows.
 * Progressive: Email from role step; Role from access-needs onward; Access needs on permissions.
 */
export function InviteeCallout({
  email,
  roleId,
  accessNeedIds,
  logicalStep,
}: InviteeCalloutProps) {
  const trimmedEmail = email.trim();
  const rows: CalloutRow[] = [
    {
      label: 'Email',
      value: trimmedEmail || '—',
    },
  ];

  if (logicalStep !== 'role') {
    rows.push({
      label: 'Role',
      value: roleId ? formatRoleLabel(roleId) : '—',
    });
  }

  if (
    logicalStep === 'permissions' &&
    roleId &&
    !roleSkipsServiceAccess(roleId)
  ) {
    rows.push({
      label: 'Access needs',
      value: formatAccessNeeds(accessNeedIds),
    });
  }

  return (
    <OntarioCallout
      className={styles.inviteeCallout}
      headingType="h3"
      headingContent="Inviting"
      headingContentType="string"
      highlightColour="teal"
    >
      <div className={styles.inviteeCalloutBody}>
        {rows.map((row) => (
          <div key={row.label} className={styles.inviteeCalloutRow}>
            <p className={styles.inviteeCalloutLabel}>{row.label}</p>
            <p className={styles.inviteeCalloutValue}>{row.value}</p>
          </div>
        ))}
      </div>
    </OntarioCallout>
  );
}
