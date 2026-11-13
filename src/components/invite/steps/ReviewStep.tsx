import { OntarioPageAlert } from '@ongov/ontario-design-system-component-library-react';
import {
  describeApplicationGrant,
  describeCreateMinistryScope,
  hasConfiguredCreateScope,
  hasConfiguredEditScope,
  hasConfiguredViewScope,
} from '../../../rbac/permitApplicationAccess';
import { roleSkipsServiceAccess } from '../../../rbac/roles';
import { formatRoleLabel } from '../../../rbac/rbacService';
import { SERVICE_GROUPS } from '../../../rbac/services';
import type {
  InviteStep,
  InviteUserInput,
  PermitApplicationAccess,
  ProjectPermission,
  ServiceAccess,
} from '../../../rbac/types';
import {
  InviteSummaryList,
  InviteSummaryListSpacer,
  type InviteSummaryListItem,
} from '../InviteSummaryList';
import styles from '../InviteUserWizard.module.scss';

export type ReviewEditTargets = {
  email: InviteStep;
  role: InviteStep;
  mining: InviteStep;
  permits: InviteStep;
  domains: InviteStep;
};

type ReviewStepProps = {
  draft: InviteUserInput;
  onEditStep: (step: InviteStep) => void;
  editTargets?: ReviewEditTargets;
};

function formatReviewPermission(permission: ProjectPermission) {
  switch (permission) {
    case 'view':
      return 'view';
    case 'view_edit':
      return 'view & edit';
    default:
      return 'No access';
  }
}

function buildMiningSummaryItem(
  serviceAccess: ServiceAccess,
  onChange: () => void,
): InviteSummaryListItem | null {
  const miningGroup = SERVICE_GROUPS.find((group) => group.id === 'permits-licences');
  const mining = miningGroup?.subServices.find((subService) => subService.id === 'mining');
  const entry = serviceAccess.services.mining;

  if (!mining || !entry?.enabled) {
    return null;
  }

  const projectChildren = mining.projects
    .filter((project) => (entry.projectPermissions[project.id] ?? 'none') !== 'none')
    .map((project) => ({
      name: project.label,
      description: formatReviewPermission(entry.projectPermissions[project.id] ?? 'none'),
    }));

  const createProject = serviceAccess.groups['permits-licences']?.createProject ?? false;

  return {
    name: 'Mining Projects',
    description: createProject
      ? 'Can create projects'
      : (miningGroup?.label ?? 'Permits and licences'),
    onChange,
    children: projectChildren,
  };
}

function buildPermitSummaryItem(
  access: PermitApplicationAccess | undefined,
  onChange: () => void,
): InviteSummaryListItem | null {
  if (!access?.enabled) {
    return null;
  }

  const children: Array<{ name: string; description: string }> = [];

  if (hasConfiguredCreateScope(access)) {
    for (const [ministryId, scope] of Object.entries(access.create.byMinistry)) {
      if (!scope) {
        continue;
      }
      children.push({
        name: 'Create',
        description: describeCreateMinistryScope(ministryId, scope),
      });
    }
  }

  if (hasConfiguredViewScope(access)) {
    for (const applicationId of access.view.applicationIds) {
      children.push({
        name: 'View',
        description: describeApplicationGrant(applicationId),
      });
    }
  }

  if (hasConfiguredEditScope(access)) {
    for (const applicationId of access.edit.applicationIds) {
      children.push({
        name: 'Edit',
        description: describeApplicationGrant(applicationId),
      });
    }
  }

  if (children.length === 0) {
    return null;
  }

  return {
    name: 'Permit Applications',
    description: 'Create, view, and edit scopes',
    onChange,
    children,
  };
}

export function ReviewStep({ draft, onEditStep, editTargets }: ReviewStepProps) {
  const targets: ReviewEditTargets = editTargets ?? {
    email: 1,
    role: 2,
    mining: 3,
    permits: 3,
    domains: 3,
  };

  const items: InviteSummaryListItem[] = [
    {
      name: 'Email',
      description: draft.email,
      onChange: () => onEditStep(targets.email),
    },
    {
      name: 'Role',
      description: formatRoleLabel(draft.roleId),
      onChange: () => onEditStep(targets.role),
    },
  ];

  if (!roleSkipsServiceAccess(draft.roleId)) {
    if (draft.serviceAccess) {
      const miningItem = buildMiningSummaryItem(draft.serviceAccess, () =>
        onEditStep(targets.mining),
      );
      if (miningItem) {
        items.push(miningItem);
      }
    }

    const permitItem = buildPermitSummaryItem(draft.permitApplicationAccess, () =>
      onEditStep(targets.permits),
    );
    if (permitItem) {
      items.push(permitItem);
    }
  }

  return (
    <section className={styles.stepPanel} aria-label="Review and confirm">
      <InviteSummaryList caption="Review and confirm" items={items} />

      <InviteSummaryListSpacer>
        <OntarioPageAlert
          type="informational"
          heading="Invitation email"
          content={`An invitation will be sent to ${draft.email}. They will appear as Pending until they accept.`}
        />
      </InviteSummaryListSpacer>
    </section>
  );
}

export function buildInvitePayload(
  email: string,
  roleId: InviteUserInput['roleId'],
  serviceAccess: ServiceAccess,
  permitApplicationAccess?: PermitApplicationAccess,
): InviteUserInput {
  return {
    email: email.trim().toLowerCase(),
    roleId,
    serviceAccess: structuredClone(serviceAccess),
    permitApplicationAccess: permitApplicationAccess
      ? structuredClone(permitApplicationAccess)
      : undefined,
  };
}
