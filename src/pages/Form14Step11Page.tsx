import { ContinuanceStep11 } from '../components/continuance/ContinuanceStep11';
import formStyles from '../components/form2/Form2Step1.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

export function Form14Step11Page() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <ContinuanceStep11 formId={14} />
    </PlaygroundShell>
  );
}
