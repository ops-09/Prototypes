import { Form10Step2 } from '../components/form10/Form10Step2';
import formStyles from '../components/form10/Form10Step1.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

/** Form 10 amalgamation details (step 3 of 6) — amalgamating co-operatives. */
export function Form10Step2Page() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <Form10Step2 />
    </PlaygroundShell>
  );
}
