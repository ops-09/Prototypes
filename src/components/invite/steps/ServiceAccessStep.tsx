import { useState } from 'react';
import { SERVICE_GROUPS } from '../../../rbac/services';
import type { ServiceAccess, ServiceGroupAccess, ServiceGroupId, SubServiceId } from '../../../rbac/types';
import { ServiceGroupCard } from '../ServiceGroupCard';
import styles from '../InviteUserWizard.module.scss';
import { formatInviteStepTitle } from '../inviteWizardContent';

type ServiceAccessStepProps = {
  serviceAccess: ServiceAccess;
  onChange: (serviceAccess: ServiceAccess) => void;
};

export function ServiceAccessStep({
  serviceAccess,
  onChange,
}: ServiceAccessStepProps) {
  const [expandedSubServices, setExpandedSubServices] = useState<Record<SubServiceId, boolean>>(
    () => ({
      mining: false,
      construction: false,
      highways: false,
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

  function setSubServiceExpanded(subServiceId: SubServiceId, expanded: boolean) {
    setExpandedSubServices((current) => ({
      ...current,
      [subServiceId]: expanded,
    }));
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

  return (
    <section className={styles.stepPanel} aria-label="Service access">
      <div className={styles.stepPanelHeader}>
        <h2 className={styles.stepPanelTitle}>{formatInviteStepTitle('Service access')}</h2>
      </div>

      <p className={styles.serviceAccessIntro}>
        Enable services below and configure your user permissions
      </p>

      <div className={styles.serviceGroupList}>
        {SERVICE_GROUPS.map((group) => (
          <ServiceGroupCard
            key={group.id}
            group={group}
            serviceAccess={serviceAccess}
            expandedSubServices={expandedSubServices}
            onExpandedChange={setSubServiceExpanded}
            onSubServiceChange={updateSubServiceEntry}
            onGroupAccessChange={(access) => updateGroupAccess(group.id, access)}
            variant="full"
          />
        ))}
      </div>
    </section>
  );
}
