import { ContinuanceBeforeYouBegin } from '../components/continuance/ContinuanceBeforeYouBegin';
import formStyles from '../components/form2/Form2BeforeYouBegin.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

/** Form 15 Before you begin (unnumbered). Continue opens the cover letter. */
export function Form15InstructionsPage() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <ContinuanceBeforeYouBegin formId={15} />
    </PlaygroundShell>
  );
}
