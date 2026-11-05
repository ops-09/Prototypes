import { Form11BeforeYouBegin } from '../components/form11/Form11BeforeYouBegin';
import formStyles from '../components/form11/Form11BeforeYouBegin.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

/** Form 11 entry — Before you begin (no step indicator). */
export function Form11BeforeYouBeginPage() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <Form11BeforeYouBegin />
    </PlaygroundShell>
  );
}
