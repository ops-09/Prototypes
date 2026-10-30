import { useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { OntarioCheckboxes } from '@ongov/ontario-design-system-component-library-react';
import { SupportingDocumentsUpload } from '../form7/SupportingDocumentsUpload';
import { type SupportingDocMeta } from '../form7/form7DraftStorage';
import { SIGNED_IN_INDIVIDUAL } from '../../mock/signedInIndividual';
import { FilingSubmitStep } from '../shared/FilingSubmitStep';
import { ensureStep8Draft, hasPriorSteps } from './Form11Step8';
import {
  createForm11ConfirmationNumber,
  EMPTY_STEP8,
  FORM11_TOTAL_STEPS,
  upsertForm11Step8,
  type Form11Step8Data,
} from './form11DraftStorage';
import styles from './Form11Step2.module.scss';

const CURRENT_STEP = 9;
const AUTH_OPTION_VALUE = 'authorized';
const SIGNED_PDF_REQUIRED = 'Upload the signed PDF before submitting this filing.';

type SubmitErrors = Partial<{
  signedPdf: string;
  authorization: string;
}>;

export function Form11Step9() {
  const navigate = useNavigate();
  const draft = ensureStep8Draft();
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  const [step8, setStep8] = useState<Form11Step8Data>(() => ({
    ...EMPTY_STEP8,
    ...(draft.step8 ?? {}),
    signedPdf: draft.step8?.signedPdf ?? null,
  }));
  const [errors, setErrors] = useState<SubmitErrors>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  const filerName = [SIGNED_IN_INDIVIDUAL.firstName, SIGNED_IN_INDIVIDUAL.lastName]
    .filter(Boolean)
    .join(' ');
  const authOptions = useMemo(
    () => [
      {
        value: AUTH_OPTION_VALUE,
        elementId: 'form11-authorization-confirm',
        label: `I, ${filerName}, confirm that: I have printed or saved the PDF document and it has been signed by all the required person(s) in accordance with the Act, Regulations and Director’s/Registrar’s Requirements. I also agree to the Terms and Conditions and confirm that all required person(s) and/or entities agree to them.`,
      },
    ],
    [filerName],
  );

  if (!hasPriorSteps(draft)) {
    return <Navigate to="/form-11/step-8" replace />;
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
    const confirmationNumber = createForm11ConfirmationNumber();
    upsertForm11Step8(step8, 'submitted', 9, confirmationNumber);
    navigate('/form-11/draft-summary');
  }

  return (
    <FilingSubmitStep
      currentStep={CURRENT_STEP}
      numberOfSteps={FORM11_TOTAL_STEPS}
      backButtonUrl="/form-11/step-8"
      formIdPrefix="form11"
      lead="Upload the signed PDF and confirm you are authorized to file this Application for Letters Patent of Amalgamation."
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
        <SupportingDocumentsUpload
          inputId="form11-signed-pdf-upload"
          label="Upload signed PDF"
          required
          hintText="Upload the signed copy of the generated PDF. PDF only, maximum 20 MB. (required)"
          maxFiles={1}
          showUploadedAt
          value={step8.signedPdf ? [step8.signedPdf] : []}
          errorMessage={errors.signedPdf}
          onChange={(files: SupportingDocMeta[]) => {
            setStep8((prev) => ({ ...prev, signedPdf: files[0] ?? null }));
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
          name="form11-authorization"
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
        upsertForm11Step8(step8, 'draft', 8);
        navigate('/form-11/draft-summary');
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
