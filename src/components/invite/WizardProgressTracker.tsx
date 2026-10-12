import { INVITE_STEP_COUNT } from './inviteWizardContent';
import styles from './InviteUserWizard.module.scss';

type WizardProgressTrackerProps = {
  currentStep: number;
  numberOfSteps?: number;
};

// OntarioStepIndicator uses an inline-block host, so its divider cannot span the step panel width.
export function WizardProgressTracker({
  currentStep,
  numberOfSteps = INVITE_STEP_COUNT,
}: WizardProgressTrackerProps) {
  return (
    <div className={styles.stepIndicatorHost} aria-label="Form progress">
      <div className={`${styles.stepIndicatorRow} ${styles.stepIndicatorRowEnd}`}>
        <span className={`ontario-h4 ${styles.stepIndicatorLabel}`}>
          Step {currentStep} of {numberOfSteps}
        </span>
      </div>
      <hr className={styles.stepIndicatorDivider} />
    </div>
  );
}
