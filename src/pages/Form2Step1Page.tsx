import { Form2Step1 } from '../components/form2/Form2Step1';
import formStyles from '../components/form2/Form2Step1.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

/** Form 1 co-operative name and NUANS (step 2 of 8) — after cover letter. */
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
