import { useNavigate } from 'react-router-dom';
import { OntarioButton } from '@ongov/ontario-design-system-component-library-react';
import { BeforeYouBeginChecklistList } from '../shared/BeforeYouBeginChecklistList';
import { BeforeYouBeginPaymentSection } from '../shared/BeforeYouBeginPaymentSection';
import { BeforeYouBeginPreamble } from '../shared/BeforeYouBeginPreamble';
import {
  BYB_INSTRUCTIONS_HEADING,
  BYB_INSTRUCTIONS_INTRO,
  BYB_NAVIGATION_INSTRUCTIONS,
} from '../shared/beforeYouBeginSharedContent';
import type { ContinuanceFormId } from './continuanceDraftStorage';
import {
  BYB_DOCUMENTS,
  BYB_DOCUMENTS_HEADING,
  BYB_DOCUMENTS_INTRO,
  BYB_ESTIMATED_TIME,
  BYB_FORM_NAME,
  BYB_ONTARIO_ACTS,
  BYB_ONTARIO_ACTS_INTRO,
  BYB_OTHER_JURISDICTION,
  BYB_PAYMENT_ITEMS,
  BYB_PAYMENT_LEAD_TEXT,
  continuanceEligibilityIntro,
} from './continuanceBeforeYouBeginContent';
import styles from './ContinuanceBeforeYouBegin.module.scss';

type ContinuanceBeforeYouBeginProps = {
  formId: ContinuanceFormId;
};

/** Informational landing before the cover letter. It does not collect filing data. */
export function ContinuanceBeforeYouBegin({ formId }: ContinuanceBeforeYouBeginProps) {
  const navigate = useNavigate();

  function handleContinue() {
    navigate(`/form-${formId}/step-1`);
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
        <BeforeYouBeginPreamble
          formName={BYB_FORM_NAME[formId]}
          estimatedTime={BYB_ESTIMATED_TIME}
        />

        <div className={styles.stack}>
          <section className={styles.section} aria-label="Who can apply">
            <p className={styles.sectionIntro}>{continuanceEligibilityIntro(formId)}</p>
            <p className={styles.sectionIntro}>{BYB_OTHER_JURISDICTION}</p>
            <p className={styles.sectionIntro}>{BYB_ONTARIO_ACTS_INTRO}</p>
            <ol className={styles.numberedList}>
              {BYB_ONTARIO_ACTS.map((act) => (
                <li key={act}>{act}</li>
              ))}
            </ol>
          </section>

          <section className={styles.section} aria-labelledby="byb-documents-heading">
            <h2 id="byb-documents-heading" className={`ontario-h2 ${styles.sectionHeading}`}>
              {BYB_DOCUMENTS_HEADING}
            </h2>
            <p className={styles.sectionIntro}>{BYB_DOCUMENTS_INTRO}</p>
            <BeforeYouBeginChecklistList items={BYB_DOCUMENTS} className={styles.bulletList} />
          </section>

          <BeforeYouBeginPaymentSection lead={BYB_PAYMENT_LEAD_TEXT} items={BYB_PAYMENT_ITEMS} />

          <section className={styles.section} aria-labelledby="byb-instructions-heading">
            <h2 id="byb-instructions-heading" className={`ontario-h2 ${styles.sectionHeading}`}>
              {BYB_INSTRUCTIONS_HEADING}
            </h2>
            <p className={styles.sectionIntro}>{BYB_INSTRUCTIONS_INTRO}</p>
            <ul className={styles.bulletList}>
              {BYB_NAVIGATION_INSTRUCTIONS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <div className={styles.buttonGroup}>
            <OntarioButton
              type="primary"
              htmlType="button"
              label="Continue"
              onClick={handleContinue}
            />
            <OntarioButton type="tertiary" htmlType="button" label="Cancel" onClick={handleCancel} />
          </div>
        </div>
      </div>
    </div>
  );
}
