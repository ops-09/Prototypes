import { Form3Step4 } from '../components/form3/Form3Step4';
import formStyles from '../components/form3/Form3Step1.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

/** Form 3 resolution and requested provisions (step 4 of 5). */
export function Form3Step4Page() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <Form3Step4 />
    </PlaygroundShell>
  );
}
