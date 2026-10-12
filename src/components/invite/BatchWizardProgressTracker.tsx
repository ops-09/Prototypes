import { OntarioCallout } from '@ongov/ontario-design-system-component-library-react';
import type { BatchCustomInviteStep, BatchInviteMode, BatchInviteStep } from '../../rbac/types';
import styles from './InviteUserWizard.module.scss';

const SAME_STEP_LABELS = ['Add users', 'Assign role', 'Service access', 'Review'];
const CUSTOM_STEP_LABELS = ['Add users', 'Assign access', 'Review'];

type BatchWizardProgressTrackerProps = {
  mode: BatchInviteMode;
  currentStep: BatchInviteStep | BatchCustomInviteStep;
  totalSteps: number;
};

export function BatchWizardProgressTracker({
  mode,
  currentStep,
  totalSteps,
}: BatchWizardProgressTrackerProps) {
  const labels = mode === 'same' ? SAME_STEP_LABELS : CUSTOM_STEP_LABELS;
  const completedPercent = Math.round(((currentStep - 1) / totalSteps) * 100);
  const statusLabel =
    completedPercent === 0 ? 'Not started' : `${completedPercent} percent complete`;

  return (
    <div className={styles.progressTracker}>
      <div className={styles.progressTrackerHeader}>
        <h2 className={`ontario-h5 ${styles.progressTrackerTitle}`}>Invite users</h2>
        <p className={styles.progressTrackerDescription}>
          Step {currentStep} of {totalSteps}: {labels[currentStep - 1]}
        </p>
      </div>

      <OntarioCallout
        headingType="h3"
        headingContent={statusLabel}
        headingContentType="string"
        highlightColour="blue"
      >
        {mode === 'same'
          ? 'Configure access once for everyone in this batch.'
          : 'Assign templates per user, then review before sending.'}
      </OntarioCallout>
    </div>
  );
}
