import { ContinuanceStep9 } from '../components/continuance/ContinuanceStep9';
import formStyles from '../components/form2/Form2Step1.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

/** Form 15 declarations, authorizing Act, and authorization date (step 9). */
export function Form15Step9Page() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <ContinuanceStep9 formId={15} />
    </PlaygroundShell>
  );
}
