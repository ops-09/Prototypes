import { Form2Step4 } from '../components/form2/Form2Step4';
import formStyles from '../components/form2/Form2Step1.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

export function Form2Step4Page() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <Form2Step4 />
    </PlaygroundShell>
  );
}
