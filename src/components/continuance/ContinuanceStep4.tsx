import { useMemo, useRef, useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContinuanceReviewReturn } from './continuanceReviewReturn';
import {
  OntarioButton,
  OntarioDateInput,
  OntarioInput,
  OntarioPageAlert,
  OntarioRadioButtons,
  OntarioStepIndicator,
} from '@ongov/ontario-design-system-component-library-react';
import { isIsoDateComplete } from '../form1/nameValidation';
import { aggregateDateFromEvent, syncDateFieldByAnchor } from '../form7/dateErrorSync';
import { focusField, getEventValue } from './continuanceFocus';
import {
  CONTINUANCE_ORIGINAL_ACT_OPTIONS,
  CONTINUANCE_TOTAL_STEPS,
  EMPTY_STEP4,
  ensureContinuanceStep4Draft,
  INVALID_DATE_ERROR,
  ORIGINAL_ACT_ERROR,
  OTHER_ACT_ERROR,
  FUTURE_INCORPORATION_DATE_ERROR,
  REQUIRED_FIELD_ERROR,
  readContinuanceDraft,
  upsertContinuanceStep4,
  type ContinuanceFormId,
  type ContinuanceOriginalAct,
  type ContinuanceStep4Data,
} from './continuanceDraftStorage';
import styles from '../form2/Form2Step1.module.scss';

const CURRENT_STEP = 4;

type FieldKey = 'originalAct' | 'otherActJurisdiction' | 'incorporationDate';
type FieldErrors = Partial<Record<FieldKey, string>>;

function fieldAnchors(formId: ContinuanceFormId): Record<FieldKey, string> {
  const prefix = `form${formId}`;
  return {
    originalAct: `${prefix}-original-act`,
    otherActJurisdiction: `${prefix}-other-act-jurisdiction`,
    incorporationDate: `${prefix}-incorporation-date`,
  };
}

function readShadowDateParts(anchorId: string) {
  const host = document
    .getElementById(anchorId)
    ?.querySelector<HTMLElement>('ontario-date-input');
  const root = host?.shadowRoot;
  if (!root) {
    return { day: '', month: '', year: '' };
  }
  return {
    year: root.querySelector<HTMLInputElement>('input[id^="year-"]')?.value ?? '',
    month: root.querySelector<HTMLInputElement>('input[id^="month-"]')?.value ?? '',
    day: root.querySelector<HTMLInputElement>('input[id^="day-"]')?.value ?? '',
  };
}

function isRealCalendarDate(year: string, month: string, day: string) {
  if (!/^\d{4}$/.test(year) || !/^\d{1,2}$/.test(month) || !/^\d{1,2}$/.test(day)) {
    return false;
  }
  const y = Number(year);
  const m = Number(month);
  const d = Number(day);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

function padDatePart(value: string, size: number) {
  return value.padStart(size, '0');
}

function isoFromParts(year: string, month: string, day: string) {
  return `${padDatePart(year, 4)}-${padDatePart(month, 2)}-${padDatePart(day, 2)}`;
}

function isFutureIsoDate(value: string, today = new Date()) {
  if (!isIsoDateComplete(value)) {
    return false;
  }
  const [y, m, d] = value.slice(0, 10).split('-').map(Number);
  const entered = Date.UTC(y, m - 1, d);
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return entered > todayUtc;
}

function isoDateParts(iso: string) {
  const [year, month, day] = iso.slice(0, 10).split('-');
  return { year: year ?? '', month: month ?? '', day: day ?? '' };
}

function validIsoFromInput(iso: string, anchorId: string) {
  const parts = readShadowDateParts(anchorId);
  if (isRealCalendarDate(parts.year, parts.month, parts.day)) {
    return isoFromParts(parts.year, parts.month, parts.day);
  }
  if (parts.day || parts.month || parts.year) {
    return '';
  }
  if (isIsoDateComplete(iso)) {
    const stored = isoDateParts(iso);
    if (isRealCalendarDate(stored.year, stored.month, stored.day)) {
      return iso.slice(0, 10);
    }
  }
  return '';
}

function incorporationDateError(iso: string, anchorId: string) {
  const parts = readShadowDateParts(anchorId);
  const typedParts = parts.day || parts.month || parts.year ? parts : isoDateParts(iso);
  const hasAny = Boolean(typedParts.day || typedParts.month || typedParts.year);
  const hasAll = Boolean(typedParts.day && typedParts.month && typedParts.year);

  if (!hasAny || !hasAll) {
    return REQUIRED_FIELD_ERROR;
  }

  if (!isRealCalendarDate(typedParts.year, typedParts.month, typedParts.day)) {
    return INVALID_DATE_ERROR;
  }

  const resolved = isoFromParts(typedParts.year, typedParts.month, typedParts.day);
  if (isFutureIsoDate(resolved)) {
    return FUTURE_INCORPORATION_DATE_ERROR;
  }
  return undefined;
}

type ContinuanceStep4Props = {
  formId: ContinuanceFormId;
};

export function ContinuanceStep4({ formId }: ContinuanceStep4Props) {
  const navigate = useNavigate();
  const { afterSave } = useContinuanceReviewReturn(formId);
  const draft = ensureContinuanceStep4Draft(formId);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const dateErrorsRef = useRef<FieldErrors>({});
  const currentYear = new Date().getFullYear();
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

  dateErrorsRef.current = errors;

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
      (['originalAct', 'otherActJurisdiction', 'incorporationDate'] as FieldKey[]).flatMap(
        (key) => {
          const message = errors[key];
          if (!message) {
            return [];
          }
          return [{ key, message, href: `#${anchors[key]}` }];
        },
      ),
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
      dateErrorsRef.current = next;
      if (key === 'incorporationDate') {
        window.requestAnimationFrame(() =>
          syncDateFieldByAnchor(anchors.incorporationDate, next.incorporationDate),
        );
      }
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

    const dateError = incorporationDateError(step4.incorporationDate, anchors.incorporationDate);
    if (dateError) {
      next.incorporationDate = dateError;
    }

    return next;
  }

  function handleContinue() {
    const resolvedDate = validIsoFromInput(step4.incorporationDate, anchors.incorporationDate);
    const toSave: ContinuanceStep4Data = {
      ...step4,
      incorporationDate: resolvedDate || step4.incorporationDate,
      otherActJurisdiction:
        step4.originalAct === 'other' ? step4.otherActJurisdiction : '',
    };
    if (resolvedDate && resolvedDate !== step4.incorporationDate) {
      patchStep4({ incorporationDate: resolvedDate });
    }

    const nextErrors = validateAll();
    dateErrorsRef.current = nextErrors;
    setErrors(nextErrors);
    const hasErrors = Object.keys(nextErrors).length > 0;
    setShowErrorSummary(hasErrors);
    window.requestAnimationFrame(() => {
      syncDateFieldByAnchor(anchors.incorporationDate, nextErrors.incorporationDate);
      if (hasErrors) {
        errorSummaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
    if (hasErrors) {
      return;
    }

    upsertContinuanceStep4(formId, toSave, 'continue');
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

            {/* ODS Date Input has no errorMessage prop — submit injects borders via sync. */}
            <div id={anchors.incorporationDate}>
              <OntarioDateInput
                elementId={`${anchors.incorporationDate}-input`}
                caption="Date of incorporation/amalgamation:"
                required
                maxYear={currentYear}
                value={step4.incorporationDate || undefined}
                dateValidator={() => {
                  const message = dateErrorsRef.current.incorporationDate;
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
                    patchStep4({ incorporationDate: next });
                  }
                  clearError('incorporationDate');
                }}
                onInputOnChange={(event) => {
                  const next = aggregateDateFromEvent(event);
                  if (next !== null) {
                    patchStep4({ incorporationDate: next });
                  }
                  clearError('incorporationDate');
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
