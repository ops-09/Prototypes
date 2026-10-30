import { Form11Step8 } from '../components/form11/Form11Step8';
import formStyles from '../components/form11/Form11Step2.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

/** Form 11 review and generate PDF (step 8). */
export function Form11Step8Page() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <Form11Step8 />
    </PlaygroundShell>
  );
}
