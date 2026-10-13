import { ContactInformationForm } from '../components/cover-letter/ContactInformationForm';
import formStyles from '../components/cover-letter/ContactInformationForm.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

/** Form 1 entry — cover letter / contact information (step 1 of 8). */
export function Form1Page() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <ContactInformationForm
        continueHref="/form-1/step-2"
        currentStep={1}
        numberOfSteps={9}
        backButtonUrl="/"
        primaryButtonLabel="Continue"
      />
    </PlaygroundShell>
  );
}
