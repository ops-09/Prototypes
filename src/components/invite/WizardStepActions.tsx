import {
  OntarioButton,
  OntarioIconChevronLeft,
  OntarioIconChevronRight,
} from '@ongov/ontario-design-system-component-library-react';
import {
  usesV2InviteSteps,
  usesV4InviteSteps,
  type InviteWizardVersion,
} from '../../config/inviteWizardVersion';
import type { InviteStep, RoleId } from '../../rbac/types';
import styles from './InviteUserWizard.module.scss';
import {
  getInviteBackStepLabel,
  getInviteNextStepLabel,
  type InviteStepCountOptions,
} from './inviteWizardContent';

type WizardStepActionsProps = {
  wizardVersion: InviteWizardVersion;
  currentStep: InviteStep;
  reviewStep: InviteStep;
  roleId: RoleId | '';
  pathOptions?: InviteStepCountOptions;
  onNextFromEmail: () => void;
  onNextFromRole: () => void;
  onNextFromProvision: () => void;
  onNextFromServiceAccess: () => void;
  onNextFromPermissions: () => void;
  onV4Next?: () => void;
  onSubmit: () => void;
  onBackFromRole: () => void;
  onBackFromProvision: () => void;
  onBackFromServiceAccess: () => void;
  onBackFromPermissions: () => void;
  onV4Back?: () => void;
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
    | 'onV4Next'
  >,
) {
  if (usesV4InviteSteps(wizardVersion)) {
    return handlers.onV4Next;
  }

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
      return usesV2InviteSteps(wizardVersion) ? handlers.onNextFromPermissions : undefined;
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
    | 'onV4Back'
  >,
) {
  if (usesV4InviteSteps(wizardVersion)) {
    return currentStep > 1 ? handlers.onV4Back : undefined;
  }

  switch (currentStep) {
    case 2:
      return handlers.onBackFromRole;
    case 3:
      return wizardVersion === 'v1'
        ? handlers.onBackFromServiceAccess
        : handlers.onBackFromProvision;
    case 4:
      return usesV2InviteSteps(wizardVersion) ? handlers.onBackFromPermissions : undefined;
    default:
      return undefined;
  }
}

export function WizardStepActions({
  wizardVersion,
  currentStep,
  reviewStep,
  roleId,
  pathOptions = {},
  onNextFromEmail,
  onNextFromRole,
  onNextFromProvision,
  onNextFromServiceAccess,
  onNextFromPermissions,
  onV4Next,
  onSubmit,
  onBackFromRole,
  onBackFromProvision,
  onBackFromServiceAccess,
  onBackFromPermissions,
  onV4Back,
  onBackFromReview,
  onCancel,
}: WizardStepActionsProps) {
  const nextStepLabel = getInviteNextStepLabel(
    wizardVersion,
    currentStep,
    roleId,
    pathOptions,
  );
  const backStepLabel = getInviteBackStepLabel(
    wizardVersion,
    currentStep,
    reviewStep,
    roleId,
    pathOptions,
  );
  const onNext = getNextHandler(wizardVersion, currentStep, {
    onNextFromEmail,
    onNextFromRole,
    onNextFromProvision,
    onNextFromServiceAccess,
    onNextFromPermissions,
    onV4Next,
  });
  const onBack = getBackHandler(wizardVersion, currentStep, {
    onBackFromRole,
    onBackFromProvision,
    onBackFromServiceAccess,
    onBackFromPermissions,
    onV4Back,
  });

  if (currentStep === reviewStep && roleId) {
    const reviewBackLabel = backStepLabel ?? 'Back';

    return (
      <div className={styles.wizardStickyActions}>
        <OntarioButton
          key={`review-submit-${currentStep}`}
          type="primary"
          htmlType="button"
          label="Send invite"
          onClick={() => void onSubmit()}
        />
        <OntarioButton
          key={`review-back-${reviewBackLabel}`}
          type="secondary"
          htmlType="button"
          label="Back"
          onClick={onBackFromReview}
        />
        <OntarioButton
          key={`review-cancel-${currentStep}`}
          type="tertiary"
          htmlType="button"
          label="Cancel"
          onClick={onCancel}
        />
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
