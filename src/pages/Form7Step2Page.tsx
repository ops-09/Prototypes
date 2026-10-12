import { Form7Step2 } from '../components/form7/Form7Step2';
import formStyles from '../components/form7/Form7Step1.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

export function Form7Step2Page() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <Form7Step2 />
    </PlaygroundShell>
  );
}
