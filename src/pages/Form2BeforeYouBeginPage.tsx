import { Form2BeforeYouBegin } from '../components/form2/Form2BeforeYouBegin';
import formStyles from '../components/form2/Form2BeforeYouBegin.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

/** Form 1 entry — Before you begin (no step indicator). */
export function Form2BeforeYouBeginPage() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <Form2BeforeYouBegin />
    </PlaygroundShell>
  );
}
