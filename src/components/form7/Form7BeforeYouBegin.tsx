import { useNavigate } from 'react-router-dom';
import { OntarioButton } from '@ongov/ontario-design-system-component-library-react';
import { BeforeYouBeginChecklistList } from '../shared/BeforeYouBeginChecklistList';
import { BeforeYouBeginContactSection } from '../shared/BeforeYouBeginContactSection';
import { BeforeYouBeginPaymentSection } from '../shared/BeforeYouBeginPaymentSection';
import { BeforeYouBeginPreamble } from '../shared/BeforeYouBeginPreamble';
import {
  BYB_INSTRUCTIONS_HEADING,
  BYB_INSTRUCTIONS_INTRO,
  BYB_NAVIGATION_INSTRUCTIONS,
} from '../shared/beforeYouBeginSharedContent';
import {
  BYB_PAYMENT_ITEMS,
  BYB_PAYMENT_LEAD_TEXT,
  BYB_DOCUMENTS,
  BYB_DOCUMENTS_HEADING,
  BYB_DOCUMENTS_INTRO,
  BYB_ESTIMATED_TIME,
  BYB_FORM_NAME,
  BYB_STEPS,
  BYB_STEPS_HEADING,
  BYB_STEPS_INTRO,
} from './form7BeforeYouBeginContent';
import styles from './Form7BeforeYouBegin.module.scss';

export function Form7BeforeYouBegin() {
  const navigate = useNavigate();

  function handleStartApplication() {
    navigate('/form-7/step-1');
  }

  function handleCancel() {
    const leave = window.confirm(
      'Leave this filing without saving further changes?',
    );
    if (leave) {
      navigate('/');
    }
  }

  return (
    <div className="ontario-row">
      <div className="ontario-columns ontario-small-12 ontario-medium-8">
        <BeforeYouBeginPreamble
          formName={BYB_FORM_NAME}
          estimatedTime={BYB_ESTIMATED_TIME}
        />

        <div className={styles.stack}>
          <section className={styles.section} aria-labelledby="byb-steps-heading">
            <h2 id="byb-steps-heading" className={`ontario-h2 ${styles.sectionHeading}`}>
              {BYB_STEPS_HEADING}
            </h2>
            <p className={styles.sectionIntro}>{BYB_STEPS_INTRO}</p>
            <ol className={styles.stepsList}>
              {BYB_STEPS.map((step) => (
                <li key={step.title} className={styles.stepItem}>
                  <div className={styles.stepMarker} aria-hidden="true">
                    <span className={`ontario-h2 ${styles.stepNumber}`} />
                  </div>
                  <div className={styles.stepBody}>
                    <h5 className={`ontario-h5 ${styles.stepTitle}`}>{step.title}</h5>
                    <p className={styles.stepDescription}>{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section
            className={styles.section}
            aria-labelledby="byb-documents-heading"
          >
            <h2
              id="byb-documents-heading"
              className={`ontario-h2 ${styles.sectionHeading}`}
            >
              {BYB_DOCUMENTS_HEADING}
            </h2>
            <p className={styles.sectionIntro}>{BYB_DOCUMENTS_INTRO}</p>
            <BeforeYouBeginChecklistList
              items={BYB_DOCUMENTS}
              className={styles.bulletList}
            />
          </section>

          <BeforeYouBeginPaymentSection
            lead={BYB_PAYMENT_LEAD_TEXT}
            items={BYB_PAYMENT_ITEMS}
          />

          <section
            className={styles.section}
            aria-labelledby="byb-instructions-heading"
          >
            <h2
              id="byb-instructions-heading"
              className={`ontario-h2 ${styles.sectionHeading}`}
            >
              {BYB_INSTRUCTIONS_HEADING}
            </h2>
            <p className={styles.sectionIntro}>{BYB_INSTRUCTIONS_INTRO}</p>
            <ul className={styles.bulletList}>
              {BYB_NAVIGATION_INSTRUCTIONS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <BeforeYouBeginContactSection />

          <div className={styles.buttonGroup}>
            <OntarioButton
              type="primary"
              htmlType="button"
              label="Continue"
              onClick={handleStartApplication}
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
    </div>
  );
}
