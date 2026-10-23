import { Form11CorporationSubflow } from '../components/form11/Form11CorporationSubflow';
import formStyles from '../components/form11/Form11Step2.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

export function Form11CorporationSubflowPage() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <Form11CorporationSubflow />
    </PlaygroundShell>
  );
}
