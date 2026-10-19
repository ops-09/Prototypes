import { Form10CooperativeSubflow } from '../components/form10/Form10CooperativeSubflow';
import formStyles from '../components/form10/Form10Step1.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

export function Form10CooperativeSubflowPage() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <Form10CooperativeSubflow />
    </PlaygroundShell>
  );
}
