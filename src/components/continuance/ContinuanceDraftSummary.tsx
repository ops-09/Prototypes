import { Link } from 'react-router-dom';
import { OntarioButton, OntarioPageAlert } from '@ongov/ontario-design-system-component-library-react';
import { formatIsoDateDisplay } from '../form7/form7Labels';
import { formatHeadOfficeLocation } from '../shared/headOfficeFormat';
import { formatHeadOfficeAddressLine } from '../shared/OntarioHeadOfficeAddressFields';
import { formatDirectorFullName } from './ContinuanceDirectorEditor';
import {
  CONTINUANCE_FILING_TITLE,
  CONTINUANCE_STAKEHOLDER_GROUP_IDS,
  EMPTY_STEP4,
  EMPTY_STEP5,
  EMPTY_STEP6,
  EMPTY_STEP7,
  EMPTY_STEP8,
  EMPTY_STEP9,
  EMPTY_STEP10,
  OBR_CORPORATION_NAME,
  originalActLabel,
  readContinuanceDraft,
  stakeholderGroupIsEmpty,
  type ContinuanceFormId,
} from './continuanceDraftStorage';
import formStyles from '../form2/Form2Step1.module.scss';
import styles from '../../pages/Form2DraftSummaryPage.module.scss';

type ContinuanceDraftSummaryProps = {
  formId: ContinuanceFormId;
};

export function ContinuanceDraftSummary({ formId }: ContinuanceDraftSummaryProps) {
  const draft = readContinuanceDraft(formId);
  const submitted = draft?.savedAs === 'submitted';
  const title = CONTINUANCE_FILING_TITLE[formId];
  const step4 = draft?.step4 ?? EMPTY_STEP4;
  const step5 = draft?.step5 ?? EMPTY_STEP5;
  const step6 = draft?.step6 ?? EMPTY_STEP6;
  const step7 = draft?.step7 ?? EMPTY_STEP7;
  const step8 = draft?.step8 ?? EMPTY_STEP8;
  const step9 = draft?.step9 ?? EMPTY_STEP9;
  const step10 = draft?.step10 ?? EMPTY_STEP10;
  const continueHref =
    draft && draft.lastCompletedStep >= 10
      ? `/form-${formId}/step-11`
      : draft && draft.lastCompletedStep >= 9
      ? `/form-${formId}/step-10`
      : draft && draft.lastCompletedStep >= 8
      ? `/form-${formId}/step-9`
      : draft && draft.lastCompletedStep >= 7
      ? `/form-${formId}/step-8`
      : draft && draft.lastCompletedStep >= 6
      ? `/form-${formId}/step-7`
      : draft && draft.lastCompletedStep >= 5
      ? `/form-${formId}/step-6`
      : draft && draft.lastCompletedStep >= 4
        ? `/form-${formId}/step-5`
        : draft && draft.lastCompletedStep >= 3
          ? `/form-${formId}/step-4`
          : draft && draft.lastCompletedStep >= 2
            ? `/form-${formId}/step-3`
            : `/form-${formId}/step-2`;

  return (
    <>
      <h1 className={`ontario-h1 ${formStyles.pageTitle}`}>
        {submitted ? 'Filing submitted' : 'Transaction summary'}
      </h1>
      <p className={formStyles.lead}>
        {submitted
          ? `Your ${title} filing was submitted. A transaction summary was created for this browser session.`
          : `Form ${formId} draft saved locally in this browser session.`}
      </p>

      {!draft ? (
        <OntarioPageAlert
          type="warning"
          heading="No draft found"
          content={`There is no saved Form ${formId} draft in this session. Return to Form ${formId} to continue.`}
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

          <h2 className="ontario-h3">Step 2 — Co-operative details</h2>
          <dl className={styles.summaryList}>
            <div>
              <dt>Co-operative</dt>
              <dd>{OBR_CORPORATION_NAME}</dd>
            </div>
            <div>
              <dt>Type of co-operative</dt>
              <dd>{draft.step2.cooperativeSubtype || '—'}</dd>
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

          <h2 className="ontario-h3">Step 3 — Co-operative name</h2>
          <dl className={styles.summaryList}>
            <div>
              <dt>Current corporation name</dt>
              <dd>{OBR_CORPORATION_NAME}</dd>
            </div>
            <div>
              <dt>Continued as a co-operative under the name</dt>
              <dd>
                {draft.step3.continueUnderName === 'yes'
                  ? 'Yes'
                  : draft.step3.continueUnderName === 'no'
                    ? 'No'
                    : '—'}
              </dd>
            </div>
            {draft.step3.continueUnderName === 'no' ? (
              <>
                <div>
                  <dt>Proposed co-operative name</dt>
                  <dd>{draft.step3.proposedName.trim() || '—'}</dd>
                </div>
                <div>
                  <dt>Nuans reports</dt>
                  <dd>
                    {draft.step3.nuansReports.filter((report) => report.file || report.date)
                      .length || '—'}
                  </dd>
                </div>
              </>
            ) : null}
          </dl>

          <h2 className="ontario-h3">Step 4 — Original incorporation</h2>
          <dl className={styles.summaryList}>
            <div>
              <dt>Original incorporating Act</dt>
              <dd>{originalActLabel(step4.originalAct)}</dd>
            </div>
            {step4.originalAct === 'other' ? (
              <div>
                <dt>Specify Act and jurisdiction</dt>
                <dd>{step4.otherActJurisdiction.trim() || '—'}</dd>
              </div>
            ) : null}
            <div>
              <dt>Date of incorporation/amalgamation</dt>
              <dd>
                {step4.incorporationDate
                  ? formatIsoDateDisplay(step4.incorporationDate)
                  : '—'}
              </dd>
            </div>
          </dl>

          <h2 className="ontario-h3">Step 5 — Head office address</h2>
          <dl className={styles.summaryList}>
            <div>
              <dt>The head office is located in the municipality of:</dt>
              <dd>{formatHeadOfficeLocation(step5) || '—'}</dd>
            </div>
            <div>
              <dt>The address of the head office is:</dt>
              <dd>{formatHeadOfficeAddressLine(step5) || '—'}</dd>
            </div>
          </dl>

          <h2 className="ontario-h3">Step 6 — Directors</h2>
          <dl className={styles.summaryList}>
            <div>
              <dt>Number of directors</dt>
              <dd>
                {step6.countMode === 'fixed'
                  ? `Fixed number: ${step6.fixedNumber.trim() || '—'}`
                  : step6.countMode === 'minMax'
                    ? `Minimum ${step6.minimumNumber.trim() || '—'} / Maximum ${step6.maximumNumber.trim() || '—'}`
                    : '—'}
              </dd>
            </div>
            <div>
              <dt>Multi-stakeholder co-operative</dt>
              <dd>
                {step6.multiStakeholder === 'yes'
                  ? 'Yes'
                  : step6.multiStakeholder === 'no'
                    ? 'No'
                    : '—'}
              </dd>
            </div>
            {step6.multiStakeholder === 'yes'
              ? CONTINUANCE_STAKEHOLDER_GROUP_IDS.map((id) => {
                  const group = step6.groups[id];
                  if (stakeholderGroupIsEmpty(group)) {
                    return null;
                  }
                  return (
                    <div key={id}>
                      <dt>Group {id}</dt>
                      <dd>
                        {group.name.trim() || '—'} — min {group.minimumNumber.trim() || '—'} / max{' '}
                        {group.maximumNumber.trim() || '—'}
                      </dd>
                    </div>
                  );
                })
              : null}
            <div>
              <dt>First directors</dt>
              <dd>
                {step6.directors.length > 0
                  ? step6.directors
                      .map((director) => formatDirectorFullName(director) || 'Director')
                      .join('; ')
                  : '—'}
              </dd>
            </div>
          </dl>

          <h2 className="ontario-h3">
            {formId === 15
              ? 'Step 7 — Restrictions, member loans and membership fee'
              : 'Step 7 — Restrictions and share capital'}
          </h2>
          <dl className={styles.summaryList}>
            <div>
              <dt>Restrictions on business and powers</dt>
              <dd>
                {step7.businessPowersRestrictions.trim()
                  ? `${step7.businessPowersRestrictions.length.toLocaleString()} characters`
                  : '—'}
              </dd>
            </div>
            {formId === 15 ? (
              <>
                <div>
                  <dt>Minimum member loan</dt>
                  <dd>
                    {step7.minimumMemberLoan.trim()
                      ? `${step7.minimumMemberLoan.length.toLocaleString()} characters`
                      : '—'}
                  </dd>
                </div>
                <div>
                  <dt>Restrictions on transfer of member loans</dt>
                  <dd>
                    {step7.memberLoanTransferRestrictions.trim()
                      ? `${step7.memberLoanTransferRestrictions.length.toLocaleString()} characters`
                      : '—'}
                  </dd>
                </div>
                <div>
                  <dt>Membership fee</dt>
                  <dd>
                    {step7.membershipFee.trim()
                      ? `${step7.membershipFee.length.toLocaleString()} characters`
                      : '—'}
                  </dd>
                </div>
              </>
            ) : (
              <>
                <div>
                  <dt>Authorized capital</dt>
                  <dd>
                    {step7.authorizedCapital.trim()
                      ? `${step7.authorizedCapital.length.toLocaleString()} characters`
                      : '—'}
                  </dd>
                </div>
                <div>
                  <dt>Preference share terms</dt>
                  <dd>
                    {step7.preferenceShareTerms.trim()
                      ? `${step7.preferenceShareTerms.length.toLocaleString()} characters`
                      : '—'}
                  </dd>
                </div>
                <div>
                  <dt>Issued capital continued</dt>
                  <dd>
                    {step7.issuedCapitalContinued.trim()
                      ? `${step7.issuedCapitalContinued.length.toLocaleString()} characters`
                      : '—'}
                  </dd>
                </div>
                <div>
                  <dt>Restrictions on allotment, issue or transfer of shares</dt>
                  <dd>
                    {step7.shareTransferRestrictions.trim()
                      ? `${step7.shareTransferRestrictions.length.toLocaleString()} characters`
                      : '—'}
                  </dd>
                </div>
              </>
            )}
          </dl>

          <h2 className="ontario-h3">Step 8 — Membership and provisions</h2>
          <dl className={styles.summaryList}>
            <div>
              <dt>Classes of membership</dt>
              <dd>
                {step8.membershipClasses.trim()
                  ? `${step8.membershipClasses.length.toLocaleString()} characters`
                  : '—'}
              </dd>
            </div>
            <div>
              <dt>Terms and conditions of each class of membership</dt>
              <dd>
                {step8.membershipClassTerms.trim()
                  ? `${step8.membershipClassTerms.length.toLocaleString()} characters`
                  : '—'}
              </dd>
            </div>
            <div>
              <dt>Stakeholder groups</dt>
              <dd>
                {step8.stakeholderGroups.trim()
                  ? `${step8.stakeholderGroups.length.toLocaleString()} characters`
                  : '—'}
              </dd>
            </div>
            <div>
              <dt>Terms and conditions of membership in each stakeholder group</dt>
              <dd>
                {step8.stakeholderGroupTerms.trim()
                  ? `${step8.stakeholderGroupTerms.length.toLocaleString()} characters`
                  : '—'}
              </dd>
            </div>
            <div>
              <dt>Special provisions</dt>
              <dd>
                {step8.specialProvisions.trim()
                  ? `${step8.specialProvisions.length.toLocaleString()} characters`
                  : '—'}
              </dd>
            </div>
          </dl>

          <h2 className="ontario-h3">Step 9 — Declarations and authorization</h2>
          <dl className={styles.summaryList}>
            <div>
              <dt>Co-operative basis</dt>
              <dd>{step9.cooperativeBasisConfirmed ? 'Confirmed' : 'Not confirmed'}</dd>
            </div>
            <div>
              <dt>Subsection 158(3) or 158.1(3)</dt>
              <dd>{step9.subsection158Confirmed ? 'Confirmed' : 'Not confirmed'}</dd>
            </div>
            <div>
              <dt>Continued under the Co-operative Corporations Act</dt>
              <dd>{step9.continuedUnderActConfirmed ? 'Confirmed' : 'Not confirmed'}</dd>
            </div>
            <div>
              <dt>Not insolvent</dt>
              <dd>{step9.notInsolventConfirmed ? 'Confirmed' : 'Not confirmed'}</dd>
            </div>
            <div>
              <dt>Authorizing Act</dt>
              <dd>{originalActLabel(step9.authorizingAct)}</dd>
            </div>
            {step9.authorizingAct === 'other' ? (
              <div>
                <dt>Specify Act and jurisdiction</dt>
                <dd>{step9.otherActJurisdiction.trim() || '—'}</dd>
              </div>
            ) : null}
            <div>
              <dt>Date of authorization</dt>
              <dd>
                {step9.authorizationDate
                  ? formatIsoDateDisplay(step9.authorizationDate)
                  : '—'}
              </dd>
            </div>
          </dl>

          <h2 className="ontario-h3">Step 11 — Submit</h2>
          <dl className={styles.summaryList}>
            <div>
              <dt>Signed PDF</dt>
              <dd>{step10.signedPdf?.name || '—'}</dd>
            </div>
            <div>
              <dt>Authorization</dt>
              <dd>{step10.authorizationConfirmed ? 'Confirmed' : 'Not confirmed'}</dd>
            </div>
            {draft.confirmationNumber ? (
              <div>
                <dt>Confirmation number</dt>
                <dd>{draft.confirmationNumber}</dd>
              </div>
            ) : null}
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
    </>
  );
}
