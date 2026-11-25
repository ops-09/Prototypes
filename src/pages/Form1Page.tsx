import { ContactInformationForm } from '../components/cover-letter/ContactInformationForm';
import formStyles from '../components/cover-letter/ContactInformationForm.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';
import { FormNameCard } from '../components/shared/FormNameCard';
import { BYB_FORM_NAME } from '../components/form1/form1BeforeYouBeginContent';

/** Form 1 cover letter / contact information (step 1 of 10). */
export function Form1Page() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <ContactInformationForm
        headerCard={<FormNameCard applicationType={BYB_FORM_NAME} />}
        continueHref="/form-1/step-2"
        currentStep={1}
        numberOfSteps={10}
        backButtonUrl="/form-1"
        primaryButtonLabel="Continue"
      />
    </PlaygroundShell>
  );
}
