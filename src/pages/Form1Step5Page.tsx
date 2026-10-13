import { Form1Step5 } from '../components/form1/Form1Step5';
import formStyles from '../components/form1/Form1Step1.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

export function Form1Step5Page() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <Form1Step5 />
    </PlaygroundShell>
  );
}
