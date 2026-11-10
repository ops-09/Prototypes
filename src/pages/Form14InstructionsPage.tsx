import { ContinuanceBeforeYouBegin } from '../components/continuance/ContinuanceBeforeYouBegin';
import formStyles from '../components/form2/Form2BeforeYouBegin.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

/** Form 14 Before you begin. Continue opens the cover letter. */
export function Form14InstructionsPage() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <ContinuanceBeforeYouBegin formId={14} />
    </PlaygroundShell>
  );
}
