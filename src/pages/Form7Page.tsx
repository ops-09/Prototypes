import { ContactInformationForm } from '../components/cover-letter/ContactInformationForm';
import formStyles from '../components/cover-letter/ContactInformationForm.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

/** Form 7 entry — cover letter / contact information (step 1 of 5). */
export function Form7Page() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <ContactInformationForm
        continueHref="/form-7/step-1"
        currentStep={1}
        numberOfSteps={5}
        backButtonUrl="/"
        primaryButtonLabel="Continue"
      />
    </PlaygroundShell>
  );
}
