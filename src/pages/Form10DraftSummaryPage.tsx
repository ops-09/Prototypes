import { Link } from 'react-router-dom';
import { OntarioButton, OntarioPageAlert } from '@ongov/ontario-design-system-component-library-react';
import { readForm10Draft } from '../components/form10/form10DraftStorage';
import formStyles from '../components/form10/Form10Step1.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';
import styles from './Form10DraftSummaryPage.module.scss';

export function Form10DraftSummaryPage() {
  const draft = readForm10Draft();
  const submitted = draft?.savedAs === 'submitted';
  const coopCount = draft?.step2.amalgamatingCooperatives.length ?? 0;
  const agreementCount =
    draft?.step3.documentsByCooperative.reduce(
      (sum, row) => sum + row.certifiedAgreement.length,
      0,
    ) ?? 0;
  const affidavitCount =
    draft?.step3.documentsByCooperative.reduce(
      (sum, row) => sum + row.affidavits.length,
      0,
    ) ?? 0;

  const continueHref =
    draft && draft.lastCompletedStep >= 3
      ? '/form-10/step-5'
      : draft && draft.lastCompletedStep >= 2
        ? '/form-10/step-4'
        : '/form-10/step-3';

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
              ? 'Your Articles of Amalgamation filing was submitted. A transaction summary was created for this browser session.'
              : 'Form 10 draft saved locally in this browser session.'}
          </p>

          {!draft ? (
            <OntarioPageAlert
              type="warning"
              heading="No draft found"
              content="There is no saved Form 10 draft in this session. Return to Form 10 to continue."
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
                  <dt>Primary co-operative</dt>
                  <dd>{draft.step1.cooperativeName || '—'}</dd>
                </div>
                <div>
                  <dt>Type of co-operative</dt>
                  <dd>{draft.step1.cooperativeType || '—'}</dd>
                </div>
                <div>
                  <dt>Amalgamating co-operatives</dt>
                  <dd>{coopCount}</dd>
                </div>
                <div>
                  <dt>Certified amalgamation agreements</dt>
                  <dd>{agreementCount}</dd>
                </div>
                <div>
                  <dt>Affidavits of solvency</dt>
                  <dd>{affidavitCount}</dd>
                </div>
                <div>
                  <dt>Members’ approval dates</dt>
                  <dd>
                    {draft.step2.amalgamatingCooperatives
                      .map((coop) => coop.membersApprovalDate || '—')
                      .join(', ') || '—'}
                  </dd>
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
                href={continueHref}
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
