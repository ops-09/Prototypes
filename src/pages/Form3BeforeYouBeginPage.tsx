import { Form3BeforeYouBegin } from '../components/form3/Form3BeforeYouBegin';
import formStyles from '../components/form3/Form3BeforeYouBegin.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

/** Form 3 entry — Before you begin (no step indicator). */
export function Form3BeforeYouBeginPage() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <Form3BeforeYouBegin />
    </PlaygroundShell>
  );
}
