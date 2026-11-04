import { useSearchParams } from 'react-router-dom';
import { ContactInformationForm } from '../components/cover-letter/ContactInformationForm';
import formStyles from '../components/cover-letter/ContactInformationForm.module.scss';
import { isCoverLetterReviewReturn } from '../components/continuance/continuanceReviewReturn';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

export function CoverLetterPage() {
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const reviewHref = isCoverLetterReviewReturn(returnTo) ? returnTo : undefined;

  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <ContactInformationForm
        continueHref={reviewHref}
        backButtonUrl={reviewHref ?? '/'}
        primaryButtonLabel={reviewHref ? 'Continue' : 'Start'}
      />
    </PlaygroundShell>
  );
}
