import { useMemo, useRef, useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContinuanceReviewReturn } from './continuanceReviewReturn';
import {
  OntarioButton,
  OntarioInput,
  OntarioPageAlert,
  OntarioRadioButtons,
  OntarioStepIndicator,
} from '@ongov/ontario-design-system-component-library-react';
import { formatIsoDateDisplay } from '../form7/form7Labels';
import {
  CONTINUANCE_ORIGINAL_ACT_OPTIONS,
  CONTINUANCE_TOTAL_STEPS,
  EMPTY_STEP4,
  ensureContinuanceStep4Draft,
  OBR_INCORPORATION_DATE,
  ORIGINAL_ACT_ERROR,
  OTHER_ACT_ERROR,
  readContinuanceDraft,
  upsertContinuanceStep4,
  type ContinuanceFormId,
  type ContinuanceOriginalAct,
  type ContinuanceStep4Data,
} from './continuanceDraftStorage';
import styles from '../form2/Form2Step1.module.scss';

const CURRENT_STEP = 4;

type FieldKey = 'originalAct' | 'otherActJurisdiction';
type FieldErrors = Partial<Record<FieldKey, string>>;

function fieldAnchors(formId: ContinuanceFormId): Record<FieldKey, string> {
  const prefix = `form${formId}`;
  return {
    originalAct: `${prefix}-original-act`,
    otherActJurisdiction: `${prefix}-other-act-jurisdiction`,
  };
}

function getEventValue(event: globalThis.Event) {
  const target = event.target as HTMLInputElement | null;
  return target?.value ?? '';
}

function focusField(anchorId: string) {
  const target = document.getElementById(anchorId);
  if (!target) {
    return;
  }
  target.scrollIntoView({ behavior: 'smooth', block: 'center' });

  const nestedHost = target.querySelector<HTMLElement>(
    'ontario-input, ontario-radio-buttons',
  );
  const nestedShadowControl = nestedHost?.shadowRoot?.querySelector<HTMLElement>(
    'input, select, textarea, button',
  );
  if (nestedShadowControl) {
    nestedShadowControl.focus({ preventScroll: true });
    return;
  }

  const focusable = target.querySelector<HTMLElement>(
    'input, select, textarea, button, [tabindex]:not([tabindex="-1"])',
  );
  focusable?.focus({ preventScroll: true });
}

type ContinuanceStep4Props = {
  formId: ContinuanceFormId;
};

export function ContinuanceStep4({ formId }: ContinuanceStep4Props) {
  const navigate = useNavigate();
  const { afterSave } = useContinuanceReviewReturn(formId);
  const draft = ensureContinuanceStep4Draft(formId);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const anchors = fieldAnchors(formId);
  const backHref = `/form-${formId}/step-3`;
  const continueHref = `/form-${formId}/step-5`;
  const draftSummaryHref = `/form-${formId}/draft-summary`;

  const [step4, setStep4] = useState<ContinuanceStep4Data>(() => ({
    ...EMPTY_STEP4,
    ...(draft.step4 ?? {}),
  }));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  const radioOptions = useMemo(
    () =>
      CONTINUANCE_ORIGINAL_ACT_OPTIONS.map((option) => ({
        value: option.value,
        label: option.label,
        elementId: `${anchors.originalAct}-${option.value}`,
      })),
    [anchors.originalAct],
  );

  const errorSummaryItems = useMemo(
    () =>
      (['originalAct', 'otherActJurisdiction'] as FieldKey[]).flatMap((key) => {
        const message = errors[key];
        if (!message) {
          return [];
        }
        return [{ key, message, href: `#${anchors[key]}` }];
      }),
    [anchors, errors],
  );

  function patchStep4(partial: Partial<ContinuanceStep4Data>) {
    setStep4((prev) => ({ ...prev, ...partial }));
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

  function validateAll(): FieldErrors {
    const next: FieldErrors = {};

    if (!step4.originalAct) {
      next.originalAct = ORIGINAL_ACT_ERROR;
    } else if (step4.originalAct === 'other' && !step4.otherActJurisdiction.trim()) {
      next.otherActJurisdiction = OTHER_ACT_ERROR;
    }

    return next;
  }

  function handleContinue() {
    const nextErrors = validateAll();
    setErrors(nextErrors);
    const hasErrors = Object.keys(nextErrors).length > 0;
    setShowErrorSummary(hasErrors);

    if (hasErrors) {
      window.requestAnimationFrame(() => {
        errorSummaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      return;
    }

    upsertContinuanceStep4(formId, step4, 'continue');
    navigate(afterSave(continueHref));
  }

  function handleSaveAsDraft() {
    const existing = readContinuanceDraft(formId);
    upsertContinuanceStep4(formId, step4, 'draft', existing?.lastCompletedStep ?? 0);
    navigate(draftSummaryHref);
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
      <div className={styles.stepIndicator}>
        <OntarioStepIndicator
          showBackButton
          backButtonUrl={backHref}
          currentStep={CURRENT_STEP}
          numberOfSteps={CONTINUANCE_TOTAL_STEPS}
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

          <h1 className={`ontario-h1 ${styles.pageTitle}`}>Original incorporation</h1>
          <p className={styles.lead}>
            Identify the legislation under which the corporation was originally incorporated or
            amalgamated.
          </p>

          <div className={styles.formStack}>
            <div id={anchors.originalAct}>
              <OntarioRadioButtons
                caption="The corporation was originally incorporated/amalgamated under the:"
                name={`${anchors.originalAct}-group`}
                required
                value={step4.originalAct}
                options={[...radioOptions]}
                errorMessage={errors.originalAct}
                customOnChange={(event) => {
                  const value = getEventValue(event) as ContinuanceOriginalAct;
                  patchStep4({
                    originalAct: value,
                    otherActJurisdiction: value === 'other' ? step4.otherActJurisdiction : '',
                  });
                  clearError('originalAct');
                  if (value !== 'other') {
                    clearError('otherActJurisdiction');
                  }
                }}
              />
            </div>

            {step4.originalAct === 'other' ? (
              <div id={anchors.otherActJurisdiction}>
                <OntarioInput
                  elementId={anchors.otherActJurisdiction}
                  caption="Specify Act and jurisdiction"
                  name={anchors.otherActJurisdiction}
                  required
                  requiredValidationMessage={OTHER_ACT_ERROR}
                  value={step4.otherActJurisdiction}
                  errorMessage={errors.otherActJurisdiction}
                  customOnInput={(event) => {
                    patchStep4({ otherActJurisdiction: getEventValue(event) });
                    clearError('otherActJurisdiction');
                  }}
                />
              </div>
            ) : null}

            {/* ODS Date Input has no readOnly prop — OBR date is composed from tokens. */}
            <div>
              <p className={styles.naicsLabel}>Date of incorporation/amalgamation:</p>
              <p className={styles.naicsSelectedValue}>
                {formatIsoDateDisplay(OBR_INCORPORATION_DATE)}
              </p>
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
              label="Save as draft"
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
