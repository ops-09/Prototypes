import { ContactInformationForm } from '../components/cover-letter/ContactInformationForm';
import formStyles from '../components/cover-letter/ContactInformationForm.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';
import { FormNameCard } from '../components/shared/FormNameCard';
import { BYB_FORM_NAME } from '../components/form10/form10BeforeYouBeginContent';

/** Form 10 cover letter / contact information (step 1 of 7). */
export function Form10Page() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <ContactInformationForm
        headerCard={<FormNameCard applicationType={BYB_FORM_NAME} />}
        continueHref="/form-10/step-2"
        currentStep={1}
        numberOfSteps={7}
        backButtonUrl="/form-10"
        primaryButtonLabel="Continue"
      />
    </PlaygroundShell>
  );
}
