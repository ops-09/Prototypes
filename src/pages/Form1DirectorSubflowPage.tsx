import { Form1DirectorSubflow } from '../components/form1/Form1DirectorSubflow';
import formStyles from '../components/form1/Form1Step1.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

export function Form1DirectorSubflowPage() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <Form1DirectorSubflow />
    </PlaygroundShell>
  );
}
