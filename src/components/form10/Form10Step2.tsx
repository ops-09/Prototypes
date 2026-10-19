import { useMemo, useRef, useState, type MouseEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  OntarioButton,
  OntarioCheckboxes,
  OntarioDateInput,
  OntarioIconAdd,
  OntarioInput,
  OntarioPageAlert,
  OntarioStepIndicator,
} from '@ongov/ontario-design-system-component-library-react';
import { isIsoDateComplete } from '../form1/nameValidation';
import { aggregateDateFromEvent, syncDateFieldByAnchor } from '../form7/dateErrorSync';
import {
  createEmptyAmalgamatingCooperative,
  createSeedAmalgamatingCooperatives,
  EMPTY_STEP4,
  OBR_STEP1_DEFAULTS,
  readForm10Draft,
  saveForm10Draft,
  upsertForm10Step2,
  type AmalgamatingCooperative,
  type Form10Step2Data,
} from './form10DraftStorage';
import styles from './Form10Step1.module.scss';

const CURRENT_STEP = 3;
const TOTAL_STEPS = 5;
const MIN_COOPS = 2;

type FieldKey =
  | 'cooperatives'
  | 'agreementApproved'
  | `coop-${string}-name`
  | `coop-${string}-ocn`
  | `coop-${string}-date`;
type FieldErrors = Partial<Record<FieldKey, string>>;

function getEventValue(event: globalThis.Event) {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement | null;
  return target?.value ?? '';
}

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
    step2: {
      amalgamatingCooperatives: createSeedAmalgamatingCooperatives(),
      agreementApproved: false,
    },
    step3: {
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
    amalgamatingCooperatives:
      draft.step2.amalgamatingCooperatives.length >= MIN_COOPS
        ? draft.step2.amalgamatingCooperatives
        : createSeedAmalgamatingCooperatives(),
    agreementApproved: draft.step2.agreementApproved ?? false,
  }));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const dateErrorsRef = useRef<FieldErrors>({});
  dateErrorsRef.current = errors;

  const errorSummaryItems = useMemo(() => {
    const items: { key: string; message: string; href: string }[] = [];
    if (errors.cooperatives) {
      items.push({
        key: 'cooperatives',
        message: errors.cooperatives,
        href: '#amalgamating-cooperatives',
      });
    }
    step2.amalgamatingCooperatives.forEach((coop, index) => {
      const nameKey = `coop-${coop.id}-name` as const;
      const ocnKey = `coop-${coop.id}-ocn` as const;
      const dateKey = `coop-${coop.id}-date` as const;
      if (errors[nameKey]) {
        items.push({
          key: nameKey,
          message: `Co-operative ${index + 1}: ${errors[nameKey]}`,
          href: `#${nameKey}`,
        });
      }
      if (errors[ocnKey]) {
        items.push({
          key: ocnKey,
          message: `Co-operative ${index + 1}: ${errors[ocnKey]}`,
          href: `#${ocnKey}`,
        });
      }
      if (errors[dateKey]) {
        items.push({
          key: dateKey,
          message: `Co-operative ${index + 1}: ${errors[dateKey]}`,
          href: `#${dateKey}`,
        });
      }
    });
    if (errors.agreementApproved) {
      items.push({
        key: 'agreementApproved',
        message: errors.agreementApproved,
        href: '#agreement-approved',
      });
    }
    return items;
  }, [errors, step2.amalgamatingCooperatives]);

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

  function updateCoop(id: string, patch: Partial<AmalgamatingCooperative>) {
    setStep2((prev) => ({
      ...prev,
      amalgamatingCooperatives: prev.amalgamatingCooperatives.map((coop) =>
        coop.id === id ? { ...coop, ...patch } : coop,
      ),
    }));
  }

  function addCooperative() {
    setStep2((prev) => ({
      ...prev,
      amalgamatingCooperatives: [
        ...prev.amalgamatingCooperatives,
        createEmptyAmalgamatingCooperative(),
      ],
    }));
    clearError('cooperatives');
  }

  function removeCooperative(id: string) {
    setStep2((prev) => {
      if (prev.amalgamatingCooperatives.length <= MIN_COOPS) {
        return prev;
      }
      return {
        ...prev,
        amalgamatingCooperatives: prev.amalgamatingCooperatives.filter(
          (coop) => coop.id !== id,
        ),
      };
    });
  }

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (step2.amalgamatingCooperatives.length < MIN_COOPS) {
      next.cooperatives = `Add at least ${MIN_COOPS} amalgamating co-operatives.`;
    }
    step2.amalgamatingCooperatives.forEach((coop) => {
      if (!coop.legalName.trim()) {
        next[`coop-${coop.id}-name`] = 'Enter the legal name.';
      }
      if (!coop.ocn.trim()) {
        next[`coop-${coop.id}-ocn`] = 'Enter the Ontario Corporation Number (OCN).';
      }
      if (!coop.membersApprovalDate.trim()) {
        next[`coop-${coop.id}-date`] = 'Enter the date of members’ approval.';
      } else if (!isIsoDateComplete(coop.membersApprovalDate)) {
        next[`coop-${coop.id}-date`] = 'Enter a complete date of members’ approval.';
      }
    });
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
    window.requestAnimationFrame(() => {
      step2.amalgamatingCooperatives.forEach((coop) => {
        syncDateFieldByAnchor(
          `coop-${coop.id}-date`,
          nextErrors[`coop-${coop.id}-date`],
        );
      });
      if (hasErrors) {
        errorSummaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
    if (hasErrors) {
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
          numberOfSteps={TOTAL_STEPS}
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

          <div id="amalgamating-cooperatives" className={styles.formStack}>
            {step2.amalgamatingCooperatives.map((coop, index) => {
              const nameKey = `coop-${coop.id}-name` as const;
              const ocnKey = `coop-${coop.id}-ocn` as const;
              const dateKey = `coop-${coop.id}-date` as const;
              return (
                <div key={coop.id} className={styles.formStack}>
                  <h2 className={`ontario-h3 ${styles.pageTitle}`}>
                    Amalgamating co-operative {index + 1}
                  </h2>
                  <div id={nameKey}>
                    <OntarioInput
                      elementId={nameKey}
                      caption="Legal name"
                      name={nameKey}
                      type="text"
                      required
                      value={coop.legalName}
                      errorMessage={errors[nameKey]}
                      customOnInput={(event) => {
                        updateCoop(coop.id, { legalName: getEventValue(event) });
                        clearError(nameKey);
                        clearError('cooperatives');
                      }}
                    />
                  </div>
                  <div id={ocnKey}>
                    <OntarioInput
                      elementId={ocnKey}
                      caption="Ontario Corporation Number (OCN)"
                      name={ocnKey}
                      type="text"
                      required
                      value={coop.ocn}
                      errorMessage={errors[ocnKey]}
                      customOnInput={(event) => {
                        updateCoop(coop.id, { ocn: getEventValue(event) });
                        clearError(ocnKey);
                        clearError('cooperatives');
                      }}
                    />
                  </div>
                  <div id={dateKey}>
                    <p className={styles.resolutionDateLabel}>
                      Dates of Members’ Approval
                      <span className={styles.requiredFlag}> (required)</span>
                    </p>
                    <div className={styles.resolutionDateInputClip}>
                      <OntarioDateInput
                        elementId={`${dateKey}-input`}
                        caption={{
                          captionText: '\u200B',
                          captionType: 'default',
                        }}
                        required
                        value={coop.membersApprovalDate || undefined}
                        dateValidator={(_day, _month, _year) => {
                          const message = dateErrorsRef.current[dateKey];
                          if (message) {
                            return {
                              errorMessage: message,
                              dayInvalid: true,
                              monthInvalid: true,
                              yearInvalid: true,
                            };
                          }
                          return {
                            errorMessage: '',
                            dayInvalid: false,
                            monthInvalid: false,
                            yearInvalid: false,
                          };
                        }}
                        onInputOnInput={(event) => {
                          const next = aggregateDateFromEvent(event);
                          if (next !== null) {
                            updateCoop(coop.id, { membersApprovalDate: next });
                          }
                          clearError(dateKey);
                        }}
                        onInputOnChange={(event) => {
                          const next = aggregateDateFromEvent(event);
                          if (next !== null) {
                            updateCoop(coop.id, { membersApprovalDate: next });
                          }
                          clearError(dateKey);
                        }}
                      />
                    </div>
                  </div>
                  {step2.amalgamatingCooperatives.length > MIN_COOPS ? (
                    <OntarioButton
                      type="tertiary"
                      htmlType="button"
                      label={`Remove co-operative ${index + 1}`}
                      onClick={() => removeCooperative(coop.id)}
                    />
                  ) : null}
                </div>
              );
            })}

            <div className={styles.addActions}>
              <button
                type="button"
                className={styles.addLink}
                onClick={addCooperative}
              >
                <OntarioIconAdd colour="blue" iconWidth={24} isDecorative />
                Add amalgamating co-operative
              </button>
            </div>

            <div id="agreement-approved">
              <OntarioCheckboxes
                caption={{
                  captionText:
                    'Confirm amalgamation agreement approval',
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
