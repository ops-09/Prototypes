import { Form7Step3 } from '../components/form7/Form7Step3';
import formStyles from '../components/form7/Form7Step1.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

export function Form7Step3Page() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <Form7Step3 />
    </PlaygroundShell>
  );
}
