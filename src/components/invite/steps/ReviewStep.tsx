import {
  OntarioButton,
  OntarioCallout,
  OntarioIconEdit,
} from '@ongov/ontario-design-system-component-library-react';
import type { ReactNode } from 'react';
import { SERVICE_GROUPS } from '../../../rbac/services';
import { formatProjectPermission, formatRoleLabel } from '../../../rbac/rbacService';
import type { InviteStep, InviteUserInput, ServiceAccess, SubServiceId } from '../../../rbac/types';
import styles from '../InviteUserWizard.module.scss';
import { formatInviteStepTitle } from '../inviteWizardContent';

type ReviewStepProps = {
  draft: InviteUserInput;
  onEditStep: (step: InviteStep) => void;
};

type ReviewSectionProps = {
  title: string;
  editLabel: string;
  onEdit: () => void;
  children: ReactNode;
};

function ReviewSection({ title, editLabel, onEdit, children }: ReviewSectionProps) {
  return (
    <div className={styles.reviewSection}>
      <div className={styles.reviewSectionHeader}>
        <h3 className={styles.reviewSectionTitle}>{title}</h3>
        <OntarioButton type="tertiary" htmlType="button" onClick={onEdit} ariaLabelText={editLabel}>
          <OntarioIconEdit colour="blue" iconWidth={24} isDecorative />
          Edit
        </OntarioButton>
      </div>
      {children}
    </div>
  );
}

function getProjectReviewRows(subServiceId: SubServiceId, serviceAccess: ServiceAccess) {
  const subService = SERVICE_GROUPS.flatMap((group) => group.subServices).find(
    (item) => item.id === subServiceId,
  );
  const entry = serviceAccess.services[subServiceId];

  if (!subService || !entry?.enabled) {
    return [];
  }

  if (subService.projects.length === 0) {
    return [{ label: 'Projects', value: 'No projects configured' }];
  }

  return subService.projects
    .filter((project) => (entry.projectPermissions[project.id] ?? 'none') !== 'none')
    .map((project) => ({
      label: project.label,
      value: formatProjectPermission(entry.projectPermissions[project.id] ?? 'none'),
    }));
}

export function ReviewStep({ draft, onEditStep }: ReviewStepProps) {
  const showServiceAccess = draft.roleId !== 'secondary_admin' && draft.serviceAccess;

  return (
    <section className={styles.stepPanel} aria-label="Review and confirm">
      <div className={styles.stepPanelHeader}>
        <h2 className={styles.stepPanelTitle}>{formatInviteStepTitle('Review & confirm')}</h2>
      </div>

      <ReviewSection
        title="User details"
        editLabel="Edit user details"
        onEdit={() => onEditStep(1)}
      >
        <div className={styles.reviewRow}>
          <span className={styles.reviewLabel}>Email</span>
          <span className={styles.reviewValue}>{draft.email}</span>
        </div>
      </ReviewSection>

      <ReviewSection
        title="Role"
        editLabel="Edit role"
        onEdit={() => onEditStep(2)}
      >
        <div className={styles.reviewRow}>
          <span className={styles.reviewLabel}>Assigned role</span>
          <span className={styles.reviewValue}>{formatRoleLabel(draft.roleId)}</span>
        </div>
      </ReviewSection>

      {showServiceAccess &&
        SERVICE_GROUPS.map((group) => {
          const enabledSubServices = group.subServices.filter(
            (subService) => draft.serviceAccess?.services[subService.id]?.enabled,
          );

          if (enabledSubServices.length === 0) {
            return null;
          }

          return (
            <ReviewSection
              key={group.id}
              title={group.label}
              editLabel={`Edit ${group.label}`}
              onEdit={() => onEditStep(3)}
            >
              {enabledSubServices.map((subService, index) => {
                const projectRows = getProjectReviewRows(subService.id, draft.serviceAccess!);
                const showCreateProject =
                  group.supportsCreateProject &&
                  draft.serviceAccess?.groups?.[group.id]?.createProject &&
                  index === 0;

                return (
                  <div key={subService.id} className={styles.reviewSubServiceBlock}>
                    <h4 className={styles.reviewSubServiceTitle}>{subService.label}</h4>
                    {showCreateProject && (
                      <div className={styles.reviewRow}>
                        <span className={styles.reviewLabel}>Project Creation</span>
                        <span className={styles.reviewValue}>Allowed</span>
                      </div>
                    )}
                    {projectRows.map((row) => (
                      <div key={row.label} className={styles.reviewRow}>
                        <span className={styles.reviewLabel}>{row.label}</span>
                        <span className={styles.reviewValue}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </ReviewSection>
          );
        })}

      <OntarioCallout
        headingType="h3"
        headingContent="Invitation email"
        headingContentType="string"
        highlightColour="blue"
      >
        An invitation will be sent to {draft.email}. They will appear as Pending until they accept.
      </OntarioCallout>
    </section>
  );
}

export function buildInvitePayload(
  email: string,
  roleId: InviteUserInput['roleId'],
  serviceAccess: ServiceAccess,
): InviteUserInput {
  return {
    email: email.trim().toLowerCase(),
    roleId,
    serviceAccess: structuredClone(serviceAccess),
  };
}
