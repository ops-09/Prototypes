import { useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { OntarioCheckboxes } from '@ongov/ontario-design-system-component-library-react';
import { FileUpload } from '../form1/FileUpload';
import { FilingSubmitStep } from '../shared/FilingSubmitStep';
import { isStep4Ready } from './Form10Step4';
import {
  createForm10ConfirmationNumber,
  EMPTY_STEP4,
  FORM10_TOTAL_STEPS,
  OBR_FILER_FIRST_NAME,
  OBR_FILER_LAST_NAME,
  readForm10Draft,
  upsertForm10Step4,
  type Form10Step4Data,
} from './form10DraftStorage';
import styles from './Form10Step1.module.scss';

const CURRENT_STEP = 7;
const AUTH_OPTION_VALUE = 'authorized';
const SIGNED_PDF_REQUIRED = 'Upload the signed PDF before submitting this filing.';

type SubmitErrors = Partial<{
  signedPdf: string;
  authorization: string;
}>;

export function Form10Step5() {
  const navigate = useNavigate();
  const draft = readForm10Draft();
  const ready = isStep4Ready();
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  const [step4, setStep4] = useState<Form10Step4Data>(() => ({
    ...EMPTY_STEP4,
    ...(draft?.step4 ?? {}),
    signedPdf: draft?.step4?.signedPdf ?? null,
  }));
  const [errors, setErrors] = useState<SubmitErrors>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  const filerName = `${OBR_FILER_FIRST_NAME} ${OBR_FILER_LAST_NAME}`;
  const authOptions = useMemo(
    () => [
      {
        value: AUTH_OPTION_VALUE,
        elementId: 'form10-authorization-confirm',
        label: `I, ${filerName}, confirm that: I have printed or saved the PDF document and it has been signed by all the required person(s) in accordance with the Act, Regulations and Director’s/Registrar’s Requirements. I also agree to the Terms and Conditions and confirm that all required person(s) and/or entities agree to them.`,
      },
    ],
    [filerName],
  );

  if (!ready || !draft) {
    return <Navigate to="/form-10/step-6" replace />;
  }

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
    if (!step4.signedPdf) {
      next.signedPdf = SIGNED_PDF_REQUIRED;
    }
    if (!step4.authorizationConfirmed) {
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
    const confirmationNumber = createForm10ConfirmationNumber();
    upsertForm10Step4(step4, 'submitted', 6, confirmationNumber);
    navigate('/form-10/draft-summary');
  }

  return (
    <FilingSubmitStep
      currentStep={CURRENT_STEP}
      numberOfSteps={FORM10_TOTAL_STEPS}
      backButtonUrl="/form-10/step-6"
      formIdPrefix="form10"
      lead="Upload the signed PDF and confirm you are authorized to file these Articles of Amalgamation."
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
          inputId="form10-signed-pdf-upload"
          label="Upload signed PDF"
          required
          hintText="Upload the signed copy of the generated PDF. PDF only, maximum 20 MB. (required)"
          buttonLabel="Upload signed PDF"
          value={step4.signedPdf}
          errorMessage={errors.signedPdf}
          onChange={(file) => {
            setStep4((prev) => ({ ...prev, signedPdf: file }));
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
          name="form10-authorization"
          required
          options={authOptions}
          value={step4.authorizationConfirmed ? [AUTH_OPTION_VALUE] : []}
          errorMessage={errors.authorization}
          customOnChange={(event) => {
            const selected = (event.target as HTMLInputElement | null)?.checked;
            const nextChecked =
              typeof selected === 'boolean' ? selected : !step4.authorizationConfirmed;
            setStep4((prev) => ({ ...prev, authorizationConfirmed: nextChecked }));
            clearError('authorization');
          }}
        />
      }
      onSubmit={handleSubmit}
      onSaveAsDraft={() => {
        upsertForm10Step4(step4, 'draft', 5);
        navigate('/form-10/draft-summary');
      }}
      onCancel={() => {
        const leave = window.confirm('Leave this filing without saving further changes?');
        if (leave) {
          navigate('/');
        }
      }}
    />
  );
}
