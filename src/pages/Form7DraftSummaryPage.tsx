import { Link } from 'react-router-dom';
import { OntarioButton, OntarioPageAlert } from '@ongov/ontario-design-system-component-library-react';
import { affidavitsRequired, readForm7Draft } from '../components/form7/form7DraftStorage';
import { amendmentTypeLabel } from '../components/form7/form7Labels';
import formStyles from '../components/form7/Form7Step1.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';
import styles from './Form1DraftSummaryPage.module.scss';

export function Form7DraftSummaryPage() {
  const draft = readForm7Draft();
  const needAffidavits = affidavitsRequired(
    draft?.step2.amendmentType ?? '',
    draft?.step2.changeCooperativeName ?? 'change',
  );
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
              ? 'Your Articles of Amendment filing was submitted. A transaction summary was created for this browser session.'
              : 'Form 7 draft saved locally in this browser session.'}
          </p>

          {!draft ? (
            <OntarioPageAlert
              type="warning"
              heading="No draft found"
              content="There is no saved Form 7 draft in this session. Return to Form 7 to continue."
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
                  <dt>Co-operative</dt>
                  <dd>{draft.step1.cooperativeName}</dd>
                </div>
                <div>
                  <dt>Amendment type</dt>
                  <dd>{amendmentTypeLabel(draft.step2.amendmentType)}</dd>
                </div>
                <div>
                  <dt>Certified resolution files</dt>
                  <dd>{draft.step3.certifiedResolution.length}</dd>
                </div>
                {needAffidavits ? (
                  <div>
                    <dt>Affidavit files</dt>
                    <dd>{draft.step3.affidavits.length}</dd>
                  </div>
                ) : null}
                <div>
                  <dt>Additional files</dt>
                  <dd>{draft.step3.additional.length}</dd>
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
                href={
                  draft && draft.lastCompletedStep >= 3
                    ? '/form-7/step-4'
                    : '/form-7/step-3'
                }
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
