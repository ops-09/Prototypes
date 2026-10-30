import { Form11Step6 } from '../components/form11/Form11Step6';
import formStyles from '../components/form11/Form11Step2.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

/** Form 11 first directors of the amalgamated corporation (step 6). */
export function Form11Step6Page() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <Form11Step6 />
    </PlaygroundShell>
  );
}
