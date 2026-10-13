import { Form1IncorporatorSubflow } from '../components/form1/Form1IncorporatorSubflow';
import formStyles from '../components/form1/Form1Step1.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

export function Form1IncorporatorSubflowPage() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <Form1IncorporatorSubflow />
    </PlaygroundShell>
  );
}
