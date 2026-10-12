import { useState } from 'react';
import { SERVICE_GROUPS } from '../../../rbac/services';
import type { ServiceAccess, ServiceGroupAccess, ServiceGroupId, SubServiceId } from '../../../rbac/types';
import { ServiceGroupCard } from '../ServiceGroupCard';
import styles from '../InviteUserWizard.module.scss';
import { formatInviteStepTitle } from '../inviteWizardContent';

type ProvisionServicesStepProps = {
  serviceAccess: ServiceAccess;
  onChange: (serviceAccess: ServiceAccess) => void;
};

export function ProvisionServicesStep({ serviceAccess, onChange }: ProvisionServicesStepProps) {
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
    <section className={styles.stepPanel} aria-label="Provision services">
      <div className={styles.stepPanelHeader}>
        <h2 className={styles.stepPanelTitle}>{formatInviteStepTitle('Provision services')}</h2>
      </div>

      <p className={styles.serviceAccessIntro}>
        Select the services this user should have access to. You will configure project permissions
        in the next step.
      </p>

      <div className={styles.serviceGroupList}>
        {SERVICE_GROUPS.map((group) => (
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
            variant="provision"
          />
        ))}
      </div>
    </section>
  );
}
