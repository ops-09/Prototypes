import type { ServiceAccess, ServiceGroupAccess, SubServiceId } from '../../rbac/types';
import type { ServiceGroupDefinition } from '../../rbac/services';
import { CreateProjectSection } from './CreateProjectSection';
import { SubServiceAccordionRow, type ServiceAccessVariant } from './SubServiceAccordionRow';
import styles from './InviteUserWizard.module.scss';

type ServiceGroupCardProps = {
  group: ServiceGroupDefinition;
  serviceAccess: ServiceAccess;
  expandedSubServices: Record<SubServiceId, boolean>;
  onExpandedChange: (subServiceId: SubServiceId, expanded: boolean) => void;
  onSubServiceChange: (subServiceId: SubServiceId, entry: ServiceAccess['services'][SubServiceId]) => void;
  onGroupAccessChange: (access: ServiceGroupAccess) => void;
  variant?: ServiceAccessVariant;
};

export function ServiceGroupCard({
  group,
  serviceAccess,
  expandedSubServices,
  onExpandedChange,
  onSubServiceChange,
  onGroupAccessChange,
  variant = 'full',
}: ServiceGroupCardProps) {
  const visibleSubServices =
    variant === 'permissions'
      ? group.subServices.filter((subService) => serviceAccess.services[subService.id]?.enabled)
      : group.subServices;

  if (visibleSubServices.length === 0) {
    return null;
  }

  const groupAccess = serviceAccess.groups[group.id];
  const showCreateProject =
    (variant === 'permissions' || variant === 'full') && group.supportsCreateProject;

  if (variant === 'permissions') {
    return (
      <>
        {visibleSubServices.map((subService, index) => (
          <section
            key={subService.id}
            className={styles.serviceGroupCard}
            aria-label={subService.label}
          >
            <div className={styles.serviceGroupHeader}>
              <h5 className={`ontario-h5 ${styles.serviceGroupTitle}`}>{subService.label}</h5>
            </div>

            {showCreateProject && index === 0 && (
              <CreateProjectSection
                groupId={group.id}
                checked={groupAccess?.createProject ?? false}
                onChange={(createProject) => onGroupAccessChange({ createProject })}
              />
            )}

            <SubServiceAccordionRow
              subService={subService}
              entry={serviceAccess.services[subService.id]}
              expanded={expandedSubServices[subService.id]}
              onExpandedChange={(expanded) => onExpandedChange(subService.id, expanded)}
              onChange={(entry) => onSubServiceChange(subService.id, entry)}
              isLast
              variant="permissions"
            />
          </section>
        ))}
      </>
    );
  }

  return (
    <section className={styles.serviceGroupCard} aria-label={group.label}>
      <div className={styles.serviceGroupHeader}>
        <h5 className={`ontario-h5 ${styles.serviceGroupTitle}`}>{group.label}</h5>
      </div>

      {showCreateProject && (
        <CreateProjectSection
          groupId={group.id}
          checked={groupAccess?.createProject ?? false}
          onChange={(createProject) => onGroupAccessChange({ createProject })}
        />
      )}

      <div className={styles.subServiceList}>
        {visibleSubServices.map((subService, index) => (
          <SubServiceAccordionRow
            key={subService.id}
            subService={subService}
            entry={serviceAccess.services[subService.id]}
            expanded={expandedSubServices[subService.id]}
            onExpandedChange={(expanded) => onExpandedChange(subService.id, expanded)}
            onChange={(entry) => onSubServiceChange(subService.id, entry)}
            isLast={index === visibleSubServices.length - 1}
            variant={variant}
          />
        ))}
      </div>
    </section>
  );
}
