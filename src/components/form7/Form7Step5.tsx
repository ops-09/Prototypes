import { useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { OntarioCheckboxes } from '@ongov/ontario-design-system-component-library-react';
import { FileUpload } from '../form1/FileUpload';
import { isIsoDateComplete } from '../form1/nameValidation';
import { FilingSubmitStep } from '../shared/FilingSubmitStep';
import { ensureStep4Draft } from './Form7Step4';
import {
  createForm7ConfirmationNumber,
  EMPTY_STEP4,
  OBR_FILER_FIRST_NAME,
  OBR_FILER_LAST_NAME,
  upsertForm7Step4,
  type Form7Step4Data,
} from './form7DraftStorage';
import { formatIsoDateDisplay } from './form7Labels';
import styles from './Form7Step1.module.scss';

const CURRENT_STEP = 6;
const TOTAL_STEPS = 6;
const AUTH_OPTION_VALUE = 'authorized';
const SIGNED_PDF_REQUIRED = 'Upload the signed PDF before submitting this filing.';

type SubmitErrors = Partial<{
  signedPdf: string;
  authorization: string;
}>;

export function Form7Step5() {
  const navigate = useNavigate();
  const draft = ensureStep4Draft();
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  const [step4, setStep4] = useState<Form7Step4Data>(() => ({
    ...EMPTY_STEP4,
    ...(draft.step4 ?? {}),
    signedPdf: draft.step4?.signedPdf ?? null,
  }));
  const [errors, setErrors] = useState<SubmitErrors>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  const filerName = `${OBR_FILER_FIRST_NAME} ${OBR_FILER_LAST_NAME}`;
  const authOptions = useMemo(
    () => [
      {
        value: AUTH_OPTION_VALUE,
        elementId: 'form7-authorization-confirm',
        label: `I, ${filerName}, confirm that: The resolution authorizing the amendment was confirmed by the members of the co-operative on ${
          draft.step3.resolutionConfirmedDate &&
          isIsoDateComplete(draft.step3.resolutionConfirmedDate)
            ? formatIsoDateDisplay(draft.step3.resolutionConfirmedDate)
            : '(Date)'
        }.`,
      },
    ],
    [filerName, draft.step3.resolutionConfirmedDate],
  );

  if (!draft.step1.cooperativeName || !draft.step2.amendmentType) {
    return <Navigate to="/form-7/step-2" replace />;
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
    const confirmationNumber = createForm7ConfirmationNumber();
    upsertForm7Step4(step4, 'submitted', 5, confirmationNumber);
    navigate('/form-7/draft-summary');
  }

  return (
    <FilingSubmitStep
      currentStep={CURRENT_STEP}
      numberOfSteps={TOTAL_STEPS}
      backButtonUrl="/form-7/step-5"
      formIdPrefix="form7"
      lead="Upload the signed PDF and confirm you are authorized to file these Articles of Amendment."
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
          inputId="form7-signed-pdf-upload"
          label="Upload signed PDF"
          required
          hintText="Upload the signed copy of the generated PDF. PDF only, maximum 20 MB."
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
          name="form7-authorization"
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
        upsertForm7Step4(step4, 'draft', 4);
        navigate('/form-7/draft-summary');
      }}
      onCancel={() => navigate('/')}
    />
  );
}
