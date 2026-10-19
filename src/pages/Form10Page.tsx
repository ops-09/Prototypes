import { ContactInformationForm } from '../components/cover-letter/ContactInformationForm';
import formStyles from '../components/cover-letter/ContactInformationForm.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

/** Form 10 cover letter / contact information (step 1 of 6). */
export function Form10Page() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <ContactInformationForm
        continueHref="/form-10/step-2"
        currentStep={1}
        numberOfSteps={6}
        backButtonUrl="/form-10"
        primaryButtonLabel="Continue"
      />
    </PlaygroundShell>
  );
}
