import { useNavigate } from 'react-router-dom';
import {
  OntarioButton,
  OntarioCallout,
  OntarioIconClock,
} from '@ongov/ontario-design-system-component-library-react';
import {
  AFFIDAVIT_OF_SOLVENCY_AMALGAMATION_URL,
  BYB_AMALGAMATION_DOCS,
  BYB_AMALGAMATION_DOCS_HEADING,
  BYB_AMALGAMATION_DOCS_INTRO,
  BYB_COOP_DETAILS_HEADING,
  BYB_COOP_DETAILS_INTRO,
  BYB_COOP_DETAILS_ITEMS,
  BYB_COST_HEADING,
  BYB_COST_INTRO,
  BYB_ESTIMATED_TIME,
  BYB_ESTIMATED_TIME_HEADING,
  BYB_FORM_ACT_LINE,
  BYB_FORM_TITLE_LINES,
  BYB_INTRO,
  BYB_NAICS_LINK_LABEL,
  BYB_NAICS_NOTE,
  BYB_NAICS_URL,
  BYB_NAME_HEADING,
  BYB_NAME_INTRO,
  BYB_NAME_ITEMS,
  BYB_NUANS_INSTRUCTION,
  BYB_NUANS_SITE_LABEL,
  BYB_NUANS_SITE_URL,
} from './form10BeforeYouBeginContent';
import styles from './Form10BeforeYouBegin.module.scss';

export function Form10BeforeYouBegin() {
  const navigate = useNavigate();

  function handleStartApplication() {
    navigate('/form-10/step-1');
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

          <section
            className={styles.section}
            aria-labelledby="byb-coop-details-heading"
          >
            <h2
              id="byb-coop-details-heading"
              className={`ontario-h2 ${styles.sectionHeading}`}
            >
              {BYB_COOP_DETAILS_HEADING}
            </h2>
            <p className={styles.sectionIntro}>{BYB_COOP_DETAILS_INTRO}</p>
            <ul className={styles.bulletList}>
              {BYB_COOP_DETAILS_ITEMS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className={styles.sectionIntro}>
              {BYB_NAICS_NOTE}{' '}
              <a
                href={BYB_NAICS_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                {BYB_NAICS_LINK_LABEL}
              </a>
              .
            </p>
          </section>

          <section className={styles.section} aria-labelledby="byb-name-heading">
            <h2
              id="byb-name-heading"
              className={`ontario-h2 ${styles.sectionHeading}`}
            >
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
            aria-labelledby="byb-amalgamation-docs-heading"
          >
            <h2
              id="byb-amalgamation-docs-heading"
              className={`ontario-h2 ${styles.sectionHeading}`}
            >
              {BYB_AMALGAMATION_DOCS_HEADING}
            </h2>
            <p className={styles.sectionIntro}>{BYB_AMALGAMATION_DOCS_INTRO}</p>
            <ul className={styles.bulletList}>
              {BYB_AMALGAMATION_DOCS.map((item, index) => (
                <li key={item.text ?? item.linkLabel ?? index}>
                  {item.text ? (
                    item.text
                  ) : (
                    <>
                      {item.beforeLink}
                      <a
                        href={AFFIDAVIT_OF_SOLVENCY_AMALGAMATION_URL}
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
            <h2
              id="byb-cost-heading"
              className={`ontario-h2 ${styles.sectionHeading}`}
            >
              {BYB_COST_HEADING}
            </h2>
            <p className={styles.sectionIntro}>{BYB_COST_INTRO}</p>
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
