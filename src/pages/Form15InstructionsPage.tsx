import { ContinuanceInstructions } from '../components/continuance/ContinuanceInstructions';
import formStyles from '../components/form2/Form2BeforeYouBegin.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

/** Form 15 instructions landing (unnumbered). */
export function Form15InstructionsPage() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <ContinuanceInstructions formId={15} />
    </PlaygroundShell>
  );
}
