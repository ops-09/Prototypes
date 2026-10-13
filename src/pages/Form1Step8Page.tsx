import { Form1Step8 } from '../components/form1/Form1Step8';
import formStyles from '../components/form1/Form1Step1.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

export function Form1Step8Page() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <Form1Step8 />
    </PlaygroundShell>
  );
}
