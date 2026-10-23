import { Form11Step3 } from '../components/form11/Form11Step3';
import formStyles from '../components/form11/Form11Step2.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

/** Form 11 amalgamation details (step 3). */
export function Form11Step3Page() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <Form11Step3 />
    </PlaygroundShell>
  );
}
