import { Form10NameChange } from '../components/form10/Form10NameChange';
import formStyles from '../components/form10/Form10Step1.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

/** Form 10 co-operative name (step 4 of 6) — change name and NUANS. */
export function Form10NameChangePage() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <Form10NameChange />
    </PlaygroundShell>
  );
}
