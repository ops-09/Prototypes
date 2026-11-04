import { ContinuanceStep4 } from '../components/continuance/ContinuanceStep4';
import formStyles from '../components/form2/Form2Step1.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

/** Form 15 original incorporating Act and OBR incorporation date (step 4). */
export function Form15Step4Page() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <ContinuanceStep4 formId={15} />
    </PlaygroundShell>
  );
}
