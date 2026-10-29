import { useMemo, useRef, useState, type MouseEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  OntarioButton,
  OntarioDateInput,
  OntarioPageAlert,
  OntarioStepIndicator,
  OntarioTextarea,
} from '@ongov/ontario-design-system-component-library-react';
import { isIsoDateComplete } from '../form1/nameValidation';
import { aggregateDateFromEvent, syncDateFieldByAnchor } from '../form7/dateErrorSync';
import { SupportingDocumentsUpload } from '../form7/SupportingDocumentsUpload';
import { focusField, getEventValue } from './form3Focus';
import {
  EMPTY_STEP4,
  FORM3_TOTAL_STEPS,
  MAX_PROVISIONS_CHARS,
  readForm3Draft,
  upsertForm3Step4,
  type Form3Step4Data,
  type SupportingDocMeta,
} from './form3DraftStorage';
import styles from './Form3Step1.module.scss';

const CURRENT_STEP = 4;
const DATE_ANCHOR = 'form3-resolution-date';
const FUTURE_DATE_ERROR = 'The resolution confirmation date cannot be in the future.';
const EMPTY_DATE_ERROR = 'Enter the resolution confirmation date.';
const EMPTY_DETAILS_ERROR =
  'Enter the details of the supplementary letters patent being requested.';
const PROVISIONS_HINT = {
  hint: 'What are supplementary letters patent?',
  content:
    'Supplementary letters patent change the corporation’s existing letters patent. Use this field to describe the provisions you are requesting, such as changes to the objects or special provisions of the corporation. The corporation is not insolvent within the meaning of subsection 1(3) of the Filings Regulation (O. Reg 393/21) under the Act.',
};

const PROVISIONS_HINT_TEXT =
  'The corporation is not insolvent within the meaning of subsection 1(3) of the Filings Regulation (O. Reg 393/21) under the Act.';

type FieldKey = 'resolutionConfirmedDate' | 'requestedProvisions';
type FieldErrors = Partial<Record<FieldKey, string>>;

function isFutureIsoDate(value: string, today = new Date()) {
  if (!isIsoDateComplete(value)) {
    return false;
  }
  const [y, m, d] = value.slice(0, 10).split('-').map(Number);
  const entered = Date.UTC(y, m - 1, d);
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return entered > todayUtc;
}

function isStep4Ready() {
  const existing = readForm3Draft();
  return Boolean(
    existing?.step1.corporationName && existing.nameChange.changeCorporationName,
  );
}

export function Form3Step4() {
  const navigate = useNavigate();
  const draft = readForm3Draft();
  const ready = isStep4Ready();
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const dateErrorsRef = useRef<FieldErrors>({});

  const [step4, setStep4] = useState<Form3Step4Data>(() => ({
    ...EMPTY_STEP4,
    ...(draft?.step4 ?? {}),
  }));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  dateErrorsRef.current = errors;

  const errorSummaryItems = useMemo(() => {
    const items: { key: FieldKey; message: string; href: string }[] = [];
    if (errors.resolutionConfirmedDate) {
      items.push({
        key: 'resolutionConfirmedDate',
        message: errors.resolutionConfirmedDate,
        href: `#${DATE_ANCHOR}`,
      });
    }
    if (errors.requestedProvisions) {
      items.push({
        key: 'requestedProvisions',
        message: errors.requestedProvisions,
        href: '#requested-provisions',
      });
    }
    return items;
  }, [errors]);

  function clearError(key: FieldKey) {
    setErrors((prev) => {
      if (!prev[key]) {
        return prev;
      }
      const next = { ...prev };
      delete next[key];
      dateErrorsRef.current = next;
      if (key === 'resolutionConfirmedDate') {
        window.requestAnimationFrame(() =>
          syncDateFieldByAnchor(DATE_ANCHOR, next.resolutionConfirmedDate),
        );
      }
      return next;
    });
  }

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (!isIsoDateComplete(step4.resolutionConfirmedDate)) {
      next.resolutionConfirmedDate = EMPTY_DATE_ERROR;
    } else if (isFutureIsoDate(step4.resolutionConfirmedDate)) {
      next.resolutionConfirmedDate = FUTURE_DATE_ERROR;
    }
    if (!step4.requestedProvisions.trim()) {
      next.requestedProvisions = EMPTY_DETAILS_ERROR;
    } else if (step4.requestedProvisions.length > MAX_PROVISIONS_CHARS) {
      next.requestedProvisions = `Details must be ${MAX_PROVISIONS_CHARS.toLocaleString()} characters or fewer.`;
    }
    return next;
  }

  function handleContinue() {
    const nextErrors = validate();
    dateErrorsRef.current = nextErrors;
    setErrors(nextErrors);
    const hasErrors = Object.keys(nextErrors).length > 0;
    setShowErrorSummary(hasErrors);
    window.requestAnimationFrame(() => {
      syncDateFieldByAnchor(DATE_ANCHOR, nextErrors.resolutionConfirmedDate);
      if (hasErrors) {
        errorSummaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
    if (hasErrors) {
      return;
    }
    upsertForm3Step4(step4, 'continue', 3);
    navigate('/form-3/step-5');
  }

  function handleSaveAsDraft() {
    upsertForm3Step4(step4, 'draft');
    navigate('/form-3/draft-summary');
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

  if (!ready || !draft) {
    return <Navigate to="/form-3/step-3" replace />;
  }

  return (
    <>
      <div className={styles.stepIndicator}>
        <OntarioStepIndicator
          showBackButton
          backButtonUrl="/form-3/step-3"
          currentStep={CURRENT_STEP}
          numberOfSteps={FORM3_TOTAL_STEPS}
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

          <h1 className={`ontario-h1 ${styles.pageTitle}`}>
            Supplementary letters patent
          </h1>
          <p className={styles.lead}>
            Provide the date shareholders or members confirmed the resolution and describe
            the provisions being requested.
          </p>

          <div className={styles.formStack}>
            <div id={DATE_ANCHOR} className={styles.resolutionDateBlock}>
              <p className={styles.resolutionDateLabel}>
                The resolution authorizing this application was confirmed by the shareholders/members of the corporation on:
                <span className={styles.requiredFlag}> (required)</span>
              </p>
              <p className={styles.helpText}>
                Under section 34 or 131 of the Corporations Act.
              </p>
              <div className={styles.resolutionDateInputClip}>
                <OntarioDateInput
                  elementId="form3-resolution-date-input"
                  caption={{
                    captionText: '\u200B',
                    captionType: 'default',
                  }}
                  required
                  value={step4.resolutionConfirmedDate || undefined}
                  dateValidator={() => {
                    const message = dateErrorsRef.current.resolutionConfirmedDate;
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
                      setStep4((prev) => ({ ...prev, resolutionConfirmedDate: next }));
                    }
                    clearError('resolutionConfirmedDate');
                  }}
                  onInputOnChange={(event) => {
                    const next = aggregateDateFromEvent(event);
                    if (next !== null) {
                      setStep4((prev) => ({ ...prev, resolutionConfirmedDate: next }));
                    }
                    clearError('resolutionConfirmedDate');
                  }}
                />
              </div>
            </div>

            <div id="requested-provisions">
              {/* ODS has no rich-text editor — OntarioTextarea only. */}
              <OntarioTextarea
                elementId="requested-provisions-input"
                caption="The corporation applies for the issue of supplementary letters patent to provide as follows:"
                name="requested-provisions"
                required
                hintText={PROVISIONS_HINT_TEXT}
                hintExpander={PROVISIONS_HINT}
                value={step4.requestedProvisions}
                errorMessage={errors.requestedProvisions}
                customOnInput={(event) => {
                  setStep4((prev) => ({
                    ...prev,
                    requestedProvisions: getEventValue(event),
                  }));
                  clearError('requestedProvisions');
                }}
              />
            </div>

            <SupportingDocumentsUpload
              label="Additional supporting documents"
              hintText="Upload any other document to support this application"
              value={step4.additional}
              onChange={(files: SupportingDocMeta[]) =>
                setStep4((prev) => ({ ...prev, additional: files }))
              }
              inputId="form3-additional-docs"
            />
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
