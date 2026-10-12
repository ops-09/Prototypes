import { useMemo, useState } from 'react';
import { OntarioPageAlert } from '@ongov/ontario-design-system-component-library-react';
import { getEnabledSubServiceIds, SERVICE_GROUPS } from '../../../rbac/services';
import type { ServiceAccess, ServiceGroupAccess, ServiceGroupId, SubServiceId } from '../../../rbac/types';
import { ServiceGroupCard } from '../ServiceGroupCard';
import styles from '../InviteUserWizard.module.scss';
import { formatInviteStepTitle } from '../inviteWizardContent';

type ServicePermissionsStepProps = {
  serviceAccess: ServiceAccess;
  onChange: (serviceAccess: ServiceAccess) => void;
};

export function ServicePermissionsStep({ serviceAccess, onChange }: ServicePermissionsStepProps) {
  const enabledSubServiceIds = useMemo(
    () => getEnabledSubServiceIds(serviceAccess),
    [serviceAccess],
  );

  const [expandedSubServices, setExpandedSubServices] = useState<Record<SubServiceId, boolean>>(
    () => ({
      mining: enabledSubServiceIds.includes('mining'),
      construction: enabledSubServiceIds.includes('construction'),
      highways: enabledSubServiceIds.includes('highways'),
    }),
  );

  function updateSubServiceEntry(
    subServiceId: SubServiceId,
    entry: ServiceAccess['services'][SubServiceId],
  ) {
    onChange({
      services: {
        ...serviceAccess.services,
        [subServiceId]: entry,
      },
      groups: serviceAccess.groups,
    });
  }

  function updateGroupAccess(groupId: ServiceGroupId, access: ServiceGroupAccess) {
    onChange({
      ...serviceAccess,
      groups: {
        ...serviceAccess.groups,
        [groupId]: access,
      },
    });
  }

  const visibleGroups = SERVICE_GROUPS.filter((group) =>
    group.subServices.some((subService) => serviceAccess.services[subService.id]?.enabled),
  );

  return (
    <section className={styles.stepPanel} aria-label="Service permissions">
      <div className={styles.stepPanelHeader}>
        <h2 className={styles.stepPanelTitle}>{formatInviteStepTitle('Service permissions')}</h2>
      </div>

      <p className={styles.serviceAccessIntro}>
        Configure project permissions and access options for the services you provisioned.
      </p>

      {visibleGroups.length === 0 && (
        <OntarioPageAlert
          type="informational"
          heading="No services provisioned"
          content="Go back and enable at least one service before configuring permissions."
        />
      )}

      <div className={styles.serviceGroupList}>
        {visibleGroups.map((group) => (
          <ServiceGroupCard
            key={group.id}
            group={group}
            serviceAccess={serviceAccess}
            expandedSubServices={expandedSubServices}
            onExpandedChange={(subServiceId, expanded) =>
              setExpandedSubServices((current) => ({ ...current, [subServiceId]: expanded }))
            }
            onSubServiceChange={updateSubServiceEntry}
            onGroupAccessChange={(access) => updateGroupAccess(group.id, access)}
            variant="permissions"
          />
        ))}
      </div>
    </section>
  );
}
