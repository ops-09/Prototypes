import { useNavigate } from 'react-router-dom';
import { OntarioButton } from '@ongov/ontario-design-system-component-library-react';
import {
  CONTINUANCE_FILING_TITLE,
  type ContinuanceFormId,
} from './continuanceDraftStorage';
import styles from '../form2/Form2BeforeYouBegin.module.scss';

type ContinuanceInstructionsProps = {
  formId: ContinuanceFormId;
};

export function ContinuanceInstructions({ formId }: ContinuanceInstructionsProps) {
  const navigate = useNavigate();
  const title = CONTINUANCE_FILING_TITLE[formId];

  function handleContinue() {
    navigate(`/form-${formId}/step-2`);
  }

  function handleCancel() {
    const leave = window.confirm('Leave this filing without saving further changes?');
    if (leave) {
      navigate('/');
    }
  }

  return (
    <div className="ontario-row">
      <div className="ontario-columns ontario-small-12 ontario-medium-8">
        <h1 className={`ontario-h1 ${styles.pageTitle}`}>
          <span className={styles.pageTitleLine}>{title}</span>
        </h1>
        <p className={styles.formAct}>Co-operative Corporations Act — Form {formId}</p>
        <p className={styles.lead}>
          Instructions for this filing will be added as later stories are provided. Continue to
          Step 2 to enter the co-operative’s type, primary activity, and official email.
        </p>
        <div className={styles.buttonGroup}>
          <OntarioButton
            type="primary"
            htmlType="button"
            label="Continue"
            onClick={handleContinue}
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
  );
}
