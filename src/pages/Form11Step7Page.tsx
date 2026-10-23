import { Form11Step7 } from '../components/form11/Form11Step7';
import formStyles from '../components/form11/Form11Step2.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

/** Form 11 amalgamation agreement copy and optional supporting documents (step 7). */
export function Form11Step7Page() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <Form11Step7 />
    </PlaygroundShell>
  );
}
