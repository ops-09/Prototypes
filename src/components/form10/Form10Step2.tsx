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
import {
  EMPTY_NAME_CHANGE,
  EMPTY_STEP2,
  EMPTY_STEP4,
  FORM10_TOTAL_STEPS,
  MIN_AMALGAMATING_COOPS,
  OBR_STEP1_DEFAULTS,
  readForm10Draft,
  saveForm10Draft,
  upsertForm10Step2,
  type Form10Step2Data,
} from './form10DraftStorage';
import styles from './Form10Step1.module.scss';

const CURRENT_STEP = 3;

type FieldKey = 'cooperatives' | 'agreementApproved';
type FieldErrors = Partial<Record<FieldKey, string>>;

function focusField(anchorId: string) {
  const target = document.getElementById(anchorId);
  if (!target) {
    return;
  }
  target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  const focusable = target.matches('input, select, textarea, button, a, [tabindex]')
    ? target
    : target.querySelector<HTMLElement>(
        'input, select, textarea, button, [tabindex]:not([tabindex="-1"])',
      );
  focusable?.focus({ preventScroll: true });
}

function ensureStep2Draft() {
  const existing = readForm10Draft();
  if (existing?.step1.cooperativeName) {
    return existing;
  }

  const now = new Date().toISOString();
  const seeded = {
    step1: { ...OBR_STEP1_DEFAULTS, primaryActivity: '4521 - Department stores' },
    step2: { ...EMPTY_STEP2 },
    nameChange: { ...EMPTY_NAME_CHANGE },
    step3: {
      certifiedAgreement: [],
      documentsByCooperative: [],
    },
    step4: { ...EMPTY_STEP4 },
    savedAs: 'continue' as const,
    savedAt: now,
    lastCompletedStep: 1 as const,
  };
  saveForm10Draft(seeded);
  return seeded;
}

export function Form10Step2() {
  const navigate = useNavigate();
  const draft = ensureStep2Draft();
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  const [step2, setStep2] = useState<Form10Step2Data>(() => ({
    amalgamatingCooperatives: draft.step2.amalgamatingCooperatives,
    agreementApproved: draft.step2.agreementApproved ?? false,
  }));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  const errorSummaryItems = useMemo(() => {
    const items: { key: string; message: string; href: string }[] = [];
    if (errors.cooperatives) {
      items.push({
        key: 'cooperatives',
        message: errors.cooperatives,
        href: '#amalgamating-cooperatives',
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

  if (!draft?.step1.cooperativeName) {
    return <Navigate to="/form-10/step-2" replace />;
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

  function persistStep2(next: Form10Step2Data) {
    upsertForm10Step2(next, 'continue', 1);
  }

  function startAddCooperative() {
    clearError('cooperatives');
    persistStep2(step2);
    navigate('/form-10/step-3/cooperatives/new');
  }

  function editCooperative(id: string) {
    persistStep2(step2);
    navigate(`/form-10/step-3/cooperatives/${id}`);
  }

  function removeCooperative(id: string) {
    setStep2((prev) => {
      const next = {
        ...prev,
        amalgamatingCooperatives: prev.amalgamatingCooperatives.filter(
          (entry) => entry.id !== id,
        ),
      };
      persistStep2(next);
      return next;
    });
    clearError('cooperatives');
  }

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (step2.amalgamatingCooperatives.length < MIN_AMALGAMATING_COOPS) {
      next.cooperatives = `Add at least ${MIN_AMALGAMATING_COOPS} amalgamating co-operatives.`;
    }
    if (!step2.agreementApproved) {
      next.agreementApproved =
        'Confirm that the amalgamation agreement has been duly approved pursuant to section 156 of the Co-operative Corporations Act.';
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
    upsertForm10Step2(step2, 'continue', 2);
    navigate('/form-10/step-4');
  }

  function handleSaveAsDraft() {
    upsertForm10Step2(step2, 'draft', 1);
    navigate('/form-10/draft-summary');
  }

  function handleCancel() {
    const leave = window.confirm(
      'Leave this filing without saving further changes?',
    );
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
      <div className={styles.stepIndicator}>
        <OntarioStepIndicator
          showBackButton
          backButtonUrl="/form-10/step-2"
          currentStep={CURRENT_STEP}
          numberOfSteps={FORM10_TOTAL_STEPS}
        />
      </div>

      <div className="ontario-row">
        <div className="ontario-columns ontario-small-12 ontario-medium-8">
          {showErrorSummary && errorSummaryItems.length > 0 ? (
            <div ref={errorSummaryRef} className={styles.alert} tabIndex={-1}>
              <OntarioPageAlert type="error" heading="There is a problem">
                <p>Errors were found on this page:</p>
                <ul>
                  {errorSummaryItems.map((item) => (
                    <li key={item.key}>
                      <a
                        className={styles.errorSummaryLink}
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

          <h1 className={`ontario-h1 ${styles.pageTitle}`}>Amalgamation details</h1>
          <p className={styles.lead}>
            Add each amalgamating co-operative and confirm that the amalgamation agreement has
            been duly approved pursuant to section 156 of the Co-operative Corporations Act.
          </p>

          <div className={styles.formStack}>
            <div id="amalgamating-cooperatives" className={step4Styles.directorsSection}>
              <div>
                <h2 className={`ontario-h2 ${step4Styles.sectionHeading}`}>
                  Amalgamating co-operatives
                </h2>
                <p className={step4Styles.sectionLead}>
                  Add at least {MIN_AMALGAMATING_COOPS} amalgamating co-operatives.
                </p>
              </div>

              <FieldErrorMessage message={errors.cooperatives} />

              {step2.amalgamatingCooperatives.length > 0 ? (
                <ul className={step4Styles.summaryList}>
                  {step2.amalgamatingCooperatives.map((coop) => {
                    const name = coop.legalName.trim() || 'Co-operative';
                    return (
                      <li key={coop.id} className={step4Styles.summaryItem}>
                        <div className={step4Styles.summaryMain}>
                          <button
                            type="button"
                            className={step4Styles.summaryTitle}
                            onClick={() => editCooperative(coop.id)}
                          >
                            {name}
                          </button>
                          <div className={step4Styles.summaryDescription}>
                            <div>OCN {coop.ocn || '—'}</div>
                            {coop.membersApprovalDate ? (
                              <div>
                                Members’ approval{' '}
                                {formatIsoDateDisplay(coop.membersApprovalDate)}
                              </div>
                            ) : null}
                          </div>
                        </div>
                        <button
                          type="button"
                          className={step4Styles.summaryRemove}
                          onClick={() => removeCooperative(coop.id)}
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
                  step2.amalgamatingCooperatives.length === 0
                    ? `${styles.addActions} ${styles.addActionsAlone}`
                    : styles.addActions
                }
              >
                <button
                  type="button"
                  className={styles.addLink}
                  onClick={startAddCooperative}
                >
                  <OntarioIconAdd colour="blue" iconWidth={24} isDecorative />
                  Add amalgamating co-operative
                </button>
              </div>
            </div>

            <div id="agreement-approved">
              <OntarioCheckboxes
                caption={{
                  captionText: 'Confirm amalgamation agreement approval',
                  captionType: 'default',
                }}
                name="agreement-approved"
                required
                options={[
                  {
                    value: 'approved',
                    elementId: 'agreement-approved-yes',
                    label:
                      'The amalgamation agreement has been duly approved pursuant to section 156 of the Co-operative Corporations Act.',
                  },
                ]}
                value={step2.agreementApproved ? ['approved'] : []}
                errorMessage={errors.agreementApproved}
                customOnChange={(event) => {
                  const target = event.target as HTMLInputElement | null;
                  setStep2((prev) => ({
                    ...prev,
                    agreementApproved: Boolean(target?.checked),
                  }));
                  clearError('agreementApproved');
                }}
              />
            </div>
          </div>

          <div className={styles.buttonGroup}>
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
