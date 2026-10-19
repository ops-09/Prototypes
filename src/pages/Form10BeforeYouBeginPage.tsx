import { Form10BeforeYouBegin } from '../components/form10/Form10BeforeYouBegin';
import formStyles from '../components/form10/Form10BeforeYouBegin.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

/** Form 10 entry — Before you begin (no step indicator). */
export function Form10BeforeYouBeginPage() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <Form10BeforeYouBegin />
    </PlaygroundShell>
  );
}
