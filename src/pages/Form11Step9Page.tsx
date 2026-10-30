import { Form11Step9 } from '../components/form11/Form11Step9';
import formStyles from '../components/form11/Form11Step2.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

/** Form 11 signed-upload and submit (step 9). */
export function Form11Step9Page() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <Form11Step9 />
    </PlaygroundShell>
  );
}
