import { ContinuanceStep3 } from '../components/continuance/ContinuanceStep3';
import formStyles from '../components/form2/Form2Step1.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

/** Form 15 current corporation name and proposed co-operative name (step 3). */
export function Form15Step3Page() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <ContinuanceStep3 formId={15} />
    </PlaygroundShell>
  );
}
