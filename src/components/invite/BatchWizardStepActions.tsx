import {
  OntarioButton,
  OntarioIconAddAlt,
  OntarioIconChevronLeft,
  OntarioIconChevronRight,
} from '@ongov/ontario-design-system-component-library-react';
import { getRoleById } from '../../rbac/roles';
import type { BatchCustomInviteStep, BatchInviteMode, BatchInviteStep, RoleId } from '../../rbac/types';
import styles from './InviteUserWizard.module.scss';

type BatchWizardStepActionsProps = {
  mode: BatchInviteMode;
  currentStep: BatchInviteStep | BatchCustomInviteStep;
  totalSteps: number;
  roleId: RoleId | '';
  inviteCount: number;
  onNext: () => void;
  onBack: () => void;
  onSubmit: () => void;
  onCancel: () => void;
};

export function BatchWizardStepActions({
  mode,
  currentStep,
  totalSteps,
  roleId,
  inviteCount,
  onNext,
  onBack,
  onSubmit,
  onCancel,
}: BatchWizardStepActionsProps) {
  const isReviewStep = currentStep === totalSteps;
  const roleNextLabel = roleId
    ? getRoleById(roleId)?.skipsServiceAccess
      ? 'Next: review'
      : 'Next: service access'
    : 'Next: service access';

  const nextLabel =
    currentStep === 1
      ? 'Next: assign role'
      : mode === 'same' && currentStep === 2
        ? roleNextLabel
        : mode === 'same' && currentStep === 3
          ? 'Next: review'
          : mode === 'custom' && currentStep === 2
            ? 'Next: review'
            : 'Next';

  const secondaryLabel = currentStep > 1 ? 'Back' : 'Cancel';
  const secondaryAction = currentStep > 1 ? onBack : onCancel;

  return (
    <div className={styles.wizardStickyActions}>
      {!isReviewStep && (
        <>
          <OntarioButton
            key={`batch-next-${currentStep}-${nextLabel}`}
            type="primary"
            htmlType="button"
            label={nextLabel}
            onClick={onNext}
          >
            <OntarioIconChevronRight colour="white" />
          </OntarioButton>
          <OntarioButton
            key={`batch-secondary-${currentStep}-${secondaryLabel}`}
            type="secondary"
            htmlType="button"
            label={secondaryLabel}
            onClick={secondaryAction}
          >
            {currentStep > 1 && <OntarioIconChevronLeft colour="black" />}
          </OntarioButton>
        </>
      )}

      {isReviewStep && (
        <>
          <OntarioButton
            key="batch-review-submit"
            type="primary"
            htmlType="button"
            label={`Send ${inviteCount} invitation${inviteCount === 1 ? '' : 's'}`}
            onClick={() => void onSubmit()}
          >
            <OntarioIconAddAlt colour="white" />
          </OntarioButton>
          <OntarioButton
            key="batch-review-back"
            type="secondary"
            htmlType="button"
            label="Back"
            onClick={onBack}
          >
            <OntarioIconChevronLeft colour="black" />
          </OntarioButton>
        </>
      )}
    </div>
  );
}
