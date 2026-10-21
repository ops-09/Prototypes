import { useNavigate } from 'react-router-dom';
import { OntarioButton } from '@ongov/ontario-design-system-component-library-react';
import {
  BYB_ABOUT_BODY,
  BYB_ABOUT_HEADING,
  BYB_DOCUMENTS,
  BYB_DOCUMENTS_FORMAT_INTRO,
  BYB_DOCUMENTS_FORMAT_ITEMS,
  BYB_DOCUMENTS_HEADING,
  BYB_DOCUMENTS_INTRO,
  BYB_FORM_ACT_LINE,
  BYB_FORM_TITLE_LINES,
  BYB_INTRO,
  BYB_NAME_HEADING,
  BYB_NAME_INTRO,
  BYB_NAME_ITEMS,
  BYB_NUANS_INSTRUCTION,
  BYB_NUANS_SITE_LABEL,
  BYB_NUANS_SITE_URL,
  BYB_START_HEADING,
  BYB_START_INTRO,
  BYB_START_ITEMS,
  BYB_STEPS,
  BYB_STEPS_HEADING,
  BYB_STEPS_INTRO,
  BYB_SUBMIT_HEADING,
  BYB_SUBMIT_INTRO,
  BYB_SUBMIT_ITEMS,
} from './form3BeforeYouBeginContent';
import styles from './Form3BeforeYouBegin.module.scss';

export function Form3BeforeYouBegin() {
  const navigate = useNavigate();

  function handleStartApplication() {
    navigate('/form-3/step-1');
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
        <h1 className={`ontario-h1 ${styles.pageTitle}`}>
          {BYB_FORM_TITLE_LINES.map((line) => (
            <span key={line} className={styles.pageTitleLine}>
              {line}
            </span>
          ))}
        </h1>
        <p className={styles.formAct}>{BYB_FORM_ACT_LINE}</p>
        <p className={styles.lead}>{BYB_INTRO}</p>

        <div className={styles.stack}>
          <section className={styles.section} aria-labelledby="byb-about-heading">
            <h2 id="byb-about-heading" className={`ontario-h2 ${styles.sectionHeading}`}>
              {BYB_ABOUT_HEADING}
            </h2>
            <p className={styles.sectionIntro}>{BYB_ABOUT_BODY}</p>
          </section>

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

          <section className={styles.section} aria-labelledby="byb-start-heading">
            <h2 id="byb-start-heading" className={`ontario-h2 ${styles.sectionHeading}`}>
              {BYB_START_HEADING}
            </h2>
            <p className={styles.sectionIntro}>{BYB_START_INTRO}</p>
            <ul className={styles.bulletList}>
              {BYB_START_ITEMS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className={styles.section} aria-labelledby="byb-name-heading">
            <h2 id="byb-name-heading" className={`ontario-h2 ${styles.sectionHeading}`}>
              {BYB_NAME_HEADING}
            </h2>
            <p className={styles.sectionIntro}>{BYB_NAME_INTRO}</p>
            <ul className={styles.bulletList}>
              {BYB_NAME_ITEMS.map((item) => (
                <li key={item}>{item}</li>
              ))}
              <li>
                {BYB_NUANS_INSTRUCTION}{' '}
                <a
                  href={BYB_NUANS_SITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {BYB_NUANS_SITE_LABEL}
                </a>
                .
              </li>
            </ul>
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
            <ul className={styles.bulletList}>
              {BYB_DOCUMENTS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className={styles.sectionIntro}>{BYB_DOCUMENTS_FORMAT_INTRO}</p>
            <ul className={styles.bulletList}>
              {BYB_DOCUMENTS_FORMAT_ITEMS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className={styles.section} aria-labelledby="byb-submit-heading">
            <h2
              id="byb-submit-heading"
              className={`ontario-h2 ${styles.sectionHeading}`}
            >
              {BYB_SUBMIT_HEADING}
            </h2>
            <p className={styles.sectionIntro}>{BYB_SUBMIT_INTRO}</p>
            <ul className={styles.bulletList}>
              {BYB_SUBMIT_ITEMS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <div className={styles.buttonGroup}>
            <OntarioButton
              type="primary"
              htmlType="button"
              label="Start Application"
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
