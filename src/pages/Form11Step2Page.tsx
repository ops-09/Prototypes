import { Form11Step2 } from '../components/form11/Form11Step2';
import formStyles from '../components/form11/Form11Step2.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

/** Form 11 corporation details (step 2). Step 1 is not in the prototype yet. */
export function Form11Step2Page() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <Form11Step2 />
    </PlaygroundShell>
  );
}
