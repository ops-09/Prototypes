import { ContactInformationForm } from '../components/cover-letter/ContactInformationForm';
import formStyles from '../components/cover-letter/ContactInformationForm.module.scss';
import { FORM11_TOTAL_STEPS } from '../components/form11/form11DraftStorage';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

/** Form 11 cover letter / contact information (step 1 of 9). */
export function Form11Page() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <ContactInformationForm
        continueHref="/form-11/step-2"
        currentStep={1}
        numberOfSteps={FORM11_TOTAL_STEPS}
        backButtonUrl="/form-11"
        primaryButtonLabel="Continue"
      />
    </PlaygroundShell>
  );
}
