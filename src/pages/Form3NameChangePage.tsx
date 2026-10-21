import { Form3NameChange } from '../components/form3/Form3NameChange';
import formStyles from '../components/form3/Form3Step1.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

/** Form 3 corporation name change (step 3 of 5). */
export function Form3NameChangePage() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <Form3NameChange />
    </PlaygroundShell>
  );
}
