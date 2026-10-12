import { Link } from 'react-router-dom';
import { OntarioButton, OntarioPageAlert } from '@ongov/ontario-design-system-component-library-react';
import { isSeparateLanguage } from '../components/form1/nameValidation';
import { readForm1Draft } from '../components/form1/form1DraftStorage';
import formStyles from '../components/form1/Form1Step1.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';
import styles from './Form1DraftSummaryPage.module.scss';

export function Form1DraftSummaryPage() {
  const draft = readForm1Draft();

  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <div className="ontario-row">
        <div className="ontario-columns ontario-small-12 ontario-medium-8">
          <h1 className={`ontario-h1 ${formStyles.pageTitle}`}>Transaction summary</h1>
          <p className={formStyles.lead}>
            Prototype stub for story #68619 / #69284 — draft saved locally in this browser
            session.
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
                heading="Draft saved"
                content={`Saved at ${new Date(draft.savedAt).toLocaleString()} (mode: ${draft.mode}, last completed step: ${draft.lastCompletedStep}).`}
              />

              <h2 className="ontario-h3">Step 1 — Co-operative name</h2>
              <dl className={styles.summaryList}>
                <div>
                  <dt>Name language</dt>
                  <dd>{draft.step1.languageOption || '—'}</dd>
                </div>
                {isSeparateLanguage(draft.step1.languageOption) ? (
                  <>
                    <div>
                      <dt>English name</dt>
                      <dd>{draft.step1.englishName || '—'}</dd>
                    </div>
                    <div>
                      <dt>French name</dt>
                      <dd>{draft.step1.frenchName || '—'}</dd>
                    </div>
                    <div>
                      <dt>English NUANS file</dt>
                      <dd>{draft.step1.nuansFileEn?.name || '—'}</dd>
                    </div>
                    <div>
                      <dt>French NUANS file</dt>
                      <dd>{draft.step1.nuansFileFr?.name || '—'}</dd>
                    </div>
                    <div>
                      <dt>English NUANS date</dt>
                      <dd>
                        {draft.step1.nuansDateEn
                          ? draft.step1.nuansDateEn.slice(0, 10)
                          : '—'}
                      </dd>
                    </div>
                    <div>
                      <dt>French NUANS date</dt>
                      <dd>
                        {draft.step1.nuansDateFr
                          ? draft.step1.nuansDateFr.slice(0, 10)
                          : '—'}
                      </dd>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <dt>Co-operative name</dt>
                      <dd>{draft.step1.cooperativeName || '—'}</dd>
                    </div>
                    <div>
                      <dt>NUANS file</dt>
                      <dd>{draft.step1.nuansFile?.name || '—'}</dd>
                    </div>
                    <div>
                      <dt>NUANS date</dt>
                      <dd>
                        {draft.step1.nuansDate ? draft.step1.nuansDate.slice(0, 10) : '—'}
                      </dd>
                    </div>
                  </>
                )}
              </dl>

              <h2 className="ontario-h3">Step 2 — Type and contact</h2>
              <dl className={styles.summaryList}>
                <div>
                  <dt>Co-operative sub-type</dt>
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

              <h2 className="ontario-h3">Step 3 — Head office address</h2>
              <dl className={styles.summaryList}>
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
            </>
          )}

          <div className={formStyles.buttonGroup}>
            <OntarioButton
              type="primary"
              htmlType="button"
              label="Return to Form 1"
              href={
                draft && draft.lastCompletedStep >= 3
                  ? '/form-1/step-4'
                  : draft && draft.lastCompletedStep >= 2
                    ? '/form-1/step-3'
                    : draft && draft.lastCompletedStep >= 1
                      ? '/form-1/step-2'
                      : '/form-1/step-1'
              }
            />
            <Link to="/" className={styles.homeLink}>
              Back to playground
            </Link>
          </div>
        </div>
      </div>
    </PlaygroundShell>
  );
}
