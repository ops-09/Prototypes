import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OntarioCheckboxes } from '@ongov/ontario-design-system-component-library-react';
import { FileUpload } from '../form1/FileUpload';
import { FilingSubmitStep } from '../shared/FilingSubmitStep';
import {
  CONTINUANCE_FILING_TITLE,
  CONTINUANCE_TOTAL_STEPS,
  EMPTY_STEP10,
  createContinuanceConfirmationNumber,
  ensureContinuanceStep11Draft,
  upsertContinuanceStep10,
  type ContinuanceFormId,
  type ContinuanceStep10Data,
} from './continuanceDraftStorage';
import { resolveCoverLetterContact } from './continuanceReviewModel';
import styles from '../form2/Form2Step1.module.scss';

const CURRENT_STEP = 11;
const AUTH_OPTION_VALUE = 'authorized';
const SIGNED_PDF_REQUIRED = 'Upload the signed PDF before submitting this filing.';

type SubmitErrors = Partial<{
  signedPdf: string;
  authorization: string;
}>;

type ContinuanceStep11Props = {
  formId: ContinuanceFormId;
};

export function ContinuanceStep11({ formId }: ContinuanceStep11Props) {
  const navigate = useNavigate();
  const draft = ensureContinuanceStep11Draft(formId);
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  const [step10, setStep10] = useState<ContinuanceStep10Data>(() => ({
    ...EMPTY_STEP10,
    ...(draft.step10 ?? {}),
  }));
  const [errors, setErrors] = useState<SubmitErrors>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  const contact = resolveCoverLetterContact();
  const filerName = [contact.firstName, contact.lastName].filter(Boolean).join(' ');
  const title = CONTINUANCE_FILING_TITLE[formId];
  const authOptions = useMemo(
    () => [
      {
        value: AUTH_OPTION_VALUE,
        elementId: `form${formId}-authorization-confirm`,
        label: `I, ${filerName}, confirm that I am authorized to file these ${title} and that the information in this filing is true and complete.`,
      },
    ],
    [filerName, formId, title],
  );

  function clearError(key: keyof SubmitErrors) {
    setErrors((prev) => {
      if (!prev[key]) {
        return prev;
      }
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function validate(): SubmitErrors {
    const next: SubmitErrors = {};
    if (!step10.signedPdf) {
      next.signedPdf = SIGNED_PDF_REQUIRED;
    }
    if (!step10.authorizationConfirmed) {
      next.authorization =
        'Confirm the authorization statement before submitting the filing.';
    }
    return next;
  }

  function handleSubmit() {
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
    const confirmationNumber = createContinuanceConfirmationNumber(formId);
    upsertContinuanceStep10(formId, step10, 'submitted', 11, confirmationNumber);
    navigate(`/form-${formId}/draft-summary`);
  }

  return (
    <FilingSubmitStep
      currentStep={CURRENT_STEP}
      numberOfSteps={CONTINUANCE_TOTAL_STEPS}
      backButtonUrl={`/form-${formId}/step-10`}
      formIdPrefix={`form${formId}`}
      lead={`Upload the signed PDF and confirm you are authorized to file these ${title}.`}
      stepIndicatorClassName={styles.stepIndicator}
      pageTitleClassName={styles.pageTitle}
      leadClassName={styles.lead}
      formStackClassName={styles.formStack}
      alertClassName={styles.alert}
      errorSummaryLinkClassName={styles.errorSummaryLink}
      buttonGroupClassName={styles.buttonGroup}
      showErrorSummary={showErrorSummary}
      errorSummaryRef={errorSummaryRef}
      signedPdfError={errors.signedPdf}
      authorizationError={errors.authorization}
      upload={
        <FileUpload
          inputId={`form${formId}-signed-pdf-upload`}
          label="Upload signed PDF"
          required
          hintText="Upload the signed copy of the generated PDF."
          buttonLabel="Upload signed PDF"
          value={step10.signedPdf}
          errorMessage={errors.signedPdf}
          onChange={(file) => {
            setStep10((prev) => ({ ...prev, signedPdf: file }));
            clearError('signedPdf');
          }}
        />
      }
      authorization={
        <OntarioCheckboxes
          caption={{
            captionText: 'Authorization declaration',
            captionType: 'default',
          }}
          name={`form${formId}-authorization`}
          required
          options={authOptions}
          value={step10.authorizationConfirmed ? [AUTH_OPTION_VALUE] : []}
          errorMessage={errors.authorization}
          customOnChange={(event) => {
            const selected = (event.target as HTMLInputElement | null)?.checked;
            const nextChecked =
              typeof selected === 'boolean' ? selected : !step10.authorizationConfirmed;
            setStep10((prev) => ({ ...prev, authorizationConfirmed: nextChecked }));
            clearError('authorization');
          }}
        />
      }
      onSubmit={handleSubmit}
      onSaveAsDraft={() => {
        upsertContinuanceStep10(formId, step10, 'draft', 10);
        navigate(`/form-${formId}/draft-summary`);
      }}
      onCancel={() => navigate('/')}
    />
  );
}
