import { Form1Step6 } from '../components/form1/Form1Step6';
import formStyles from '../components/form1/Form1Step1.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

export function Form1Step6Page() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <Form1Step6 />
    </PlaygroundShell>
  );
}
