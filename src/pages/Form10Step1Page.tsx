import { Form10Step1 } from '../components/form10/Form10Step1';
import formStyles from '../components/form10/Form10Step1.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

/** Form 10 co-operative details (step 2 of 6) — after cover letter. */
export function Form10Step1Page() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <Form10Step1 />
    </PlaygroundShell>
  );
}
