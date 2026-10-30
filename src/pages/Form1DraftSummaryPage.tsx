import { Link } from 'react-router-dom';
import { OntarioButton, OntarioPageAlert } from '@ongov/ontario-design-system-component-library-react';
import { formatIsoDateDisplay } from '../components/form7/form7Labels';
import {
  formatCooperativeSubtype,
  readForm1Draft,
} from '../components/form1/form1DraftStorage';
import formStyles from '../components/form1/Form1Step1.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';
import styles from './Form1DraftSummaryPage.module.scss';

export function Form1DraftSummaryPage() {
  const draft = readForm1Draft();
  const submitted = draft?.mode === 'submitted';

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
              ? 'Your Articles of Incorporation filing was submitted. A transaction summary was created for this browser session.'
              : 'Prototype stub for story #68619 / #69284 — draft saved locally in this browser session.'}
          </p>

          {!draft ? (
            <OntarioPageAlert
              type="warning"
              heading="No draft found"
              content="There is no saved Form 1 draft in this session. Return to Form 1 to enter and save a draft."
            />
          ) : (
            <>
              <OntarioPageAlert
                type="success"
                heading={submitted ? 'Submission recorded' : 'Draft saved'}
                content={
                  submitted && draft.confirmationNumber
                    ? `Confirmation number ${draft.confirmationNumber}. Saved at ${new Date(draft.savedAt).toLocaleString()}.`
                    : `Saved at ${new Date(draft.savedAt).toLocaleString()} (mode: ${draft.mode}, last completed step: ${draft.lastCompletedStep}).`
                }
              />

              <h2 className="ontario-h3">Step 1 — Co-operative name</h2>
              <dl className={styles.summaryList}>
                <div>
                  <dt>Co-operative name</dt>
                  <dd>{draft.step1.cooperativeName || '—'}</dd>
                </div>
                {(draft.step1.nuansReports?.length
                  ? draft.step1.nuansReports
                  : [{ id: 'empty', file: null, date: '' }]
                ).flatMap((report, index, list) => {
                  const ordinal = list.length > 1 ? ` ${index + 1}` : '';
                  return [
                    <div key={`${report.id}-file`}>
                      <dt>NUANS file{ordinal}</dt>
                      <dd>{report.file?.name || '—'}</dd>
                    </div>,
                    <div key={`${report.id}-date`}>
                      <dt>NUANS date{ordinal}</dt>
                      <dd>
                        {report.date ? formatIsoDateDisplay(report.date) : '—'}
                      </dd>
                    </div>,
                  ];
                })}
              </dl>

              <h2 className="ontario-h3">Step 2 — Type and contact</h2>
              <dl className={styles.summaryList}>
                <div>
                  <dt>Co-operative sub-type</dt>
                  <dd>{formatCooperativeSubtype(draft.step2) || '—'}</dd>
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

              <h2 className="ontario-h3">Step 3 — Head office address</h2>
              <dl className={styles.summaryList}>
                <div>
                  <dt>Unit type</dt>
                  <dd>{draft.step3.unitType || '—'}</dd>
                </div>
                <div>
                  <dt>Unit number</dt>
                  <dd>{draft.step3.roomNumber || '—'}</dd>
                </div>
                <div>
                  <dt>Street &amp; number</dt>
                  <dd>
                    {[
                      draft.step3.streetNumber,
                      draft.step3.streetNumberSuffix,
                      draft.step3.streetName,
                      draft.step3.streetType,
                      draft.step3.streetDirection,
                    ]
                      .filter(Boolean)
                      .join(' ') || '—'}
                  </dd>
                </div>
                <div>
                  <dt>City/Town</dt>
                  <dd>{draft.step3.cityTown || '—'}</dd>
                </div>
                <div>
                  <dt>Province</dt>
                  <dd>{draft.step3.province || 'Ontario'}</dd>
                </div>
                <div>
                  <dt>Postal code</dt>
                  <dd>{draft.step3.postalCode || '—'}</dd>
                </div>
                <div>
                  <dt>Status of municipality</dt>
                  <dd>{draft.step3.municipalityStatus || '—'}</dd>
                </div>
                <div>
                  <dt>Name of municipality</dt>
                  <dd>{draft.step3.municipalityName || '—'}</dd>
                </div>
                <div>
                  <dt>County, district or regional municipality</dt>
                  <dd>{draft.step3.countyStatus || '—'}</dd>
                </div>
                <div>
                  <dt>Name of county, district or regional municipality</dt>
                  <dd>{draft.step3.countyName || '—'}</dd>
                </div>
              </dl>

              <h2 className="ontario-h3">Step 5 — First directors</h2>
              <dl className={styles.summaryList}>
                <div>
                  <dt>Director count mode</dt>
                  <dd>
                    {draft.step4.countMode === 'fixed'
                      ? 'Fixed Number'
                      : draft.step4.countMode === 'minMax'
                        ? 'Minimum/Maximum'
                        : '—'}
                  </dd>
                </div>
                <div>
                  <dt>Fixed / min–max</dt>
                  <dd>
                    {draft.step4.countMode === 'fixed'
                      ? draft.step4.fixedNumber || '—'
                      : draft.step4.countMode === 'minMax'
                        ? `${draft.step4.minimumNumber || '—'} – ${draft.step4.maximumNumber || '—'}`
                        : '—'}
                  </dd>
                </div>
                <div>
                  <dt>Multi-stakeholder</dt>
                  <dd>{draft.step4.multiStakeholder || '—'}</dd>
                </div>
                {draft.step4.multiStakeholder === 'yes' ? (
                  <div>
                    <dt>Stakeholder group directors</dt>
                    <dd>{draft.step4.stakeholderDirectorsText || '—'}</dd>
                  </div>
                ) : null}
                <div>
                  <dt>Directors added</dt>
                  <dd>{draft.step4.directors.length}</dd>
                </div>
                {draft.step4.directors.map((director, index) => (
                  <div key={director.id}>
                    <dt>Director {index + 1}</dt>
                    <dd>
                      {[director.firstName, director.middleName, director.lastName]
                        .filter(Boolean)
                        .join(' ') || '—'}
                    </dd>
                  </div>
                ))}
              </dl>

              <h2 className="ontario-h3">Step 5 — Share information</h2>
              <dl className={styles.summaryList}>
                <div>
                  <dt>Business / powers restrictions</dt>
                  <dd>
                    {draft.step5?.businessPowersRestrictions
                      ? `${draft.step5.businessPowersRestrictions.length.toLocaleString()} characters`
                      : '—'}
                  </dd>
                </div>
                <div>
                  <dt>Authorized capital</dt>
                  <dd>
                    {draft.step5?.authorizedCapital
                      ? `${draft.step5.authorizedCapital.length.toLocaleString()} characters`
                      : '—'}
                  </dd>
                </div>
                <div>
                  <dt>Preference share terms</dt>
                  <dd>
                    {draft.step5?.preferenceShareTerms
                      ? `${draft.step5.preferenceShareTerms.length.toLocaleString()} characters`
                      : '—'}
                  </dd>
                </div>
                <div>
                  <dt>Share transfer restrictions</dt>
                  <dd>
                    {draft.step5?.shareTransferRestrictions
                      ? `${draft.step5.shareTransferRestrictions.length.toLocaleString()} characters`
                      : '—'}
                  </dd>
                </div>
              </dl>

              <h2 className="ontario-h3">Step 6 — Membership and provisions</h2>
              <dl className={styles.summaryList}>
                <div>
                  <dt>Classes of membership</dt>
                  <dd>
                    {draft.step6?.membershipClasses
                      ? `${draft.step6.membershipClasses.length.toLocaleString()} characters`
                      : '—'}
                  </dd>
                </div>
                <div>
                  <dt>Membership class terms</dt>
                  <dd>
                    {draft.step6?.membershipClassTerms
                      ? `${draft.step6.membershipClassTerms.length.toLocaleString()} characters`
                      : '—'}
                  </dd>
                </div>
                <div>
                  <dt>Stakeholder groups</dt>
                  <dd>
                    {draft.step6?.stakeholderGroups
                      ? `${draft.step6.stakeholderGroups.length.toLocaleString()} characters`
                      : '—'}
                  </dd>
                </div>
                <div>
                  <dt>Stakeholder group terms</dt>
                  <dd>
                    {draft.step6?.stakeholderGroupTerms
                      ? `${draft.step6.stakeholderGroupTerms.length.toLocaleString()} characters`
                      : '—'}
                  </dd>
                </div>
                <div>
                  <dt>Special provisions</dt>
                  <dd>
                    {draft.step6?.specialProvisions
                      ? `${draft.step6.specialProvisions.length.toLocaleString()} characters`
                      : '—'}
                  </dd>
                </div>
              </dl>

              <h2 className="ontario-h3">Step 7 — Incorporators</h2>
              <dl className={styles.summaryList}>
                <div>
                  <dt>Incorporators added</dt>
                  <dd>{draft.step7?.incorporators?.length ?? 0}</dd>
                </div>
                {(draft.step7?.incorporators ?? []).map((entry, index) => (
                  <div key={entry.id}>
                    <dt>Incorporator {index + 1}</dt>
                    <dd>
                      {entry.type === 'corporation'
                        ? `${entry.corporationName || '—'} (OCN ${entry.ocn || '—'})`
                        : [entry.firstName, entry.middleName, entry.lastName]
                            .filter(Boolean)
                            .join(' ') || '—'}
                    </dd>
                  </div>
                ))}
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
                  draft && draft.lastCompletedStep >= 8
                    ? '/form-1/step-10'
                    : draft && draft.lastCompletedStep >= 7
                    ? '/form-1/step-9'
                    : draft && draft.lastCompletedStep >= 6
                      ? '/form-1/step-7'
                      : draft && draft.lastCompletedStep >= 5
                        ? '/form-1/step-6'
                        : draft && draft.lastCompletedStep >= 4
                          ? '/form-1/step-5'
                          : draft && draft.lastCompletedStep >= 3
                            ? '/form-1/step-4'
                            : draft && draft.lastCompletedStep >= 2
                              ? '/form-1/step-3'
                              : draft && draft.lastCompletedStep >= 1
                                ? '/form-1/step-2'
                                : '/form-1'
                }
              />
            ) : null}
            <Link to="/" className={styles.homeLink}>
              Back to playground
            </Link>
          </div>
        </div>
      </div>
    </PlaygroundShell>
  );
}
