import { useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { OntarioCheckboxes } from '@ongov/ontario-design-system-component-library-react';
import { FileUpload } from '../form1/FileUpload';
import { FilingSubmitStep } from '../shared/FilingSubmitStep';
import { isStep5Ready } from './Form3Step5';
import {
  createForm3ConfirmationNumber,
  EMPTY_STEP5,
  FORM3_TOTAL_STEPS,
  OBR_FILER_FIRST_NAME,
  OBR_FILER_LAST_NAME,
  readForm3Draft,
  upsertForm3Step5,
  type Form3Step5Data,
} from './form3DraftStorage';
import styles from './Form3Step1.module.scss';

const CURRENT_STEP = 6;
const AUTH_OPTION_VALUE = 'authorized';
const SIGNED_PDF_REQUIRED = 'Upload the signed PDF before submitting this filing.';

type SubmitErrors = Partial<{
  signedPdf: string;
  authorization: string;
}>;

export function Form3Step6() {
  const navigate = useNavigate();
  const draft = readForm3Draft();
  const ready = isStep5Ready();
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  const [step5, setStep5] = useState<Form3Step5Data>(() => ({
    ...EMPTY_STEP5,
    ...(draft?.step5 ?? {}),
    signedPdf: draft?.step5?.signedPdf ?? null,
  }));
  const [errors, setErrors] = useState<SubmitErrors>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  const filerName = `${OBR_FILER_FIRST_NAME} ${OBR_FILER_LAST_NAME}`;
  const authOptions = useMemo(
    () => [
      {
        value: AUTH_OPTION_VALUE,
        elementId: 'form3-authorization-confirm',
        label: `I, ${filerName}, confirm that: I have printed or saved the PDF document and it has been signed by all the required person(s) in accordance with the Act, Regulations and Director’s/Registrar’s Requirements. I also agree to the Terms and Conditions and confirm that all required person(s) and/or entities agree to them.`,
      },
    ],
    [filerName],
  );

  if (!ready || !draft) {
    return <Navigate to="/form-3/step-5" replace />;
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
    if (!step5.signedPdf) {
      next.signedPdf = SIGNED_PDF_REQUIRED;
    }
    if (!step5.authorizationConfirmed) {
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
    const confirmationNumber = createForm3ConfirmationNumber();
    upsertForm3Step5(step5, 'submitted', 5, confirmationNumber);
    navigate('/form-3/draft-summary');
  }

  return (
    <FilingSubmitStep
      currentStep={CURRENT_STEP}
      numberOfSteps={FORM3_TOTAL_STEPS}
      backButtonUrl="/form-3/step-5"
      formIdPrefix="form3"
      lead="Upload the signed PDF and confirm you are authorized to file this Application for Supplementary Letters Patent."
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
          inputId="form3-signed-pdf-upload"
          label="Upload signed PDF"
          required
          hintText="Upload the signed copy of the generated PDF. PDF only, maximum 20 MB. (required)"
          buttonLabel="Upload signed PDF"
          value={step5.signedPdf}
          errorMessage={errors.signedPdf}
          onChange={(file) => {
            setStep5((prev) => ({ ...prev, signedPdf: file }));
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
          name="form3-authorization"
          required
          options={authOptions}
          value={step5.authorizationConfirmed ? [AUTH_OPTION_VALUE] : []}
          errorMessage={errors.authorization}
          customOnChange={(event) => {
            const selected = (event.target as HTMLInputElement | null)?.checked;
            const nextChecked =
              typeof selected === 'boolean' ? selected : !step5.authorizationConfirmed;
            setStep5((prev) => ({ ...prev, authorizationConfirmed: nextChecked }));
            clearError('authorization');
          }}
        />
      }
      onSubmit={handleSubmit}
      onSaveAsDraft={() => {
        upsertForm3Step5(step5, 'draft', 4);
        navigate('/form-3/draft-summary');
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
