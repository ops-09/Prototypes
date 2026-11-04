import { ContinuanceStep6 } from '../components/continuance/ContinuanceStep6';
import formStyles from '../components/form2/Form2Step1.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

/** Form 14 directors, stakeholder groups, and first-director consent (step 6). */
export function Form14Step6Page() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <ContinuanceStep6 formId={14} />
    </PlaygroundShell>
  );
}
