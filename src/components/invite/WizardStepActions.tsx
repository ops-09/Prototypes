import {
  OntarioButton,
  OntarioIconAddAlt,
  OntarioIconChevronLeft,
  OntarioIconChevronRight,
} from '@ongov/ontario-design-system-component-library-react';
import type { InviteWizardVersion } from '../../config/inviteWizardVersion';
import type { InviteStep, RoleId } from '../../rbac/types';
import styles from './InviteUserWizard.module.scss';
import { getInviteBackStepLabel, getInviteNextStepLabel } from './inviteWizardContent';

type WizardStepActionsProps = {
  wizardVersion: InviteWizardVersion;
  currentStep: InviteStep;
  reviewStep: InviteStep;
  roleId: RoleId | '';
  onNextFromEmail: () => void;
  onNextFromRole: () => void;
  onNextFromProvision: () => void;
  onNextFromServiceAccess: () => void;
  onNextFromPermissions: () => void;
  onSubmit: () => void;
  onBackFromRole: () => void;
  onBackFromProvision: () => void;
  onBackFromServiceAccess: () => void;
  onBackFromPermissions: () => void;
  onBackFromReview: () => void;
  onCancel: () => void;
};

function getNextHandler(
  wizardVersion: InviteWizardVersion,
  currentStep: InviteStep,
  handlers: Pick<
    WizardStepActionsProps,
    | 'onNextFromEmail'
    | 'onNextFromRole'
    | 'onNextFromProvision'
    | 'onNextFromServiceAccess'
    | 'onNextFromPermissions'
  >,
) {
  switch (currentStep) {
    case 1:
      return handlers.onNextFromEmail;
    case 2:
      return handlers.onNextFromRole;
    case 3:
      return wizardVersion === 'v1'
        ? handlers.onNextFromServiceAccess
        : handlers.onNextFromProvision;
    case 4:
      return wizardVersion === 'v2' ? handlers.onNextFromPermissions : undefined;
    default:
      return undefined;
  }
}

function getBackHandler(
  wizardVersion: InviteWizardVersion,
  currentStep: InviteStep,
  handlers: Pick<
    WizardStepActionsProps,
    | 'onBackFromRole'
    | 'onBackFromProvision'
    | 'onBackFromServiceAccess'
    | 'onBackFromPermissions'
  >,
) {
  switch (currentStep) {
    case 2:
      return handlers.onBackFromRole;
    case 3:
      return wizardVersion === 'v1'
        ? handlers.onBackFromServiceAccess
        : handlers.onBackFromProvision;
    case 4:
      return wizardVersion === 'v2' ? handlers.onBackFromPermissions : undefined;
    default:
      return undefined;
  }
}

export function WizardStepActions({
  wizardVersion,
  currentStep,
  reviewStep,
  roleId,
  onNextFromEmail,
  onNextFromRole,
  onNextFromProvision,
  onNextFromServiceAccess,
  onNextFromPermissions,
  onSubmit,
  onBackFromRole,
  onBackFromProvision,
  onBackFromServiceAccess,
  onBackFromPermissions,
  onBackFromReview,
  onCancel,
}: WizardStepActionsProps) {
  const nextStepLabel = getInviteNextStepLabel(wizardVersion, currentStep, roleId);
  const backStepLabel = getInviteBackStepLabel(wizardVersion, currentStep, reviewStep, roleId);
  const onNext = getNextHandler(wizardVersion, currentStep, {
    onNextFromEmail,
    onNextFromRole,
    onNextFromProvision,
    onNextFromServiceAccess,
    onNextFromPermissions,
  });
  const onBack = getBackHandler(wizardVersion, currentStep, {
    onBackFromRole,
    onBackFromProvision,
    onBackFromServiceAccess,
    onBackFromPermissions,
  });

  if (currentStep === reviewStep && roleId) {
    const reviewBackLabel = backStepLabel ?? 'Back';

    return (
      <div className={styles.wizardStickyActions}>
        <OntarioButton
          key={`review-submit-${currentStep}`}
          type="primary"
          htmlType="button"
          label="Add user"
          onClick={() => void onSubmit()}
        >
          <OntarioIconAddAlt colour="white" />
        </OntarioButton>
        <OntarioButton
          key={`review-back-${reviewBackLabel}`}
          type="secondary"
          htmlType="button"
          label={reviewBackLabel}
          onClick={onBackFromReview}
        >
          <OntarioIconChevronLeft colour="black" />
        </OntarioButton>
      </div>
    );
  }

  if (!nextStepLabel || !onNext) {
    return null;
  }

  const secondaryLabel = onBack ? (backStepLabel ?? 'Back') : 'Cancel';
  const secondaryAction = onBack ?? onCancel;

  return (
    <div className={styles.wizardStickyActions}>
      <OntarioButton
        key={`next-${currentStep}-${nextStepLabel}`}
        type="primary"
        htmlType="button"
        label={nextStepLabel}
        onClick={onNext}
      >
        <OntarioIconChevronRight colour="white" />
      </OntarioButton>
      <OntarioButton
        key={`secondary-${currentStep}-${secondaryLabel}`}
        type="secondary"
        htmlType="button"
        label={secondaryLabel}
        onClick={secondaryAction}
      >
        {onBack && <OntarioIconChevronLeft colour="black" />}
      </OntarioButton>
    </div>
  );
}
