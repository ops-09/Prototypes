import { Form3Step6 } from '../components/form3/Form3Step6';
import formStyles from '../components/form3/Form3Step1.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

/** Form 3 submit (step 6 of 6). */
export function Form3Step6Page() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <Form3Step6 />
    </PlaygroundShell>
  );
}
