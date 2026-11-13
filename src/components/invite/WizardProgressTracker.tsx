import { OntarioStepIndicator } from '@ongov/ontario-design-system-component-library-react';
import { INVITE_STEP_COUNT } from './inviteWizardContent';
import styles from './InviteUserWizard.module.scss';

type WizardProgressTrackerProps = {
  currentStep: number;
  numberOfSteps?: number;
  onBack: () => void;
};

export function WizardProgressTracker({
  currentStep,
  numberOfSteps = INVITE_STEP_COUNT,
  onBack,
}: WizardProgressTrackerProps) {
  return (
    <div className={styles.stepIndicator}>
      <OntarioStepIndicator
        showBackButton
        currentStep={currentStep}
        numberOfSteps={numberOfSteps}
        customOnClick={() => {
          onBack();
        }}
      />
    </div>
  );
}
