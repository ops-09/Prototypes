import { useMemo, useRef, useState, type MouseEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  OntarioButton,
  OntarioCheckboxes,
  OntarioIconAdd,
  OntarioIconDelete,
  OntarioPageAlert,
  OntarioStepIndicator,
} from '@ongov/ontario-design-system-component-library-react';
import { FieldErrorMessage } from '../form1/FieldErrorMessage';
import step4Styles from '../form1/Form1Step4.module.scss';
import { formatIsoDateDisplay } from '../form7/form7Labels';
import { focusField } from './form11Focus';
import {
  FORM11_TOTAL_STEPS,
  MIN_AMALGAMATING_NFPS,
  normalizeOcn,
  OBR_OCN,
  OBR_STEP2_DEFAULTS,
  readForm11Draft,
  upsertForm11Step2,
  upsertForm11Step3,
  type Form11Step3Data,
} from './form11DraftStorage';
import { DUPLICATE_ERROR } from './Form11CorporationEditor';
import pageStyles from './Form11Step2.module.scss';
import styles from './Form11Step3.module.scss';

const CURRENT_STEP = 3;
const BOUND_CORP_ERROR =
  'The corporation associated with your account must be one of the amalgamating not-for-profit corporation identified in this application.';
const AGREEMENT_ERROR =
  'You must confirm that the amalgamation agreement has been duly approved as required by section 113(3) of the Corporations Act.';
const MIN_CORPS_ERROR = `Add at least ${MIN_AMALGAMATING_NFPS} amalgamating not-for-profit corporations.`;

type FieldKey = 'corporations' | 'agreementApproved';
type FieldErrors = Partial<Record<FieldKey, string>>;

function ensureStep2Draft() {
  const existing = readForm11Draft();
  if (existing?.step2.email) {
    return existing;
  }
  return upsertForm11Step2({ ...OBR_STEP2_DEFAULTS }, 'continue');
}

export function Form11Step3() {
  const navigate = useNavigate();
  const draft = ensureStep2Draft();
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  const [step3, setStep3] = useState<Form11Step3Data>(() => ({
    corporations: draft.step3.corporations.filter(
      (entry) => entry.legalName.trim() && entry.ocn.trim(),
    ),
    agreementApproved: draft.step3.agreementApproved,
  }));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  const errorSummaryItems = useMemo(() => {
    const items: { key: string; message: string; href: string }[] = [];
    if (errors.corporations) {
      items.push({
        key: 'corporations',
        message: errors.corporations,
        href: '#amalgamating-corporations',
      });
    }
    if (errors.agreementApproved) {
      items.push({
        key: 'agreementApproved',
        message: errors.agreementApproved,
        href: '#agreement-approved',
      });
    }
    return items;
  }, [errors]);

  if (!draft?.step2.email) {
    return <Navigate to="/form-11/step-2" replace />;
  }

  function clearError(key: FieldKey) {
    setErrors((prev) => {
      if (!prev[key]) {
        return prev;
      }
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function persistStep3(next: Form11Step3Data) {
    upsertForm11Step3(next, 'continue', readForm11Draft()?.lastCompletedStep ?? 2);
  }

  function startAddCorporation() {
    clearError('corporations');
    persistStep3(step3);
    navigate('/form-11/step-3/corporations/new');
  }

  function startAddMyCorporation() {
    if (step3.corporations.some((entry) => normalizeOcn(entry.ocn) === OBR_OCN)) {
      setErrors((prev) => ({ ...prev, corporations: DUPLICATE_ERROR }));
      return;
    }
    clearError('corporations');
    persistStep3(step3);
    navigate('/form-11/step-3/corporations/new?fromAccount=1');
  }

  function editCorporation(id: string) {
    persistStep3(step3);
    navigate(`/form-11/step-3/corporations/${id}`);
  }

  function removeCorporation(id: string) {
    setStep3((prev) => {
      const next = {
        ...prev,
        corporations: prev.corporations.filter((entry) => entry.id !== id),
      };
      persistStep3(next);
      return next;
    });
    clearError('corporations');
  }

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (step3.corporations.length < MIN_AMALGAMATING_NFPS) {
      next.corporations = MIN_CORPS_ERROR;
    } else if (!step3.corporations.some((entry) => normalizeOcn(entry.ocn) === OBR_OCN)) {
      next.corporations = BOUND_CORP_ERROR;
    }
    if (!step3.agreementApproved) {
      next.agreementApproved = AGREEMENT_ERROR;
    }
    return next;
  }

  function handleContinue() {
    const nextErrors = validate();
    const hasErrors = Object.keys(nextErrors).length > 0;
    setErrors(nextErrors);
    setShowErrorSummary(hasErrors);
    if (hasErrors) {
      window.requestAnimationFrame(() => {
        errorSummaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      return;
    }
    upsertForm11Step3(step3, 'continue');
    navigate('/form-11/step-4');
  }

  function handleSaveAsDraft() {
    upsertForm11Step3(step3, 'draft', readForm11Draft()?.lastCompletedStep ?? 2);
    navigate('/form-11/draft-summary');
  }

  function handleCancel() {
    const leave = window.confirm('Leave this filing without saving further changes?');
    if (leave) {
      navigate('/');
    }
  }

  function handleSummaryLinkClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
    event.preventDefault();
    focusField(href.replace('#', ''));
  }

  return (
    <>
      <div className={pageStyles.stepIndicator}>
        <OntarioStepIndicator
          showBackButton
          backButtonUrl="/form-11/step-2"
          currentStep={CURRENT_STEP}
          numberOfSteps={FORM11_TOTAL_STEPS}
        />
      </div>

      <div className="ontario-row">
        <div className="ontario-columns ontario-small-12 ontario-medium-8">
          {showErrorSummary && errorSummaryItems.length > 0 ? (
            <div ref={errorSummaryRef} className={pageStyles.alert} tabIndex={-1}>
              <OntarioPageAlert type="error" heading="There is a problem">
                <p>Errors were found on this page:</p>
                <ul>
                  {errorSummaryItems.map((item) => (
                    <li key={item.key}>
                      <a
                        className={pageStyles.errorSummaryLink}
                        href={item.href}
                        onClick={(event) => handleSummaryLinkClick(event, item.href)}
                      >
                        {item.message}
                      </a>
                    </li>
                  ))}
                </ul>
              </OntarioPageAlert>
            </div>
          ) : null}

          <h1 className={`ontario-h1 ${pageStyles.pageTitle}`}>Amalgamation details</h1>
          <p className={pageStyles.lead}>
            Identify the amalgamating not-for-profit corporations and confirm that the
            amalgamation agreement has been duly approved as required by section 113(3) of
            the Corporations Act.
          </p>

          <div className={pageStyles.formStack}>
            <div id="amalgamating-corporations" className={step4Styles.directorsSection}>
              <FieldErrorMessage message={errors.corporations} />

              {step3.corporations.length > 0 ? (
                <ul className={step4Styles.summaryList}>
                  {step3.corporations.map((corp) => {
                    const name = corp.legalName.trim() || 'Corporation';
                    return (
                      <li key={corp.id} className={step4Styles.summaryItem}>
                        <div className={step4Styles.summaryMain}>
                          <button
                            type="button"
                            className={step4Styles.summaryTitle}
                            onClick={() => editCorporation(corp.id)}
                          >
                            {name}
                          </button>
                          <div className={step4Styles.summaryDescription}>
                            <div>OCN {corp.ocn || '—'}</div>
                            {corp.membersApprovalDate ? (
                              <div>
                                Members’ approval{' '}
                                {formatIsoDateDisplay(corp.membersApprovalDate)}
                              </div>
                            ) : null}
                          </div>
                        </div>
                        <button
                          type="button"
                          className={step4Styles.summaryRemove}
                          onClick={() => removeCorporation(corp.id)}
                          aria-label={`Remove ${name}`}
                        >
                          <OntarioIconDelete colour="blue" iconWidth={24} isDecorative />
                          Remove
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : null}

              <div
                className={
                  step3.corporations.length === 0
                    ? `${styles.addActions} ${styles.addActionsAlone}`
                    : styles.addActions
                }
              >
                <button type="button" className={styles.addLink} onClick={startAddCorporation}>
                  <OntarioIconAdd colour="blue" iconWidth={24} isDecorative />
                  Add Another Corporation
                </button>
                <button
                  type="button"
                  className={styles.addLink}
                  onClick={startAddMyCorporation}
                >
                  <OntarioIconAdd colour="blue" iconWidth={24} isDecorative />
                  Add my Corporation
                </button>
              </div>
            </div>

            <div id="agreement-approved">
              <OntarioCheckboxes
                caption="Confirm amalgamation agreement approval"
                name="agreement-approved"
                required
                options={[
                  {
                    value: 'approved',
                    elementId: 'agreement-approved-yes',
                    label:
                      'The amalgamation agreement has been duly approved as required by section 113(3) of the Corporations Act.',
                  },
                ]}
                value={step3.agreementApproved ? ['approved'] : []}
                errorMessage={errors.agreementApproved}
                customOnChange={(event) => {
                  const target = event.target as HTMLInputElement | null;
                  setStep3((prev) => ({
                    ...prev,
                    agreementApproved: Boolean(target?.checked),
                  }));
                  clearError('agreementApproved');
                }}
              />
            </div>
          </div>

          <div className={pageStyles.buttonGroup}>
            <OntarioButton
              type="primary"
              htmlType="button"
              label="Continue"
              onClick={handleContinue}
            />
            <OntarioButton
              type="secondary"
              htmlType="button"
              label="Save as Draft"
              onClick={handleSaveAsDraft}
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
    </>
  );
}
