import { Form2Step1 } from '../components/form2/Form2Step1';
import formStyles from '../components/form2/Form2Step1.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

/** Form 2 co-operative name and Nuans (step 3 of 10) — after co-operative details. */
export function Form2Step1Page() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <Form2Step1 />
    </PlaygroundShell>
  );
}
