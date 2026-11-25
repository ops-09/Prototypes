import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  OntarioButton,
  OntarioIconDelete,
  OntarioIconDocument,
} from '@ongov/ontario-design-system-component-library-react';
import {
  getApplicationById,
  getMinistryLabel,
  getPermitTypeById,
} from '../../../rbac/cdpsPermitCatalog';
import {
  listSelectedCreatePermitTypeIds,
  setIndividualCreatePermitTypeIds,
} from '../../../rbac/permitApplicationAccess';
import { formatProjectPermission } from '../../../rbac/rbacService';
import { getSubServiceById } from '../../../rbac/services';
import type {
  PermitApplicationAccess,
  ProjectPermission,
  ServiceAccess,
} from '../../../rbac/types';
import {
  INVITE_PERMIT_CATALOG_PATH,
  type InvitePermitCatalogLocationState,
} from '../inviteWizardPaths';
import styles from '../InviteUserWizard.module.scss';
import userMgmtStyles from '../../user-management/UserManagement.module.scss';
import tableStyles from '../../user-management/UsersTable.module.scss';

type SelectedPermissionsTableV14Props = {
  access: PermitApplicationAccess;
  serviceAccess: ServiceAccess;
  accessNeedIds: string[];
  returnDisplayStep?: number;
  onAccessChange: (access: PermitApplicationAccess) => void;
  onServiceAccessChange: (serviceAccess: ServiceAccess) => void;
  onAccessNeedIdsChange: (accessNeedIds: string[]) => void;
};

type PermissionRowKind =
  | 'create_permit'
  | 'create_all'
  | 'existing_app'
  | 'mining_create'
  | 'mining_project';

type PermissionRow = {
  id: string;
  kind: PermissionRowKind;
  permissionType: string;
  applicationName: string;
  accessDetails: string;
  /** Payload used by remove handlers. */
  refId: string;
};

const MINING_SUB_SERVICE_ID = 'mining' as const;
const PERMITS_GROUP_ID = 'permits-licences' as const;

function formatExistingAccess(view: boolean, edit: boolean) {
  if (edit) {
    return 'View and edit';
  }
  if (view) {
    return 'View';
  }
  return 'No access';
}

/**
 * V14 Permissions summary — one table for any permission type added via catalog.
 * Columns: Permission type | Application name | Access details | Actions.
 */
export function SelectedPermissionsTableV14({
  access,
  serviceAccess,
  accessNeedIds,
  returnDisplayStep = 3,
  onAccessChange,
  onServiceAccessChange,
  onAccessNeedIdsChange,
}: SelectedPermissionsTableV14Props) {
  const navigate = useNavigate();
  const miningSubService = getSubServiceById(MINING_SUB_SERVICE_ID);
  const miningEntry = serviceAccess.services.mining;
  const createProject = serviceAccess.groups[PERMITS_GROUP_ID]?.createProject ?? false;

  const rows = useMemo((): PermissionRow[] => {
    const next: PermissionRow[] = [];

    if (access.create.enabled && access.create.mode === 'all_ministries') {
      next.push({
        id: 'create-all',
        kind: 'create_all',
        permissionType: 'New permit applications',
        applicationName: 'All eligible permits',
        accessDetails: 'Create',
        refId: 'all_ministries',
      });
    }

    if (access.create.enabled && access.create.mode === 'individual') {
      for (const permitTypeId of listSelectedCreatePermitTypeIds(access)) {
        const permit = getPermitTypeById(permitTypeId);
        if (!permit) {
          continue;
        }
        next.push({
          id: `create-${permitTypeId}`,
          kind: 'create_permit',
          permissionType: 'New permit applications',
          applicationName: permit.permitShortName,
          accessDetails: `Create · ${permit.ministryId} — ${getMinistryLabel(permit.ministryId)}`,
          refId: permitTypeId,
        });
      }
    }

    const existingIds = new Set([
      ...(access.view.enabled ? access.view.applicationIds : []),
      ...(access.edit.enabled ? access.edit.applicationIds : []),
    ]);
    for (const applicationId of existingIds) {
      const app = getApplicationById(applicationId);
      const view = access.view.enabled && access.view.applicationIds.includes(applicationId);
      const edit = access.edit.enabled && access.edit.applicationIds.includes(applicationId);
      next.push({
        id: `existing-${applicationId}`,
        kind: 'existing_app',
        permissionType: 'Existing applications',
        applicationName: app?.displayName ?? applicationId,
        accessDetails: formatExistingAccess(view, edit),
        refId: applicationId,
      });
    }

    if (createProject) {
      next.push({
        id: 'mining-create',
        kind: 'mining_create',
        permissionType: 'Mining projects',
        applicationName: 'Create mining projects',
        accessDetails: 'Create',
        refId: 'createProject',
      });
    }

    for (const project of miningSubService?.projects ?? []) {
      const permission = miningEntry.projectPermissions[project.id] ?? 'none';
      if (permission === 'none') {
        continue;
      }
      next.push({
        id: `mining-${project.id}`,
        kind: 'mining_project',
        permissionType: 'Mining projects',
        applicationName: project.label,
        accessDetails: formatProjectPermission(permission),
        refId: project.id,
      });
    }

    return next.sort((a, b) => {
      const typeCmp = a.permissionType.localeCompare(b.permissionType);
      if (typeCmp !== 0) {
        return typeCmp;
      }
      return a.applicationName.localeCompare(b.applicationName);
    });
  }, [access, createProject, miningEntry.projectPermissions, miningSubService?.projects]);

  function openCatalog() {
    const state: InvitePermitCatalogLocationState = {
      returnDisplayStep,
      showAccessNeedsFilter: true,
    };
    navigate(INVITE_PERMIT_CATALOG_PATH, { state });
  }

  function removeRow(row: PermissionRow) {
    switch (row.kind) {
      case 'create_all':
        onAccessChange({
          ...access,
          create: {
            ...access.create,
            mode: undefined,
            byMinistry: {},
          },
        });
        return;
      case 'create_permit': {
        const nextIds = listSelectedCreatePermitTypeIds(access).filter((id) => id !== row.refId);
        onAccessChange(setIndividualCreatePermitTypeIds(access, nextIds));
        return;
      }
      case 'existing_app':
        onAccessChange({
          ...access,
          view: {
            ...access.view,
            applicationIds: access.view.applicationIds.filter((id) => id !== row.refId),
          },
          edit: {
            ...access.edit,
            applicationIds: access.edit.applicationIds.filter((id) => id !== row.refId),
          },
        });
        return;
      case 'mining_create':
        onServiceAccessChange({
          ...serviceAccess,
          groups: {
            ...serviceAccess.groups,
            [PERMITS_GROUP_ID]: { createProject: false },
          },
        });
        return;
      case 'mining_project':
        onServiceAccessChange({
          ...serviceAccess,
          services: {
            ...serviceAccess.services,
            mining: {
              ...miningEntry,
              projectPermissions: {
                ...miningEntry.projectPermissions,
                [row.refId]: 'none' as ProjectPermission,
              },
            },
          },
        });
        return;
      default:
        return;
    }
  }

  if (rows.length === 0) {
    return (
      <section className={styles.permitEmptyTableState} aria-label="Selected permissions">
        <span className={styles.permitEmptyTableIcon} aria-hidden="true">
          <OntarioIconDocument colour="grey" iconWidth={32} isDecorative />
        </span>
        <p className={styles.permitEmptyTableText}>
          Browse and add permissions for any application.
        </p>
        <OntarioButton type="primary" htmlType="button" onClick={openCatalog}>
          Add
        </OntarioButton>
      </section>
    );
  }

  return (
    <section className={userMgmtStyles.listCard} aria-label="Selected permissions">
      <div className={userMgmtStyles.listCardHeader}>
        <p className={`ontario-h5 ${userMgmtStyles.listCardHeading}`}>
          {rows.length} permission{rows.length === 1 ? '' : 's'} selected
        </p>
        <OntarioButton type="tertiary" htmlType="button" onClick={openCatalog}>
          Add more permissions
        </OntarioButton>
      </div>

      <div className={tableStyles.tableWrap}>
        <table className={tableStyles.table}>
          <caption className="ontario-show-for-sr">Selected permissions</caption>
          <thead>
            <tr>
              <th scope="col" className={`ontario-h6 ${tableStyles.columnHeader}`}>
                Permission type
              </th>
              <th scope="col" className={`ontario-h6 ${tableStyles.columnHeader}`}>
                Application name
              </th>
              <th scope="col" className={`ontario-h6 ${tableStyles.columnHeader}`}>
                Access details
              </th>
              <th scope="col" className={`ontario-h6 ${tableStyles.columnHeader}`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>
                  <span className={tableStyles.cellText}>{row.permissionType}</span>
                </td>
                <td>
                  <span className={tableStyles.cellText}>{row.applicationName}</span>
                </td>
                <td>
                  <span className={tableStyles.cellText}>{row.accessDetails}</span>
                </td>
                <td>
                  <div className={tableStyles.actions}>
                    <button
                      type="button"
                      className={tableStyles.iconAction}
                      aria-label={`Remove ${row.applicationName}`}
                      onClick={() => removeRow(row)}
                    >
                      <OntarioIconDelete colour="blue" iconWidth={24} isDecorative />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
