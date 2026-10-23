import { Form11DirectorSubflow } from '../components/form11/Form11DirectorSubflow';
import formStyles from '../components/form11/Form11Step2.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

/** Form 11 add/edit director subflow for the amalgamated corporation. */
export function Form11DirectorSubflowPage() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <Form11DirectorSubflow />
    </PlaygroundShell>
  );
}
