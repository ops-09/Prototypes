import { ContinuanceDirectorSubflow } from '../components/continuance/ContinuanceDirectorSubflow';
import formStyles from '../components/form2/Form2Step1.module.scss';
import { PlaygroundShell } from '../components/layout/PlaygroundShell';

/** Form 14 add/edit first director subflow. */
export function Form14DirectorSubflowPage() {
  return (
    <PlaygroundShell
      serviceTitle="For Business"
      serviceHref="/"
      mainClassName={formStyles.formMain}
    >
      <ContinuanceDirectorSubflow formId={14} />
    </PlaygroundShell>
  );
}
