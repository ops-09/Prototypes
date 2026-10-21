import { Form3Step1 } from '../components/form3/Form3Step1';
import formStyles from '../components/form3/Form3Step1.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

/** Form 3 corporation details (step 2 of 5) — after cover letter. */
export function Form3Step1Page() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <Form3Step1 />
    </PlaygroundShell>
  );
}
