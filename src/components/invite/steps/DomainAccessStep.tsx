import { useState } from 'react';
import {
  OntarioCheckboxes,
  OntarioHintText,
} from '@ongov/ontario-design-system-component-library-react';
import { getSubServiceById } from '../../../rbac/services';
import type {
  PermitApplicationAccess,
  ProjectPermission,
  ServiceAccess,
} from '../../../rbac/types';
import { CreateProjectSection } from '../CreateProjectSection';
import { ProjectPermissionsTable } from '../ProjectPermissionsTable';
import { ProjectSearchAutosuggest } from '../ProjectSearchAutosuggest';
import styles from '../InviteUserWizard.module.scss';
import { formatInviteStepTitle } from '../inviteWizardContent';
import { INVITE_FIELD_ANCHORS } from '../inviteValidation';
import { PermitApplicationsSection } from './PermitApplicationsSection';

type DomainAccessStepProps = {
  serviceAccess: ServiceAccess;
  permitApplicationAccess: PermitApplicationAccess;
  serviceAccessError?: string;
  permitAccessError?: string;
  onServiceAccessChange: (serviceAccess: ServiceAccess) => void;
  onPermitApplicationAccessChange: (access: PermitApplicationAccess) => void;
};

const MINING_SUB_SERVICE_ID = 'mining' as const;
const PERMITS_GROUP_ID = 'permits-licences' as const;

function applyCheckboxToggle(current: string[], event: globalThis.Event): string[] {
  const target = event.target as HTMLInputElement | null;
  if (!target?.value) {
    return current;
  }

  const checked =
    typeof target.checked === 'boolean' ? target.checked : !current.includes(target.value);

  if (checked) {
    return current.includes(target.value) ? current : [...current, target.value];
  }

  return current.filter((value) => value !== target.value);
}

export function DomainAccessStep({
  serviceAccess,
  permitApplicationAccess,
  serviceAccessError,
  permitAccessError,
  onServiceAccessChange,
  onPermitApplicationAccessChange,
}: DomainAccessStepProps) {
  const miningSubService = getSubServiceById(MINING_SUB_SERVICE_ID);
  const miningEnabled = serviceAccess.services.mining.enabled;
  const miningEntry = serviceAccess.services.mining;
  const createProject = serviceAccess.groups[PERMITS_GROUP_ID]?.createProject ?? false;
  const [searchQuery, setSearchQuery] = useState('');

  const domainValues = [
    ...(miningEnabled ? ['mining'] : []),
    ...(permitApplicationAccess.enabled ? ['permits'] : []),
  ];

  function handleDomainChange(event: globalThis.Event) {
    const nextValues = applyCheckboxToggle(domainValues, event);
    const nextMiningEnabled = nextValues.includes('mining');
    const nextPermitsEnabled = nextValues.includes('permits');

    if (nextMiningEnabled !== miningEnabled) {
      onServiceAccessChange({
        ...serviceAccess,
        services: {
          ...serviceAccess.services,
          mining: {
            ...miningEntry,
            enabled: nextMiningEnabled,
          },
        },
      });
    }

    if (nextPermitsEnabled !== permitApplicationAccess.enabled) {
      onPermitApplicationAccessChange({
        ...permitApplicationAccess,
        enabled: nextPermitsEnabled,
      });
    }
  }

  function updateCreateProject(nextCreateProject: boolean) {
    onServiceAccessChange({
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
    onServiceAccessChange({
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

  return (
    <section className={styles.stepPanel} aria-label="Service access">
      <div className={styles.stepPanelHeader}>
        <h2 className={`ontario-h4 ${styles.stepPanelTitle}`}>
          {formatInviteStepTitle('Service access')}
        </h2>
      </div>

      <div
        id={INVITE_FIELD_ANCHORS.serviceAccess}
        className={styles.domainAccessRoot}
        tabIndex={-1}
      >
        <OntarioHintText
          hint="Choose the permission domains this user needs. You can assign Mining Projects only, Permit Applications only, both, or neither."
        />

        <OntarioCheckboxes
          caption="Permission domains"
          name="invite-domain-gates"
          value={domainValues}
          options={[
            {
              value: 'mining',
              elementId: 'domain-mining',
              label: 'Mining Projects',
            },
            {
              value: 'permits',
              elementId: 'domain-permits',
              label: 'Permit Applications',
            },
          ]}
          customOnChange={handleDomainChange}
        />

        {serviceAccessError ? (
          <p className={styles.fieldErrorMessage} role="alert">
            {serviceAccessError}
          </p>
        ) : null}

        {miningEnabled && miningSubService ? (
          <div className={styles.miningPermissionsCard}>
            <div className={styles.miningPermissionsHeader}>
              <div className={styles.miningPermissionsHeaderTop}>
                <h3 className={`ontario-h5 ${styles.miningPermissionsTitle}`}>
                  Mining Permissions
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
        ) : null}

        {permitApplicationAccess.enabled ? (
          <div id={INVITE_FIELD_ANCHORS.permitAccess}>
            <PermitApplicationsSection
              access={permitApplicationAccess}
              onChange={onPermitApplicationAccessChange}
              errorMessage={permitAccessError}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
