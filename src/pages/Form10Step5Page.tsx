import { Form10Step5 } from '../components/form10/Form10Step5';
import formStyles from '../components/form10/Form10Step1.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

/** Form 10 submit (step 7 of 7). */
export function Form10Step5Page() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <Form10Step5 />
    </PlaygroundShell>
  );
}
