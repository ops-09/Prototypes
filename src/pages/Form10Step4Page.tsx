import { Form10Step4 } from '../components/form10/Form10Step4';
import formStyles from '../components/form10/Form10Step1.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

/** Form 10 review and submission (step 6 of 6). */
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
