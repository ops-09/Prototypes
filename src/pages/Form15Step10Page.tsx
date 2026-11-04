import { ContinuanceStep10 } from '../components/continuance/ContinuanceStep10';
import formStyles from '../components/form2/Form2Step1.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

/** Form 15 review of all entered continuance information (step 10). */
export function Form15Step10Page() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <ContinuanceStep10 formId={15} />
    </PlaygroundShell>
  );
}
