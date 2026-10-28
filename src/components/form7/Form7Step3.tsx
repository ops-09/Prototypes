import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  OntarioButton,
  OntarioCallout,
  OntarioCheckboxes,
  OntarioDateInput,
  OntarioPageAlert,
  OntarioStepIndicator,
} from '@ongov/ontario-design-system-component-library-react';
import { isIsoDateComplete } from '../form1/nameValidation';
import { aggregateDateFromEvent, syncDateFieldByAnchor } from './dateErrorSync';
import {
  affidavitsRequired,
  EMPTY_STEP2,
  EMPTY_STEP3,
  EMPTY_STEP4,
  emptyNameNuans,
  OBR_STEP1_DEFAULTS,
  readForm7Draft,
  saveForm7Draft,
  upsertForm7Step3,
  type Form7Step3Data,
  type SupportingDocMeta,
} from './form7DraftStorage';
import { SupportingDocumentsUpload } from './SupportingDocumentsUpload';
import styles from './Form7Step1.module.scss';

const CURRENT_STEP = 4;
const TOTAL_STEPS = 5;

const MANDATORY_DOCS_ERROR = 'Upload the required supporting documents.';
const SUBSECTIONS_ERROR =
  'Select at least one Co-operative Corporations Act subsection that authorizes the amendment.';

const AUTHORIZATION_SUBSECTION_OPTIONS = [
  { value: '151(1)', elementId: 'cca-151-1', label: '151(1)' },
  { value: '151(2)', elementId: 'cca-151-2', label: '151(2)' },
  { value: '151(2.1)', elementId: 'cca-151-2-1', label: '151(2.1)' },
  { value: '151(3)', elementId: 'cca-151-3', label: '151(3)' },
  { value: '151(4)', elementId: 'cca-151-4', label: '151(4)' },
] as const;

type FieldKey =
  | 'certifiedResolution'
  | 'authorizationSubsections'
  | 'affidavits'
  | 'supportingDocs'
  | 'resolutionConfirmedDate';
type FieldErrors = Partial<Record<FieldKey, string>>;

const FIELD_ANCHORS: Record<FieldKey, string> = {
  certifiedResolution: 'certified-resolution',
  authorizationSubsections: 'authorization-subsections',
  affidavits: 'affidavits',
  supportingDocs: 'supporting-docs',
  resolutionConfirmedDate: 'form7-resolution-date',
};

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

function ensureStep3Draft() {
  const existing = readForm7Draft();
  if (existing?.step1.cooperativeName && existing.step2.amendmentType) {
    // Legacy Step 3 playground seeds left changeCooperativeName empty, which hid
    // affidavits after affidavitsRequired was tightened to require an explicit "change".
    if (
      existing.step2.amendmentType === 'change-name' &&
      !existing.step2.changeCooperativeName
    ) {
      const patched = {
        ...existing,
        step2: {
          ...existing.step2,
          changeCooperativeName: 'change' as const,
        },
      };
      saveForm7Draft(patched);
      return patched;
    }
    return existing;
  }

  // Prototype deep-link: seed Steps 1–2 so /form-7/step-4 opens from the playground.
  const now = new Date().toISOString();
  const seeded = {
    step1: { ...OBR_STEP1_DEFAULTS },
    step2: {
      ...EMPTY_STEP2,
      nameNuans: emptyNameNuans(),
      amendmentType: 'change-name' as const,
      changeCooperativeName: 'change' as const,
    },
    step3: existing?.step3 ?? {
      ...EMPTY_STEP3,
      affidavits: [
        {
          id: 'seed-affidavit',
          name: 'Affidavit-of-Solvency.pdf',
          size: 102400,
          type: 'application/pdf',
          uploadedAt: now,
        },
      ],
    },
    step4: existing?.step4 ?? { ...EMPTY_STEP4 },
    savedAs: 'continue' as const,
    savedAt: now,
    lastCompletedStep: 2 as const,
  };
  saveForm7Draft(seeded);
  return seeded;
}

export function Form7Step3() {
  const navigate = useNavigate();
  const draft = ensureStep3Draft();
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const dateErrorsRef = useRef<FieldErrors>({});

  const [step3, setStep3] = useState<Form7Step3Data>(() => ({
    ...EMPTY_STEP3,
    ...(draft.step3 ?? {}),
    authorizationSubsections: draft.step3?.authorizationSubsections ?? [],
    resolutionConfirmedDate: draft.step3?.resolutionConfirmedDate ?? '',
  }));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  dateErrorsRef.current = errors;

  // Keep uploads / field answers in sessionStorage so a refresh does not wipe Step 3.
  useEffect(() => {
    upsertForm7Step3(step3, 'draft', draft.lastCompletedStep >= 3 ? 3 : 2);
  }, [draft.lastCompletedStep, step3]);

  const amendmentType = draft.step2.amendmentType ?? '';
  const needAffidavits = affidavitsRequired(
    amendmentType,
    draft.step2.changeCooperativeName ?? '',
  );

  const errorSummaryItems = useMemo(() => {
    const order: FieldKey[] = [
      'certifiedResolution',
      'authorizationSubsections',
      'affidavits',
      'supportingDocs',
      'resolutionConfirmedDate',
    ];
    return order.flatMap((key) => {
      const message = errors[key];
      if (!message) {
        return [];
      }
      return [{ key, message, href: `#${FIELD_ANCHORS[key]}` }];
    });
  }, [errors]);

  if (!draft.step1.cooperativeName || !amendmentType) {
    return <Navigate to="/form-7/step-2" replace />;
  }

  function clearError(key: FieldKey) {
    setErrors((prev) => {
      if (!prev[key]) {
        return prev;
      }
      const next = { ...prev };
      delete next[key];
      dateErrorsRef.current = next;
      if (key === 'resolutionConfirmedDate') {
        window.requestAnimationFrame(() => {
          syncDateFieldByAnchor(
            FIELD_ANCHORS.resolutionConfirmedDate,
            next.resolutionConfirmedDate,
          );
        });
      }
      return next;
    });
  }

  function patchDocs(
    key: 'certifiedResolution' | 'affidavits' | 'additional',
    files: SupportingDocMeta[],
    errorKey: FieldKey,
  ) {
    setStep3((prev) => ({ ...prev, [key]: files }));
    clearError(errorKey);
    clearError('supportingDocs');
  }

  function toggleSubsection(optionValue: string, checked: boolean) {
    setStep3((prev) => {
      const selected = new Set(prev.authorizationSubsections);
      if (checked) {
        selected.add(optionValue);
      } else {
        selected.delete(optionValue);
      }
      return {
        ...prev,
        authorizationSubsections: AUTHORIZATION_SUBSECTION_OPTIONS.map(
          (option) => option.value,
        ).filter((value) => selected.has(value)),
      };
    });
    clearError('authorizationSubsections');
  }

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (step3.certifiedResolution.length === 0) {
      next.certifiedResolution = MANDATORY_DOCS_ERROR;
    }
    if (step3.authorizationSubsections.length === 0) {
      next.authorizationSubsections = SUBSECTIONS_ERROR;
    }
    if (needAffidavits && step3.affidavits.length === 0) {
      next.affidavits = MANDATORY_DOCS_ERROR;
    }
    if (next.certifiedResolution || next.affidavits) {
      next.supportingDocs = MANDATORY_DOCS_ERROR;
    }
    if (!isIsoDateComplete(step3.resolutionConfirmedDate)) {
      next.resolutionConfirmedDate =
        'Enter the date the members confirmed the resolution authorizing the amendment.';
    }
    return next;
  }

  function handleContinue() {
    const nextErrors = validate();
    const hasErrors = Object.keys(nextErrors).length > 0;
    setErrors(nextErrors);
    dateErrorsRef.current = nextErrors;
    setShowErrorSummary(hasErrors);

    window.requestAnimationFrame(() => {
      syncDateFieldByAnchor(
        FIELD_ANCHORS.resolutionConfirmedDate,
        nextErrors.resolutionConfirmedDate,
      );
      if (hasErrors) {
        errorSummaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    if (hasErrors) {
      return;
    }

    upsertForm7Step3(step3, 'continue', 3);
    navigate('/form-7/step-5');
  }

  function handleSaveAsDraft() {
    upsertForm7Step3(step3, 'draft', 2);
    navigate('/form-7/draft-summary');
  }

  function handleCancel() {
    navigate('/');
  }

  function handleSummaryLinkClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
    event.preventDefault();
    focusField(href.replace('#', ''));
  }

  const requiredList = needAffidavits
    ? [
        'Certified copy of the resolution',
        'Affidavits of solvency (amendment), of two officers or of one officer and one director',
      ]
    : ['Certified copy of the resolution'];

  return (
    <>
      <div className={styles.stepIndicator}>
        <OntarioStepIndicator
          showBackButton
          backButtonUrl="/form-7/step-3"
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
                  {errorSummaryItems
                    .filter((item) => item.key !== 'supportingDocs')
                    .map((item) => (
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

          <h1 className={`ontario-h1 ${styles.pageTitle}`}>Supporting documents</h1>

          <p className={styles.lead}>
            Upload documentation required to support this Articles of Amendment filing. You
            can upload multiple files and remove them before submission. Uploads stay in this
            browser session until you clear site data or finish the filing.
          </p>

          <div id={FIELD_ANCHORS.supportingDocs} className={styles.formStack}>
            <OntarioCallout
              className={styles.flushCallout}
              headingContentType="string"
              headingContent="Required for this amendment"
              content={`Required documents: ${requiredList.join('; ')}.`}
            />

            <div id={FIELD_ANCHORS.certifiedResolution}>
              <SupportingDocumentsUpload
                label="Certified copy of the resolution"
                required
                hintText="Upload a certified copy of the resolution authorizing the amendment. You can upload more than one file."
                value={step3.certifiedResolution}
                errorMessage={errors.certifiedResolution}
                onChange={(files) => patchDocs('certifiedResolution', files, 'certifiedResolution')}
                inputId="certified-resolution-upload"
              />
            </div>

            <div id={FIELD_ANCHORS.authorizationSubsections}>
              <OntarioCheckboxes
                caption={{
                  captionText:
                    'The above amendment has been duly authorized as required by subsections 151(1), (2), (2.1), (3) and/or (4) of the Co-operative Corporations Act. Please choose the applicable subsections below:',
                  captionType: 'default',
                }}
                name="authorization-subsections"
                required
                hintExpander={{
                  hint: 'Which subsections apply to my amendment?',
                  content: 'TBD',
                }}
                options={[...AUTHORIZATION_SUBSECTION_OPTIONS]}
                value={step3.authorizationSubsections}
                errorMessage={errors.authorizationSubsections}
                customOnChange={(event) => {
                  const target = event.target as HTMLInputElement | null;
                  if (!target?.value) {
                    return;
                  }
                  toggleSubsection(target.value, Boolean(target.checked));
                }}
              />
            </div>

            {needAffidavits ? (
              <div id={FIELD_ANCHORS.affidavits}>
                <SupportingDocumentsUpload
                  label="Affidavits of solvency (amendment)"
                  required
                  hintText="Affidavits of two officers, or of one officer and one director, are required for a name change. You can upload more than one file."
                  value={step3.affidavits}
                  errorMessage={errors.affidavits}
                  onChange={(files) => patchDocs('affidavits', files, 'affidavits')}
                  inputId="affidavits-upload"
                />
              </div>
            ) : null}

            <SupportingDocumentsUpload
              label="Additional supporting documents"
              hintText="Optional. Upload any other documents that support this amendment. You can upload more than one file."
              value={step3.additional}
              onChange={(files) => patchDocs('additional', files, 'supportingDocs')}
              inputId="additional-docs-upload"
            />

            <div id={FIELD_ANCHORS.resolutionConfirmedDate}>
              <p className={styles.resolutionDateLabel}>
                The resolution authorizing the amendment was confirmed by the members of
                the co-operative on
                <span className={styles.requiredFlag}> (required)</span>
              </p>
              {/* DateInput always renders a required flag on its legend; clip that blank caption. */}
              <div className={styles.resolutionDateInputClip}>
                <OntarioDateInput
                  elementId="form7-resolution-date-input"
                  caption={{
                    captionText: '\u200B',
                    captionType: 'default',
                  }}
                  required
                  value={step3.resolutionConfirmedDate || undefined}
                  dateValidator={(_day, _month, _year) => {
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
                      setStep3((prev) => ({
                        ...prev,
                        resolutionConfirmedDate: next,
                      }));
                    }
                    clearError('resolutionConfirmedDate');
                  }}
                  onInputOnChange={(event) => {
                    const next = aggregateDateFromEvent(event);
                    if (next !== null) {
                      setStep3((prev) => ({
                        ...prev,
                        resolutionConfirmedDate: next,
                      }));
                    }
                    clearError('resolutionConfirmedDate');
                  }}
                />
              </div>
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
