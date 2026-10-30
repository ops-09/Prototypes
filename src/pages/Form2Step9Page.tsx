import { Form2Step9 } from '../components/form2/Form2Step9';
import formStyles from '../components/form2/Form2Step1.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

export function Form2Step9Page() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <Form2Step9 />
    </PlaygroundShell>
  );
}
