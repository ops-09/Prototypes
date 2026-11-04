import { ContinuanceStep10 } from '../components/continuance/ContinuanceStep10';
import formStyles from '../components/form2/Form2Step1.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

/** Form 14 review of all entered continuance information (step 10). */
export function Form14Step10Page() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <ContinuanceStep10 formId={14} />
    </PlaygroundShell>
  );
}
