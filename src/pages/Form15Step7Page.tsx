import { ContinuanceStep7 } from '../components/continuance/ContinuanceStep7';
import formStyles from '../components/form2/Form2Step1.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

/** Form 15 restrictions, member loans, and membership fee (step 7). */
export function Form15Step7Page() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <ContinuanceStep7 formId={15} />
    </PlaygroundShell>
  );
}
