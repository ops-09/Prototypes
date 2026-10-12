import { Form7Step1 } from '../components/form7/Form7Step1';
import formStyles from '../components/form7/Form7Step1.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

/** Form 7 co-operative details (step 2 of 5) — after cover letter. */
export function Form7Step1Page() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <Form7Step1 />
    </PlaygroundShell>
  );
}
