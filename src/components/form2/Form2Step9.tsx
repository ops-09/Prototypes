import { useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { OntarioCheckboxes } from '@ongov/ontario-design-system-component-library-react';
import { FilingSubmitStep } from '../shared/FilingSubmitStep';
import { FileUpload } from './FileUpload';
import { ensureStep8Draft } from './Form2Step8';
import {
  createForm2ConfirmationNumber,
  EMPTY_STEP8,
  hasForm2Step1Data,
  upsertForm2Step8,
  type Form2Step8Data,
} from './form2DraftStorage';
import { resolveCoverLetterContact } from './form2ReviewModel';
import styles from './Form2Step1.module.scss';

const CURRENT_STEP = 10;
const TOTAL_STEPS = 10;
const AUTH_OPTION_VALUE = 'authorized';
const SIGNED_PDF_REQUIRED = 'Upload the signed PDF before submitting this filing.';

type SubmitErrors = Partial<{
  signedPdf: string;
  authorization: string;
}>;

export function Form2Step9() {
  const navigate = useNavigate();
  const draft = ensureStep8Draft();
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  const [step8, setStep8] = useState<Form2Step8Data>(() => ({
    ...EMPTY_STEP8,
    ...(draft.step8 ?? {}),
  }));
  const [errors, setErrors] = useState<SubmitErrors>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  const contact = resolveCoverLetterContact();
  const filerName = [contact.firstName, contact.lastName].filter(Boolean).join(' ');
  const authOptions = useMemo(
    () => [
      {
        value: AUTH_OPTION_VALUE,
        elementId: 'form2-authorization-confirm',
        label: `I, ${filerName}, confirm that I am authorized to file these Articles of Incorporation and that the information in this filing is true and complete.`,
      },
    ],
    [filerName],
  );

  if (!hasForm2Step1Data(draft.step1) || !draft.step7.incorporators.length) {
    return <Navigate to="/form-2" replace />;
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
    if (!step8.signedPdf) {
      next.signedPdf = SIGNED_PDF_REQUIRED;
    }
    if (!step8.authorizationConfirmed) {
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
    const confirmationNumber = createForm2ConfirmationNumber();
    upsertForm2Step8(step8, 'submitted', 9, confirmationNumber);
    navigate('/form-2/draft-summary');
  }

  return (
    <FilingSubmitStep
      currentStep={CURRENT_STEP}
      numberOfSteps={TOTAL_STEPS}
      backButtonUrl="/form-2/step-9"
      formIdPrefix="form2"
      lead="Upload the signed PDF and confirm you are authorized to file these Articles of Incorporation."
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
          inputId="form2-signed-pdf-upload"
          label="Upload signed PDF"
          required
          hintText="Upload the signed copy of the generated PDF. PDF only, maximum 20 MB."
          buttonLabel="Upload signed PDF"
          value={step8.signedPdf}
          errorMessage={errors.signedPdf}
          onChange={(file) => {
            setStep8((prev) => ({ ...prev, signedPdf: file }));
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
          name="form2-authorization"
          required
          options={authOptions}
          value={step8.authorizationConfirmed ? [AUTH_OPTION_VALUE] : []}
          errorMessage={errors.authorization}
          customOnChange={(event) => {
            const selected = (event.target as HTMLInputElement | null)?.checked;
            const nextChecked =
              typeof selected === 'boolean' ? selected : !step8.authorizationConfirmed;
            setStep8((prev) => ({ ...prev, authorizationConfirmed: nextChecked }));
            clearError('authorization');
          }}
        />
      }
      onSubmit={handleSubmit}
      onSaveAsDraft={() => {
        upsertForm2Step8(step8, 'draft', 8);
        navigate('/form-2/draft-summary');
      }}
      onCancel={() => navigate('/')}
    />
  );
}
