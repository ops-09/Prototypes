import { Form11Step5 } from '../components/form11/Form11Step5';
import formStyles from '../components/form11/Form11Step2.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

/** Form 11 registered head office address of the amalgamated corporation (step 5). */
export function Form11Step5Page() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <Form11Step5 />
    </PlaygroundShell>
  );
}
