import { ContinuanceStep11 } from '../components/continuance/ContinuanceStep11';
import formStyles from '../components/form2/Form2Step1.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

export function Form15Step11Page() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <ContinuanceStep11 formId={15} />
    </PlaygroundShell>
  );
}
