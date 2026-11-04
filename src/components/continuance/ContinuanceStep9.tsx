import { useMemo, useRef, useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  OntarioButton,
  OntarioCheckboxes,
  OntarioDateInput,
  OntarioInput,
  OntarioPageAlert,
  OntarioRadioButtons,
  OntarioStepIndicator,
} from '@ongov/ontario-design-system-component-library-react';
import { isIsoDateComplete } from '../form1/nameValidation';
import { aggregateDateFromEvent, syncDateFieldByAnchor } from '../form7/dateErrorSync';
import { focusField, getEventValue } from './continuanceFocus';
import { useContinuanceReviewReturn } from './continuanceReviewReturn';
import {
  AUTHORIZING_ACT_ERROR,
  CONTINUANCE_ORIGINAL_ACT_OPTIONS,
  CONTINUANCE_TOTAL_STEPS,
  EMPTY_STEP9,
  ensureContinuanceStep9Draft,
  FUTURE_AUTHORIZATION_DATE_ERROR,
  INVALID_DATE_ERROR,
  readContinuanceDraft,
  REQUIRED_FIELD_ERROR,
  STATEMENT_CONFIRM_ERROR,
  upsertContinuanceStep9,
  type ContinuanceFormId,
  type ContinuanceOriginalAct,
  type ContinuanceStep9Data,
} from './continuanceDraftStorage';
import styles from '../form2/Form2Step1.module.scss';

const CURRENT_STEP = 9;
const DATE_ANCHOR = 'authorization-date';

type StatementKey =
  | 'cooperativeBasisConfirmed'
  | 'subsection158Confirmed'
  | 'continuedUnderActConfirmed'
  | 'notInsolventConfirmed';

type FieldKey =
  | StatementKey
  | 'attestationConfirmed'
  | 'authorizingAct'
  | 'otherActJurisdiction'
  | 'authorizationDate';
type FieldErrors = Partial<Record<FieldKey, string>>;

const STATEMENT_ORDER: StatementKey[] = [
  'cooperativeBasisConfirmed',
  'subsection158Confirmed',
  'continuedUnderActConfirmed',
  'notInsolventConfirmed',
];

const STATEMENT_TEXT: Record<StatementKey, string> = {
  cooperativeBasisConfirmed:
    'The co-operative will be organized and operated and will carry on business on a co-operative basis.',
  subsection158Confirmed:
    'The corporation has complied with subsection 158(3) or 158.1(3), as applicable, of the Co-operative Corporations Act.',
  continuedUnderActConfirmed:
    'The corporation is to be continued under the Co-operative Corporations Act to the same extent as if it had been incorporated thereunder.',
  notInsolventConfirmed:
    'The corporation is not insolvent within the meaning of subsection 1(5) of the Co-operative Corporations Act.',
};

const STATEMENT_CLAUSE: Record<StatementKey, Record<ContinuanceFormId, number>> = {
  cooperativeBasisConfirmed: { 14: 21, 15: 20 },
  subsection158Confirmed: { 14: 22, 15: 21 },
  continuedUnderActConfirmed: { 14: 24, 15: 23 },
  notInsolventConfirmed: { 14: 25, 15: 24 },
};

const FIELD_ANCHORS: Record<FieldKey, string> = {
  cooperativeBasisConfirmed: 'cooperative-basis',
  subsection158Confirmed: 'subsection-158',
  continuedUnderActConfirmed: 'continued-under-act',
  notInsolventConfirmed: 'not-insolvent',
  attestationConfirmed: 'declaration-attestation',
  authorizingAct: 'authorizing-act',
  otherActJurisdiction: 'authorizing-other-act',
  authorizationDate: DATE_ANCHOR,
};

const FIELD_ORDER: FieldKey[] = [
  ...STATEMENT_ORDER,
  'authorizingAct',
  'otherActJurisdiction',
  'authorizationDate',
  'attestationConfirmed',
];

function statementOptionValue(key: StatementKey) {
  return key;
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

function authorizationDateError(iso: string, anchorId: string) {
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
    return FUTURE_AUTHORIZATION_DATE_ERROR;
  }
  return undefined;
}

function attestationText(formId: ContinuanceFormId) {
  const shareCapital = formId === 14 ? 'with Share Capital' : 'without Share Capital';
  return `I hereby certify that I am an authorized officer of the Corporation applying to continue as a Co-operative ${shareCapital} under the Co-operative Corporations Act and that the statements made in this application are true, accurate and complete.`;
}

type ContinuanceStep9Props = {
  formId: ContinuanceFormId;
};

export function ContinuanceStep9({ formId }: ContinuanceStep9Props) {
  const navigate = useNavigate();
  const { afterSave } = useContinuanceReviewReturn(formId);
  const draft = ensureContinuanceStep9Draft(formId);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const dateErrorsRef = useRef<FieldErrors>({});
  const currentYear = new Date().getFullYear();

  const [step9, setStep9] = useState<ContinuanceStep9Data>(() => ({
    ...EMPTY_STEP9,
    ...(draft.step9 ?? {}),
  }));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  dateErrorsRef.current = errors;

  const radioOptions = useMemo(
    () =>
      CONTINUANCE_ORIGINAL_ACT_OPTIONS.map((option) => ({
        value: option.value,
        label: option.label,
        elementId: `${FIELD_ANCHORS.authorizingAct}-${option.value}`,
      })),
    [],
  );

  const errorSummaryItems = useMemo(
    () =>
      FIELD_ORDER.flatMap((key) => {
        if (key === 'otherActJurisdiction' && step9.authorizingAct !== 'other') {
          return [];
        }
        const message = errors[key];
        if (!message) {
          return [];
        }
        return [{ key, message, href: `#${FIELD_ANCHORS[key]}` }];
      }),
    [errors, step9.authorizingAct],
  );

  function patchStep9(partial: Partial<ContinuanceStep9Data>) {
    setStep9((prev) => ({ ...prev, ...partial }));
  }

  function clearError(key: FieldKey) {
    setErrors((prev) => {
      if (!prev[key]) {
        return prev;
      }
      const next = { ...prev };
      delete next[key];
      dateErrorsRef.current = next;
      if (key === 'authorizationDate') {
        window.requestAnimationFrame(() =>
          syncDateFieldByAnchor(DATE_ANCHOR, next.authorizationDate),
        );
      }
      return next;
    });
  }

  function validateAll(): FieldErrors {
    const next: FieldErrors = {};

    for (const key of STATEMENT_ORDER) {
      if (!step9[key]) {
        next[key] = STATEMENT_CONFIRM_ERROR;
      }
    }

    if (!step9.authorizingAct) {
      next.authorizingAct = AUTHORIZING_ACT_ERROR;
    } else if (step9.authorizingAct === 'other' && !step9.otherActJurisdiction.trim()) {
      next.otherActJurisdiction = REQUIRED_FIELD_ERROR;
    }

    const dateError = authorizationDateError(step9.authorizationDate, DATE_ANCHOR);
    if (dateError) {
      next.authorizationDate = dateError;
    }

    if (!step9.attestationConfirmed) {
      next.attestationConfirmed = STATEMENT_CONFIRM_ERROR;
    }

    return next;
  }

  function handleContinue() {
    const resolvedDate = validIsoFromInput(step9.authorizationDate, DATE_ANCHOR);
    const toSave: ContinuanceStep9Data = {
      ...step9,
      authorizationDate: resolvedDate || step9.authorizationDate,
      otherActJurisdiction:
        step9.authorizingAct === 'other' ? step9.otherActJurisdiction : '',
    };
    if (resolvedDate && resolvedDate !== step9.authorizationDate) {
      patchStep9({ authorizationDate: resolvedDate });
    }

    const nextErrors = validateAll();
    dateErrorsRef.current = nextErrors;
    setErrors(nextErrors);
    const hasErrors = Object.keys(nextErrors).length > 0;
    setShowErrorSummary(hasErrors);
    window.requestAnimationFrame(() => {
      syncDateFieldByAnchor(DATE_ANCHOR, nextErrors.authorizationDate);
      if (hasErrors) {
        errorSummaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
    if (hasErrors) {
      return;
    }

    upsertContinuanceStep9(formId, toSave, 'continue');
    navigate(afterSave(`/form-${formId}/step-10`));
  }

  function handleSaveAsDraft() {
    upsertContinuanceStep9(
      formId,
      {
        ...step9,
        otherActJurisdiction:
          step9.authorizingAct === 'other' ? step9.otherActJurisdiction : '',
      },
      'draft',
      readContinuanceDraft(formId)?.lastCompletedStep ?? 8,
    );
    navigate(`/form-${formId}/draft-summary`);
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
          backButtonUrl={`/form-${formId}/step-8`}
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

          <h1 className={`ontario-h1 ${styles.pageTitle}`}>Declarations and authorization</h1>
          <p className={styles.lead}>
            Confirm the required statements, then identify the Act and date under which the
            continuation was authorized.
          </p>

          <div className={styles.formStack}>
            {STATEMENT_ORDER.map((key) => (
              <div key={key} id={FIELD_ANCHORS[key]}>
                <OntarioCheckboxes
                  caption={`Clause ${STATEMENT_CLAUSE[key][formId]}`}
                  name={FIELD_ANCHORS[key]}
                  required
                  options={[
                    {
                      value: statementOptionValue(key),
                      elementId: `${FIELD_ANCHORS[key]}-confirm`,
                      label: STATEMENT_TEXT[key],
                    },
                  ]}
                  value={step9[key] ? [statementOptionValue(key)] : []}
                  errorMessage={errors[key]}
                  customOnChange={(event) => {
                    const selected = (event.target as HTMLInputElement | null)?.checked;
                    const nextChecked =
                      typeof selected === 'boolean' ? selected : !step9[key];
                    patchStep9({ [key]: nextChecked });
                    clearError(key);
                  }}
                />
              </div>
            ))}

            <div id={FIELD_ANCHORS.authorizingAct}>
              <OntarioRadioButtons
                caption="The continuation of the corporation under the Co-operative Corporations Act has been properly authorized under the"
                name={`${FIELD_ANCHORS.authorizingAct}-group`}
                required
                value={step9.authorizingAct}
                options={[...radioOptions]}
                errorMessage={errors.authorizingAct}
                customOnChange={(event) => {
                  const value = getEventValue(event) as ContinuanceOriginalAct;
                  patchStep9({
                    authorizingAct: value,
                    otherActJurisdiction:
                      value === 'other' ? step9.otherActJurisdiction : '',
                  });
                  clearError('authorizingAct');
                  if (value !== 'other') {
                    clearError('otherActJurisdiction');
                  }
                }}
              />
            </div>

            {step9.authorizingAct === 'other' ? (
              <div id={FIELD_ANCHORS.otherActJurisdiction}>
                <OntarioInput
                  elementId={FIELD_ANCHORS.otherActJurisdiction}
                  caption="Specify Act and jurisdiction"
                  name={FIELD_ANCHORS.otherActJurisdiction}
                  required
                  requiredValidationMessage={REQUIRED_FIELD_ERROR}
                  value={step9.otherActJurisdiction}
                  errorMessage={errors.otherActJurisdiction}
                  customOnInput={(event) => {
                    patchStep9({ otherActJurisdiction: getEventValue(event) });
                    clearError('otherActJurisdiction');
                  }}
                />
              </div>
            ) : null}

            {/* ODS Date Input has no errorMessage prop — submit injects borders via sync. */}
            <div id={DATE_ANCHOR}>
              <OntarioDateInput
                elementId={`${DATE_ANCHOR}-input`}
                caption="Date of authorization"
                required
                maxYear={currentYear}
                value={step9.authorizationDate || undefined}
                dateValidator={() => {
                  const message = dateErrorsRef.current.authorizationDate;
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
                    patchStep9({ authorizationDate: next });
                  }
                  clearError('authorizationDate');
                }}
                onInputOnChange={(event) => {
                  const next = aggregateDateFromEvent(event);
                  if (next !== null) {
                    patchStep9({ authorizationDate: next });
                  }
                  clearError('authorizationDate');
                }}
              />
            </div>

            <div id={FIELD_ANCHORS.attestationConfirmed}>
              <OntarioCheckboxes
                caption="Declaration and Attestation"
                name={FIELD_ANCHORS.attestationConfirmed}
                required
                options={[
                  {
                    value: 'attestationConfirmed',
                    elementId: `${FIELD_ANCHORS.attestationConfirmed}-confirm`,
                    label: attestationText(formId),
                  },
                ]}
                value={step9.attestationConfirmed ? ['attestationConfirmed'] : []}
                errorMessage={errors.attestationConfirmed}
                customOnChange={(event) => {
                  const selected = (event.target as HTMLInputElement | null)?.checked;
                  const nextChecked =
                    typeof selected === 'boolean' ? selected : !step9.attestationConfirmed;
                  patchStep9({ attestationConfirmed: nextChecked });
                  clearError('attestationConfirmed');
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
