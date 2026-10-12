import {
  OntarioIconChevronDown,
  OntarioIconChevronUp,
} from '@ongov/ontario-design-system-component-library-react';
import type { ServiceAccessEntry } from '../../rbac/types';
import type { SubServiceDefinition } from '../../rbac/services';
import { AccessToggle } from './AccessToggle';
import { ProjectPermissionsTable } from './ProjectPermissionsTable';
import styles from './InviteUserWizard.module.scss';

export type ServiceAccessVariant = 'provision' | 'permissions' | 'full';

type SubServiceAccordionRowProps = {
  subService: SubServiceDefinition;
  entry: ServiceAccessEntry;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  onChange: (entry: ServiceAccessEntry) => void;
  isLast: boolean;
  variant?: ServiceAccessVariant;
};

export function SubServiceAccordionRow({
  subService,
  entry,
  expanded,
  onExpandedChange,
  onChange,
  isLast,
  variant = 'full',
}: SubServiceAccordionRowProps) {
  const panelId = `sub-service-panel-${subService.id}`;
  const hasProjects = subService.projects.length > 0;
  const showExpandControl = variant === 'full';
  const showToggle = variant === 'full';
  const showPermissionsPanel = variant === 'full' && expanded;

  if (variant === 'provision') {
    return (
      <div className={`${styles.subServiceRow} ${isLast ? styles.subServiceRowLast : ''}`}>
        <div className={styles.subServiceHeader}>
          <h3 className={styles.subServiceHeading}>
            <span className={styles.subServiceProvisionLabel}>{subService.label}</span>
          </h3>
          <div className={styles.subServiceToggle}>
            <AccessToggle
              enabled={entry.enabled}
              label={subService.label}
              onChange={(enabled) => onChange({ ...entry, enabled })}
            />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'permissions') {
    return (
      <div className={`${styles.subServiceRow} ${styles.subServiceRowLast}`}>
        <div id={panelId} className={styles.subServiceBody}>
          {!hasProjects && (
            <p className={styles.subServiceMessage}>
              Project permissions for this service are not available yet.
            </p>
          )}

          {hasProjects && (
            <ProjectPermissionsTable
              projects={subService.projects}
              projectPermissions={entry.projectPermissions}
              namePrefix={subService.id}
              onPermissionChange={(projectId, permission) =>
                onChange({
                  ...entry,
                  projectPermissions: {
                    ...entry.projectPermissions,
                    [projectId]: permission,
                  },
                })
              }
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.subServiceRow} ${isLast ? styles.subServiceRowLast : ''}`}>
      <div
        className={`${styles.subServiceHeader} ${expanded ? styles.subServiceHeaderExpanded : ''}`}
      >
        <h3
          className={`${styles.subServiceHeading} ${expanded ? styles.subServiceHeadingExpanded : ''}`}
        >
          {showExpandControl ? (
            <button
              type="button"
              className={styles.subServiceExpandButton}
              aria-expanded={expanded}
              aria-controls={panelId}
              onClick={() => onExpandedChange(!expanded)}
            >
              <span className={styles.subServiceIconClose} aria-hidden="true">
                <OntarioIconChevronUp colour="blue" iconWidth={24} isDecorative />
              </span>
              <span className={styles.subServiceIconOpen} aria-hidden="true">
                <OntarioIconChevronDown colour="blue" iconWidth={24} isDecorative />
              </span>
              {subService.label}
            </button>
          ) : (
            <span className={styles.subServiceProvisionLabel}>{subService.label}</span>
          )}
        </h3>

        {showToggle && (
          <div className={styles.subServiceToggle}>
            <AccessToggle
              enabled={entry.enabled}
              label={subService.label}
              onChange={(enabled) => onChange({ ...entry, enabled })}
            />
          </div>
        )}
      </div>

      {showPermissionsPanel && (
        <div id={panelId} className={styles.subServiceBody}>
          {variant === 'full' && !entry.enabled && (
            <p className={styles.subServiceMessage}>Enable access to assign services</p>
          )}

          {entry.enabled && !hasProjects && (
            <p className={styles.subServiceMessage}>
              Project permissions for this service are not available yet.
            </p>
          )}

          {entry.enabled && hasProjects && (
            <ProjectPermissionsTable
              projects={subService.projects}
              projectPermissions={entry.projectPermissions}
              namePrefix={subService.id}
              onPermissionChange={(projectId, permission) =>
                onChange({
                  ...entry,
                  projectPermissions: {
                    ...entry.projectPermissions,
                    [projectId]: permission,
                  },
                })
              }
            />
          )}
        </div>
      )}
    </div>
  );
}
