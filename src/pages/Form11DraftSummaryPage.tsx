import { Link } from 'react-router-dom';
import { OntarioButton, OntarioPageAlert } from '@ongov/ontario-design-system-component-library-react';
import { OBR_CORPORATION_NAME, readForm11Draft } from '../components/form11/form11DraftStorage';
import formStyles from '../components/form11/Form11Step2.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';
import styles from './Form11DraftSummaryPage.module.scss';

export function Form11DraftSummaryPage() {
  const draft = readForm11Draft();
  const submitted = draft?.savedAs === 'submitted';

  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <div className="ontario-row">
        <div className="ontario-columns ontario-small-12 ontario-medium-8">
          <h1 className={`ontario-h1 ${formStyles.pageTitle}`}>
            {submitted ? 'Filing submitted' : 'Transaction summary'}
          </h1>
          <p className={formStyles.lead}>
            {submitted
              ? 'Your Application for Letters Patent of Amalgamation was submitted. A transaction summary was created for this browser session.'
              : 'Form 11 draft saved locally in this browser session.'}
          </p>

          {!draft ? (
            <OntarioPageAlert
              type="warning"
              heading="No draft found"
              content="There is no saved Form 11 draft in this session. Return to Form 11 to continue."
            />
          ) : (
            <>
              <OntarioPageAlert
                type="success"
                heading={submitted ? 'Submission recorded' : 'Draft saved'}
                content={
                  submitted && draft.confirmationNumber
                    ? `Confirmation number ${draft.confirmationNumber}. Saved at ${new Date(draft.savedAt).toLocaleString()}.`
                    : `Saved at ${new Date(draft.savedAt).toLocaleString()} (mode: ${draft.savedAs}).`
                }
              />

              <dl className={styles.summaryList}>
                {draft.confirmationNumber ? (
                  <div>
                    <dt>Confirmation number</dt>
                    <dd>{draft.confirmationNumber}</dd>
                  </div>
                ) : null}
                <div>
                  <dt>Corporation</dt>
                  <dd>{OBR_CORPORATION_NAME}</dd>
                </div>
                <div>
                  <dt>Primary activity</dt>
                  <dd>{draft.step2.primaryActivity || '—'}</dd>
                </div>
                <div>
                  <dt>Official email</dt>
                  <dd>{draft.step2.email || '—'}</dd>
                </div>
              </dl>
            </>
          )}

          <div className={formStyles.buttonGroup}>
            {!submitted ? (
              <OntarioButton
                type="primary"
                htmlType="button"
                label="Continue filing"
                href="/form-11/step-2"
              />
            ) : null}
            <Link className={styles.homeLink} to="/">
              Back to playground
            </Link>
          </div>
        </div>
      </div>
    </PlaygroundShell>
  );
}
