import { useNavigate } from 'react-router-dom';
import {
  OntarioButton,
  OntarioStepIndicator,
} from '@ongov/ontario-design-system-component-library-react';
import {
  CONTINUANCE_TOTAL_STEPS,
  type ContinuanceFormId,
} from './continuanceDraftStorage';
import styles from '../form2/Form2Step1.module.scss';

type ContinuanceStepPlaceholderProps = {
  formId: ContinuanceFormId;
  currentStep: number;
};

export function ContinuanceStepPlaceholder({
  formId,
  currentStep,
}: ContinuanceStepPlaceholderProps) {
  const navigate = useNavigate();
  const backHref = currentStep <= 2 ? `/form-${formId}` : `/form-${formId}/step-${currentStep - 1}`;

  function handleCancel() {
    const leave = window.confirm('Leave this filing without saving further changes?');
    if (leave) {
      navigate('/');
    }
  }

  return (
    <>
      <div className={styles.stepIndicator}>
        <OntarioStepIndicator
          showBackButton
          backButtonUrl={backHref}
          currentStep={currentStep}
          numberOfSteps={CONTINUANCE_TOTAL_STEPS}
        />
      </div>
      <div className="ontario-row">
        <div className="ontario-columns ontario-small-12 ontario-medium-8">
          <h1 className={`ontario-h1 ${styles.pageTitle}`}>Next step</h1>
          <p className={styles.lead}>
            This step will be added when the next Form {formId} story is provided.
          </p>
          <div className={styles.buttonGroup}>
            <OntarioButton
              type="secondary"
              htmlType="button"
              label="Save as draft"
              href={`/form-${formId}/draft-summary`}
            />
            <OntarioButton
              type="tertiary"
              htmlType="button"
              label="Cancel"
              onClick={handleCancel}
            />
          </div>
        </div>
      </div>
    </>
  );
}
