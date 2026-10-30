import { Form10Step4 } from '../components/form10/Form10Step4';
import formStyles from '../components/form10/Form10Step1.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

/** Form 10 review (step 6 of 7). */
export function Form10Step4Page() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <Form10Step4 />
    </PlaygroundShell>
  );
}
