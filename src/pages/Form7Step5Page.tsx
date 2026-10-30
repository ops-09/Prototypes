import { Form7Step5 } from '../components/form7/Form7Step5';
import formStyles from '../components/form7/Form7Step1.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

export function Form7Step5Page() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <Form7Step5 />
    </PlaygroundShell>
  );
}
