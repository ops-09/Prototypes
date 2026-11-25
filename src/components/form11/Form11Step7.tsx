import { useMemo, useRef, useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  OntarioButton,
  OntarioPageAlert,
  OntarioStepIndicator,
  OntarioTextarea,
} from '@ongov/ontario-design-system-component-library-react';
import { type UploadedFileMeta } from '../form1/FileUpload';
import { SupportingDocumentsUpload } from '../form7/SupportingDocumentsUpload';
import { type SupportingDocMeta } from '../form7/form7DraftStorage';
import { focusField, getEventValue } from './form11Focus';
import {
  AGREEMENT_EMPTY_ERROR,
  EMPTY_STEP7,
  ensureForm11PlaygroundDraft,
  FORM11_TOTAL_STEPS,
  hasForm11Agreement,
  readForm11Draft,
  upsertForm11Step7,
  type Form11Step7Data,
} from './form11DraftStorage';
import { FORM11_CERTIFIED_AGREEMENT_CAPTION } from './form11ReviewModel';
import styles from './Form11Step2.module.scss';
import { FormNameCard } from '../shared/FormNameCard';
import { BYB_FORM_NAME } from './form11BeforeYouBeginContent';

const CURRENT_STEP = 7;

type FieldKey = 'amalgamationAgreement';
type FieldErrors = Partial<Record<FieldKey, string>>;

function toSupportingDocs(file: UploadedFileMeta | null): SupportingDocMeta[] {
  if (!file) {
    return [];
  }
  return [
    {
      id: `agreement-${file.name}-${file.size}`,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
    },
  ];
}

function fromSupportingDocs(files: SupportingDocMeta[]): UploadedFileMeta | null {
  const first = files[0];
  if (!first) {
    return null;
  }
  return {
    name: first.name,
    size: first.size,
    type: first.type,
  };
}

export function Form11Step7() {
  const navigate = useNavigate();
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const [draft] = useState(() => ensureForm11PlaygroundDraft(7));

  const [step7, setStep7] = useState<Form11Step7Data>(() => ({
    ...EMPTY_STEP7,
    ...(draft.step7 ?? {}),
    amalgamationAgreement: draft.step7?.amalgamationAgreement ?? null,
    amalgamationAgreementText: draft.step7?.amalgamationAgreementText ?? '',
    additionalDocuments: draft.step7?.additionalDocuments ?? [],
  }));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  const errorSummaryItems = useMemo(() => {
    if (!errors.amalgamationAgreement) {
      return [];
    }
    return [
      {
        key: 'amalgamationAgreement',
        message: errors.amalgamationAgreement,
        href: '#amalgamation-agreement',
      },
    ];
  }, [errors]);

  function clearAgreementError() {
    setErrors((prev) => {
      if (!prev.amalgamationAgreement) {
        return prev;
      }
      const next = { ...prev };
      delete next.amalgamationAgreement;
      return next;
    });
  }

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (!hasForm11Agreement(step7)) {
      next.amalgamationAgreement = AGREEMENT_EMPTY_ERROR;
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
    upsertForm11Step7(step7, 'continue');
    navigate('/form-11/step-8');
  }

  function handleSaveAsDraft() {
    upsertForm11Step7(step7, 'draft', readForm11Draft()?.lastCompletedStep ?? 6);
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
      <div className={styles.stepIndicator}>
        <OntarioStepIndicator
          showBackButton
          backButtonUrl="/form-11/step-6"
          currentStep={CURRENT_STEP}
          numberOfSteps={FORM11_TOTAL_STEPS}
        />
      </div>


      <div className="ontario-row">
        <div className="ontario-columns ontario-small-12">
          <FormNameCard applicationType={BYB_FORM_NAME} />
        </div>
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

          <h1 className={`ontario-h1 ${styles.pageTitle}`}>Supporting documents</h1>
          <p className={styles.lead}>
            Upload a copy of the approved amalgamation agreement or enter it in the text
            field. You may also attach other documents that support this application.
          </p>

          <div className={styles.formStack}>
            <div id="amalgamation-agreement" className={styles.eitherOrGroup}>
              <p className={styles.naicsLabel}>
                {FORM11_CERTIFIED_AGREEMENT_CAPTION}
                <span className={styles.requiredFlag}> (required)</span>
              </p>
              {/* ODS gap: no rich-text WC in v8.1.0 — compose with OntarioTextarea. */}
              <div className={styles.textareaCaptionClip}>
                <OntarioTextarea
                  elementId="form11-amalgamation-agreement-text"
                  caption={'\u200B'}
                  name="amalgamation-agreement-text"
                  value={step7.amalgamationAgreementText}
                  errorMessage={errors.amalgamationAgreement}
                  customOnInput={(event) => {
                    const value = getEventValue(event);
                    setStep7((prev) => ({
                      ...prev,
                      amalgamationAgreementText: value,
                    }));
                    if (value.trim() || step7.amalgamationAgreement) {
                      clearAgreementError();
                    }
                  }}
                />
              </div>
              <div className={styles.orSeparator} role="separator" aria-hidden="true" />
              <SupportingDocumentsUpload
                label="Upload a PDF copy of the amalgamation agreement"
                hideLabel
                hideErrorText
                maxFiles={1}
                hintText="Or upload a PDF copy of the amalgamation agreement."
                value={toSupportingDocs(step7.amalgamationAgreement)}
                errorMessage={errors.amalgamationAgreement}
                onChange={(files) => {
                  setStep7((prev) => ({
                    ...prev,
                    amalgamationAgreement: fromSupportingDocs(files),
                  }));
                  if (files.length === 1 || step7.amalgamationAgreementText.trim()) {
                    clearAgreementError();
                  }
                }}
                inputId="form11-amalgamation-agreement"
              />
            </div>

            <SupportingDocumentsUpload
              label="Upload any other document to support this application"
              hintText="PDF only, maximum 20 MB per file."
              value={step7.additionalDocuments}
              showUploadedAt
              onChange={(files: SupportingDocMeta[]) =>
                setStep7((prev) => ({ ...prev, additionalDocuments: files }))
              }
              inputId="form11-additional-docs"
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
