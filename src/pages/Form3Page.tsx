import { ContactInformationForm } from '../components/cover-letter/ContactInformationForm';
import formStyles from '../components/cover-letter/ContactInformationForm.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

/** Form 3 cover letter / contact information (step 1 of 6). */
export function Form3Page() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <ContactInformationForm
        continueHref="/form-3/step-2"
        currentStep={1}
        numberOfSteps={6}
        backButtonUrl="/form-3"
        primaryButtonLabel="Continue"
      />
    </PlaygroundShell>
  );
}
