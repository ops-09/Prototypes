import {
  OntarioPageAlert,
  OntarioTable,
} from '@ongov/ontario-design-system-component-library-react';
import { useMemo } from 'react';
import {
  getApplicationById,
  getMinistryLabel,
  getPermitTypeById,
} from '../../../rbac/cdpsPermitCatalog';
import {
  hasConfiguredCreateScope,
  hasConfiguredEditScope,
  hasConfiguredViewScope,
  listSelectedCreatePermitTypeIds,
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
  INVITE_ACCESS_NEEDS,
  type InviteAccessNeedId,
} from '../inviteAccessNeedsCatalog';
import {
  InviteSummaryList,
  type InviteSummaryListItem,
} from '../InviteSummaryList';
import styles from '../InviteUserWizard.module.scss';
import formStyles from '../../form7/Form7SummaryList.module.scss';

export type ReviewEditTargets = {
  email: InviteStep;
  role: InviteStep;
  mining: InviteStep;
  permits: InviteStep;
  domains: InviteStep;
  accessNeeds?: InviteStep;
};

type ReviewStepProps = {
  draft: InviteUserInput;
  accessNeedIds?: string[];
  onEditStep: (step: InviteStep) => void;
  editTargets?: ReviewEditTargets;
};

type ReviewPermissionTableRow = {
  access: string;
  item: string;
  details: string;
};

function formatReviewPermission(permission: ProjectPermission) {
  switch (permission) {
    case 'view':
      return 'View';
    case 'view_edit':
      return 'View & edit';
    default:
      return 'No access';
  }
}

function ministryFullName(label: string) {
  return label.replace(/\s*\([^)]+\)\s*$/, '');
}

function buildPermitTableRows(access: PermitApplicationAccess | undefined): ReviewPermissionTableRow[] {
  if (!access?.enabled) {
    return [];
  }

  const rows: ReviewPermissionTableRow[] = [];

  if (hasConfiguredCreateScope(access)) {
    if (access.create.mode === 'all_ministries') {
      rows.push({
        access: 'Create',
        item: 'All eligible permits',
        details: 'All ministries',
      });
    } else {
      for (const permitTypeId of listSelectedCreatePermitTypeIds(access)) {
        const permit = getPermitTypeById(permitTypeId);
        if (!permit) {
          rows.push({
            access: 'Create',
            item: permitTypeId,
            details: '',
          });
          continue;
        }
        rows.push({
          access: 'Create',
          item: permit.permitShortName,
          details: `${permit.ministryId} — ${ministryFullName(getMinistryLabel(permit.ministryId))}`,
        });
      }
    }
  }

  if (hasConfiguredViewScope(access)) {
    for (const applicationId of access.view.applicationIds) {
      const app = getApplicationById(applicationId);
      rows.push({
        access: 'View',
        item: app?.displayName ?? applicationId,
        details: app
          ? `#${app.applicationNumber} · ${app.status} · ${app.ministryId}`
          : '',
      });
    }
  }

  if (hasConfiguredEditScope(access)) {
    for (const applicationId of access.edit.applicationIds) {
      const app = getApplicationById(applicationId);
      rows.push({
        access: 'Edit',
        item: app?.displayName ?? applicationId,
        details: app
          ? `#${app.applicationNumber} · ${app.status} · ${app.ministryId}`
          : '',
      });
    }
  }

  return rows;
}

function buildMiningTableRows(serviceAccess: ServiceAccess | undefined): ReviewPermissionTableRow[] {
  if (!serviceAccess?.services.mining?.enabled) {
    return [];
  }

  const miningGroup = SERVICE_GROUPS.find((group) => group.id === 'permits-licences');
  const mining = miningGroup?.subServices.find((subService) => subService.id === 'mining');
  if (!mining) {
    return [];
  }

  const rows: ReviewPermissionTableRow[] = [];
  if (serviceAccess.groups['permits-licences']?.createProject) {
    rows.push({
      access: 'Mining',
      item: 'Create projects',
      details: 'Allowed',
    });
  }

  for (const project of mining.projects) {
    const permission = serviceAccess.services.mining.projectPermissions[project.id] ?? 'none';
    if (permission === 'none') {
      continue;
    }
    rows.push({
      access: 'Mining',
      item: project.label,
      details: formatReviewPermission(permission),
    });
  }

  return rows;
}

function buildPermissionTableRows(
  draft: InviteUserInput,
  accessNeedIds: string[],
): ReviewPermissionTableRow[] {
  const selectedNeeds = accessNeedIds.filter((id): id is InviteAccessNeedId =>
    INVITE_ACCESS_NEEDS.some((need) => need.id === id),
  );

  if (selectedNeeds.length > 0) {
    const rows: ReviewPermissionTableRow[] = [];
    if (selectedNeeds.includes('create_permits')) {
      rows.push(...buildPermitTableRows(draft.permitApplicationAccess));
    }
    if (selectedNeeds.includes('mining_projects')) {
      rows.push(...buildMiningTableRows(draft.serviceAccess));
    }
    return rows;
  }

  return [
    ...buildMiningTableRows(draft.serviceAccess),
    ...buildPermitTableRows(draft.permitApplicationAccess),
  ];
}

/**
 * Review and confirm — identity in summary list; permission grants in a static ODS table.
 */
export function ReviewStep({
  draft,
  accessNeedIds = [],
  onEditStep,
  editTargets,
}: ReviewStepProps) {
  const targets: ReviewEditTargets = editTargets ?? {
    email: 1,
    role: 2,
    mining: 3,
    permits: 3,
    domains: 3,
  };

  const identityItems: InviteSummaryListItem[] = [
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

  const selectedNeeds = accessNeedIds.filter((id): id is InviteAccessNeedId =>
    INVITE_ACCESS_NEEDS.some((need) => need.id === id),
  );

  if (!roleSkipsServiceAccess(draft.roleId) && selectedNeeds.length > 0 && targets.accessNeeds) {
    identityItems.push({
      name: 'Access needs',
      description: selectedNeeds
        .map((id) => INVITE_ACCESS_NEEDS.find((need) => need.id === id)?.label ?? id)
        .join(', '),
      onChange: () => onEditStep(targets.accessNeeds!),
    });
  }

  const permissionRows = useMemo(
    () =>
      roleSkipsServiceAccess(draft.roleId)
        ? []
        : buildPermissionTableRows(draft, accessNeedIds),
    [accessNeedIds, draft],
  );

  const tableColumns = useMemo(
    () => [
      { title: 'Item', key: 'item' },
      { title: 'Details', key: 'details' },
      { title: 'Access', key: 'access' },
    ],
    [],
  );

  const tableData = useMemo(
    () =>
      permissionRows.map((row) => ({
        data: {
          access: row.access,
          item: row.item,
          details: row.details,
        },
      })),
    [permissionRows],
  );

  const permissionsEditStep: InviteStep =
    selectedNeeds.includes('create_permits') || selectedNeeds.length === 0
      ? targets.permits
      : targets.mining;

  return (
    <section className={styles.stepPanel} aria-label="Review and confirm">
      <div className={styles.reviewIntro}>
        <h3 className={`ontario-h3 ${styles.stepPanelTitle}`}>Review</h3>
        <p className={styles.reviewIntroText}>
          Check the details below before you send the invitation. You can change any
          answer before confirming.
        </p>
        <OntarioPageAlert
          type="informational"
          heading="Invitation email"
          content={`An invitation will be sent to ${draft.email}. They will appear as Pending until they accept.`}
        />
      </div>

      <InviteSummaryList caption="User details" items={identityItems} />

      {permissionRows.length > 0 ? (
        <div className={styles.reviewPermissionsTable}>
          <div className={styles.reviewPermissionsTableHeader}>
            <h2 className={`ontario-h2 ${styles.reviewPermissionsTableTitle}`}>
              Permissions
            </h2>
            <div className={styles.inviteSummaryAction}>
              <button
                type="button"
                className={formStyles.changeButton}
                onClick={() => onEditStep(permissionsEditStep)}
              >
                Change
                <span className={formStyles.srOnly}>
                  {' '}
                  your answer for: <q>Permissions</q>
                </span>
              </button>
            </div>
          </div>
          <OntarioTable
            fullWidth
            zebraStripes="enabled"
            tableColumns={tableColumns}
            tableData={tableData}
          />
        </div>
      ) : null}
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
