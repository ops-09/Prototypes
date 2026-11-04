import { ContinuanceDraftSummary } from '../components/continuance/ContinuanceDraftSummary';
import formStyles from '../components/form2/Form2Step1.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

export function Form15DraftSummaryPage() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <div className="ontario-row">
        <div className="ontario-columns ontario-small-12 ontario-medium-8">
          <ContinuanceDraftSummary formId={15} />
        </div>
      </div>
    </PlaygroundShell>
  );
}
