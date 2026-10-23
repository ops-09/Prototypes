import { Form11Step4 } from '../components/form11/Form11Step4';
import formStyles from '../components/form11/Form11Step2.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

/** Form 11 amalgamated not-for-profit corporation name (step 4). */
export function Form11Step4Page() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <Form11Step4 />
    </PlaygroundShell>
  );
}
