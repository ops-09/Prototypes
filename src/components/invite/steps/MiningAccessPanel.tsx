import { useState } from 'react';
import { getSubServiceById } from '../../../rbac/services';
import type { ProjectPermission, ServiceAccess } from '../../../rbac/types';
import { CreateProjectSection } from '../CreateProjectSection';
import { ProjectPermissionsTable } from '../ProjectPermissionsTable';
import { ProjectSearchAutosuggest } from '../ProjectSearchAutosuggest';
import styles from '../InviteUserWizard.module.scss';
import { INVITE_FIELD_ANCHORS } from '../inviteValidation';

type MiningAccessPanelProps = {
  serviceAccess: ServiceAccess;
  serviceAccessError?: string;
  onChange: (serviceAccess: ServiceAccess) => void;
  /** When true, use catalog-style section title wording. */
  showHeading?: boolean;
};

const MINING_SUB_SERVICE_ID = 'mining' as const;
const PERMITS_GROUP_ID = 'permits-licences' as const;

/** Mining project grants without step chrome — for V7 Permissions tabs. */
export function MiningAccessPanel({
  serviceAccess,
  serviceAccessError,
  onChange,
  showHeading = false,
}: MiningAccessPanelProps) {
  const miningSubService = getSubServiceById(MINING_SUB_SERVICE_ID);
  const miningEntry = serviceAccess.services.mining;
  const createProject = serviceAccess.groups[PERMITS_GROUP_ID]?.createProject ?? false;
  const [searchQuery, setSearchQuery] = useState('');

  function updateCreateProject(nextCreateProject: boolean) {
    onChange({
      ...serviceAccess,
      groups: {
        ...serviceAccess.groups,
        [PERMITS_GROUP_ID]: { createProject: nextCreateProject },
      },
      services: {
        ...serviceAccess.services,
        mining: {
          ...miningEntry,
          enabled: true,
        },
      },
    });
  }

  function updateProjectPermission(projectId: string, permission: ProjectPermission) {
    onChange({
      ...serviceAccess,
      services: {
        ...serviceAccess.services,
        mining: {
          enabled: true,
          projectPermissions: {
            ...miningEntry.projectPermissions,
            [projectId]: permission,
          },
        },
      },
    });
  }

  if (!miningSubService) {
    return null;
  }

  return (
    <div id={INVITE_FIELD_ANCHORS.serviceAccess} tabIndex={-1}>
      {serviceAccessError ? (
        <p className={styles.fieldErrorMessage} role="alert">
          {serviceAccessError}
        </p>
      ) : null}

      <div className={styles.miningPermissionsCard}>
        <div className={styles.miningPermissionsHeader}>
          <div className={styles.miningPermissionsHeaderTop}>
            <h3 className={`ontario-h5 ${styles.miningPermissionsTitle}`}>
              {showHeading ? 'Mining projects' : 'Mining Permissions'}
            </h3>
            <div className={styles.projectPermissionsSearchWrap}>
              <ProjectSearchAutosuggest
                projects={miningSubService.projects}
                value={searchQuery}
                onChange={setSearchQuery}
                namePrefix={MINING_SUB_SERVICE_ID}
              />
            </div>
          </div>

          <CreateProjectSection
            groupId={PERMITS_GROUP_ID}
            checked={createProject}
            onChange={updateCreateProject}
          />
        </div>

        <ProjectPermissionsTable
          projects={miningSubService.projects}
          projectPermissions={miningEntry.projectPermissions}
          namePrefix={MINING_SUB_SERVICE_ID}
          onPermissionChange={updateProjectPermission}
          showHeader={false}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
        />
      </div>
    </div>
  );
}
