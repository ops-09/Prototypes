import { useNavigate } from 'react-router-dom';
import {
  OntarioButton,
  OntarioCallout,
  OntarioIconClock,
} from '@ongov/ontario-design-system-component-library-react';
import {
  BYB_COST_HEADING,
  BYB_COST_INTRO,
  BYB_COST_ITEMS,
  BYB_DOCUMENTS,
  BYB_DOCUMENTS_HEADING,
  BYB_DOCUMENTS_INTRO,
  BYB_ESTIMATED_TIME,
  BYB_ESTIMATED_TIME_HEADING,
  BYB_FORM_TITLE_LINES,
  BYB_FORM3_INSTRUCTION,
  BYB_INSTRUCTIONS_HEADING,
  BYB_INSTRUCTIONS_INTRO,
  BYB_INTRO,
  BYB_NAICS_INSTRUCTION,
  BYB_NUANS_INSTRUCTION,
  BYB_NUANS_SITE_LABEL,
  BYB_NUANS_SITE_URL,
  BYB_STEPS,
  BYB_STEPS_HEADING,
  BYB_STEPS_INTRO,
} from './form1BeforeYouBeginContent';
import { DIRECTOR_CONSENT_FORM_URL } from './form1DraftStorage';
import styles from './Form1BeforeYouBegin.module.scss';

export function Form1BeforeYouBegin() {
  const navigate = useNavigate();

  function handleStartApplication() {
    navigate('/form-1/step-1');
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
          <span className={styles.pageTitleLine}>{BYB_FORM_TITLE_LINES[0]}</span>
          <span className={styles.pageTitleLine}>{BYB_FORM_TITLE_LINES[1]}</span>
        </h1>
        <p className={styles.lead}>{BYB_INTRO}</p>

        <div className={styles.stack}>
          <div className={styles.timeEstimateCallout}>
            <OntarioCallout
              headingType="h2"
              headingContent={BYB_ESTIMATED_TIME_HEADING}
              headingContentType="string"
              highlightColour="sky"
            >
              <div className={styles.timeEstimateBody}>
                <OntarioIconClock colour="black" iconWidth={24} isDecorative />
                <p className={styles.timeEstimateText}>{BYB_ESTIMATED_TIME}</p>
              </div>
            </OntarioCallout>
          </div>

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
            <ul className={styles.bulletList}>
              {BYB_DOCUMENTS.map((item, index) => (
                <li key={item.text ?? item.linkLabel ?? index}>
                  {item.text ? (
                    item.text
                  ) : (
                    <>
                      {item.beforeLink}
                      <a
                        href={DIRECTOR_CONSENT_FORM_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {item.linkLabel}
                      </a>
                      {item.afterLink}
                    </>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.section} aria-labelledby="byb-cost-heading">
            <h2 id="byb-cost-heading" className={`ontario-h2 ${styles.sectionHeading}`}>
              {BYB_COST_HEADING}
            </h2>
            <p className={styles.sectionIntro}>{BYB_COST_INTRO}</p>
            <ul className={styles.bulletList}>
              {BYB_COST_ITEMS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

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
              <li>{BYB_NAICS_INSTRUCTION}</li>
              <li>
                {BYB_FORM3_INSTRUCTION}{' '}
                <a
                  href={DIRECTOR_CONSENT_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download Form 3
                </a>
                .
              </li>
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
