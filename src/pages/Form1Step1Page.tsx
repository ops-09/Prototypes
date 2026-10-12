import { Form1Step1 } from '../components/form1/Form1Step1';
import formStyles from '../components/form1/Form1Step1.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

/** Form 1 co-operative name and NUANS (step 2 of 8) — after cover letter. */
export function Form1Step1Page() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <Form1Step1 />
    </PlaygroundShell>
  );
}
