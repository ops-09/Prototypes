import { useEffect, useState } from 'react';
import { getSubServiceById } from '../../../rbac/services';
import type { ProjectPermission, ServiceAccess } from '../../../rbac/types';
import { CreateProjectSection } from '../CreateProjectSection';
import { ProjectPermissionsTable } from '../ProjectPermissionsTable';
import { ProjectSearchAutosuggest } from '../ProjectSearchAutosuggest';
import styles from '../InviteUserWizard.module.scss';
import { formatInviteStepTitle } from '../inviteWizardContent';
import { INVITE_FIELD_ANCHORS } from '../inviteValidation';

type ServiceAccessMiningStepProps = {
  serviceAccess: ServiceAccess;
  onChange: (serviceAccess: ServiceAccess) => void;
};

const MINING_SUB_SERVICE_ID = 'mining' as const;
const PERMITS_GROUP_ID = 'permits-licences' as const;

export function ServiceAccessMiningStep({
  serviceAccess,
  onChange,
}: ServiceAccessMiningStepProps) {
  const miningSubService = getSubServiceById(MINING_SUB_SERVICE_ID);
  const miningEntry = serviceAccess.services.mining;
  const createProject = serviceAccess.groups[PERMITS_GROUP_ID]?.createProject ?? false;
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (serviceAccess.services.mining.enabled) {
      return;
    }

    onChange({
      ...serviceAccess,
      services: {
        ...serviceAccess.services,
        mining: {
          ...serviceAccess.services.mining,
          enabled: true,
        },
      },
    });
    // Enable mining once when entering this step so permissions can be saved.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-time enable on mount
  }, []);

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
    <section className={styles.stepPanel} aria-label="Service access">
      <div className={styles.stepPanelHeader}>
        <h2 className={`ontario-h4 ${styles.stepPanelTitle}`}>
          {formatInviteStepTitle('Service access')}
        </h2>
      </div>

      <div id={INVITE_FIELD_ANCHORS.serviceAccess} className={styles.miningPermissionsCard} tabIndex={-1}>
        <div className={styles.miningPermissionsHeader}>
          <div className={styles.miningPermissionsHeaderTop}>
            <h3 className={`ontario-h5 ${styles.miningPermissionsTitle}`}>Mining Permissions</h3>
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
    </section>
  );
}
