import { useMemo, useRef, useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  OntarioButton,
  OntarioPageAlert,
  OntarioStepIndicator,
} from '@ongov/ontario-design-system-component-library-react';
import { FileUpload } from '../form1/FileUpload';
import { SupportingDocumentsUpload } from '../form7/SupportingDocumentsUpload';
import { type SupportingDocMeta } from '../form7/form7DraftStorage';
import { focusField } from './form11Focus';
import {
  AGREEMENT_EMPTY_ERROR,
  EMPTY_STEP7,
  ensureForm11PlaygroundDraft,
  FORM11_TOTAL_STEPS,
  readForm11Draft,
  upsertForm11Step7,
  type Form11Step7Data,
} from './form11DraftStorage';
import { FORM11_CERTIFIED_AGREEMENT_CAPTION } from './form11ReviewModel';
import styles from './Form11Step2.module.scss';

const CURRENT_STEP = 7;

type FieldKey = 'amalgamationAgreement';
type FieldErrors = Partial<Record<FieldKey, string>>;

export function Form11Step7() {
  const navigate = useNavigate();
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const [draft] = useState(() => ensureForm11PlaygroundDraft(7));

  const [step7, setStep7] = useState<Form11Step7Data>(() => ({
    ...EMPTY_STEP7,
    ...(draft.step7 ?? {}),
    amalgamationAgreement: draft.step7?.amalgamationAgreement ?? null,
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
    if (!step7.amalgamationAgreement) {
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
            Upload a copy of the approved amalgamation agreement. You may also attach other
            documents that support this application.
          </p>

          <div className={styles.formStack}>
            <div id="amalgamation-agreement">
              <FileUpload
                inputId="form11-amalgamation-agreement"
                label={FORM11_CERTIFIED_AGREEMENT_CAPTION}
                required
                value={step7.amalgamationAgreement}
                errorMessage={errors.amalgamationAgreement}
                onChange={(file) => {
                  setStep7((prev) => ({ ...prev, amalgamationAgreement: file }));
                  clearAgreementError();
                }}
              />
            </div>

            <SupportingDocumentsUpload
              label="Upload any other document to support this application (optional)"
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
