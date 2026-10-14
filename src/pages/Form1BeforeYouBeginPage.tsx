import { Form1BeforeYouBegin } from '../components/form1/Form1BeforeYouBegin';
import formStyles from '../components/form1/Form1BeforeYouBegin.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

/** Form 1 entry — Before you begin (no step indicator). */
export function Form1BeforeYouBeginPage() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <Form1BeforeYouBegin />
    </PlaygroundShell>
  );
}
