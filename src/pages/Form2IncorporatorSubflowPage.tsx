import { Form2IncorporatorSubflow } from '../components/form2/Form2IncorporatorSubflow';
import formStyles from '../components/form2/Form2Step1.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

export function Form2IncorporatorSubflowPage() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <Form2IncorporatorSubflow />
    </PlaygroundShell>
  );
}
