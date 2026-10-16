import { Form7BeforeYouBegin } from '../components/form7/Form7BeforeYouBegin';
import formStyles from '../components/form7/Form7BeforeYouBegin.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

/** Form 7 entry — Before you begin (no step indicator). */
export function Form7BeforeYouBeginPage() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <Form7BeforeYouBegin />
    </PlaygroundShell>
  );
}
