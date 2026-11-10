import { useSearchParams } from 'react-router-dom';
import { ContactInformationForm } from '../components/cover-letter/ContactInformationForm';
import formStyles from '../components/cover-letter/ContactInformationForm.module.scss';
import { CONTINUANCE_TOTAL_STEPS } from '../components/continuance/continuanceDraftStorage';
import {
  continuanceReviewPath,
  isReviewReturn,
} from '../components/continuance/continuanceReviewReturn';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

/** Form 15 cover letter / contact information (step 1 of 11). */
export function Form15Page() {
  const [searchParams] = useSearchParams();
  const returnToReview = isReviewReturn(searchParams);
  const reviewHref = continuanceReviewPath(15);

  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <ContactInformationForm
        continueHref={returnToReview ? reviewHref : '/form-15/step-2'}
        currentStep={1}
        numberOfSteps={CONTINUANCE_TOTAL_STEPS}
        backButtonUrl={returnToReview ? reviewHref : '/form-15'}
        primaryButtonLabel="Continue"
      />
    </PlaygroundShell>
  );
}
