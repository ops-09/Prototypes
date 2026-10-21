import { Form3Step5 } from '../components/form3/Form3Step5';
import formStyles from '../components/form3/Form3Step1.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

/** Form 3 review and submit (step 5 of 5). */
export function Form3Step5Page() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <Form3Step5 />
    </PlaygroundShell>
  );
}
