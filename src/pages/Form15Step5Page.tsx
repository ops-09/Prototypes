import { ContinuanceStep5 } from '../components/continuance/ContinuanceStep5';
import formStyles from '../components/form2/Form2Step1.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

/** Form 15 head office address via postal code lookup (step 5). */
export function Form15Step5Page() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <ContinuanceStep5 formId={15} />
    </PlaygroundShell>
  );
}
