import { ContinuanceStep8 } from '../components/continuance/ContinuanceStep8';
import formStyles from '../components/form2/Form2Step1.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

/** Form 14 membership classes, stakeholder groups, and special provisions (step 8). */
export function Form14Step8Page() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <ContinuanceStep8 formId={14} />
    </PlaygroundShell>
  );
}
