import { ContinuanceStep2 } from '../components/continuance/ContinuanceStep2';
import formStyles from '../components/form2/Form2Step1.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

/** Form 15 co-operative type, primary activity, and official email (step 2). */
export function Form15Step2Page() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <ContinuanceStep2 formId={15} />
    </PlaygroundShell>
  );
}
