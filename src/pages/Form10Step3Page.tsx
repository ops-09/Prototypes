import { Form10Step3 } from '../components/form10/Form10Step3';
import formStyles from '../components/form10/Form10Step1.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

/** Form 10 supporting documents (step 4 of 5). */
export function Form10Step3Page() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <Form10Step3 />
    </PlaygroundShell>
  );
}
