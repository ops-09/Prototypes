import { Form1Step7 } from '../components/form1/Form1Step7';
import formStyles from '../components/form1/Form1Step1.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

export function Form1Step7Page() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <Form1Step7 />
    </PlaygroundShell>
  );
}
