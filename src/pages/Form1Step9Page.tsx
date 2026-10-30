import { Form1Step9 } from '../components/form1/Form1Step9';
import formStyles from '../components/form1/Form1Step1.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

export function Form1Step9Page() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <Form1Step9 />
    </PlaygroundShell>
  );
}
